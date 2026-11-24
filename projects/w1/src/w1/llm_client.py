"""DeepSeek 客户端：非流式 complete() 与流式 stream_chat()。

设计原则：
- 所有可预期的失败都抛 w1.errors.LLMError 的子类，上层只 catch 一个基类。
- 429 / 5xx / 网络错误自动重试（指数退避 + 随机抖动）。
- 401 / 400 / 非法 JSON 不重试，因为重试也不会变好。
- 流式输出一旦开始吐字就不再重试，避免用户看到重复内容。

用法（项目根目录下）：
    uv run python -m w1.llm_client
"""

from __future__ import annotations

import asyncio
import json
import logging
import random
import time
from collections.abc import Iterator
from typing import Any

import httpx
from dotenv import load_dotenv

from w1.config import Settings, load_settings
from w1.errors import APIError, LLMError, NetworkError, ResponseError

load_dotenv()

logger = logging.getLogger(__name__)

Message = dict[str, str]

BACKOFF_BASE_SECONDS = 1.0
# 429 限流和 5xx 服务端错误值得重试；401/400 这类重试也没用。
RETRYABLE_STATUSES = frozenset({429, 500, 502, 503, 504})


def build_payload(settings: Settings, messages: list[Message], *, stream: bool) -> dict[str, Any]:
    return {"model": settings.model, "messages": messages, "stream": stream}


def backoff_delay(attempt: int) -> float:
    """指数退避 + full jitter：第 attempt 次重试前在 [0, base * 2^attempt) 内随机等待。"""
    ceiling = BACKOFF_BASE_SECONDS * 2**attempt
    return random.uniform(0, ceiling)


def complete(
    messages: list[Message],
    settings: Settings | None = None,
    *,
    transport: httpx.BaseTransport | None = None,
) -> str:
    """非流式调用，返回完整回复文本。transport 参数用于测试注入。"""
    settings = settings or load_settings()
    payload = build_payload(settings, messages, stream=False)
    attempt = 0
    with _client(settings, transport) as client:
        while True:
            try:
                resp = client.post("/chat/completions", json=payload)
                if resp.status_code >= 400:
                    raise _api_error(resp)
                return _extract_text(_json_body(resp))
            except httpx.HTTPError as exc:
                err = _as_llm_error(exc)
                if not _retryable(err, attempt, settings.max_retries):
                    raise err from exc
            except LLMError as exc:
                if not _retryable(exc, attempt, settings.max_retries):
                    raise
                err = exc
            _wait_before_retry(err, attempt)
            attempt += 1


def stream_chat(
    messages: list[Message],
    settings: Settings | None = None,
    *,
    transport: httpx.BaseTransport | None = None,
) -> Iterator[str]:
    """流式调用：逐段 yield 回复文本（SSE 的 delta.content）。

    注意：已经 yield 过内容后不再重试——网络断了就让错误抛出去，
    由 CLI 保留已输出的部分，而不是悄悄重发导致内容重复。
    """
    settings = settings or load_settings()
    payload = build_payload(settings, messages, stream=True)
    attempt = 0
    with _client(settings, transport) as client:
        while True:
            emitted = False
            try:
                with client.stream("POST", "/chat/completions", json=payload) as resp:
                    if resp.status_code >= 400:
                        resp.read()
                        raise _api_error(resp)
                    for delta in _iter_sse(resp.iter_lines()):
                        emitted = True
                        yield delta
                return
            except httpx.HTTPError as exc:
                err = _as_llm_error(exc)
                if emitted or not _retryable(err, attempt, settings.max_retries):
                    raise err from exc
            except LLMError as exc:
                if emitted or not _retryable(exc, attempt, settings.max_retries):
                    raise
                err = exc
            _wait_before_retry(err, attempt)
            attempt += 1


def chat(prompt: str, settings: Settings | None = None) -> str:
    """单轮便捷接口，等价于 complete([{"role": "user", "content": prompt}])。"""
    return complete([{"role": "user", "content": prompt}], settings)


async def achat(prompt: str, settings: Settings | None = None) -> str:
    """异步包装：在线程池里跑同步 chat()，避免阻塞事件循环。"""
    return await asyncio.to_thread(chat, prompt, settings)


def _client(settings: Settings, transport: httpx.BaseTransport | None) -> httpx.Client:
    return httpx.Client(
        base_url=settings.base_url,
        headers=settings.headers,
        timeout=settings.timeout,
        transport=transport,
    )


def _retryable(err: LLMError, attempt: int, max_retries: int) -> bool:
    if attempt >= max_retries:
        return False
    if isinstance(err, NetworkError):
        return True
    if isinstance(err, APIError):
        return err.status_code in RETRYABLE_STATUSES
    return False


def _wait_before_retry(err: LLMError, attempt: int) -> None:
    delay = backoff_delay(attempt)
    logger.warning("请求失败（%s），%.2fs 后进行第 %d 次重试", err, delay, attempt + 1)
    time.sleep(delay)


def _as_llm_error(exc: httpx.HTTPError) -> LLMError:
    if isinstance(exc, httpx.TimeoutException):
        return NetworkError("请求超时：网络不稳定或服务端响应慢，可以调大 timeout 后重试。")
    if isinstance(exc, httpx.ConnectError):
        return NetworkError("连不上 API 服务器：检查网络、代理，以及 base_url 是否正确。")
    return NetworkError(f"网络错误：{type(exc).__name__}: {exc}")


def _api_error(resp: httpx.Response) -> APIError:
    detail = ""
    try:
        body = resp.json()
    except ValueError:
        body = None
    if isinstance(body, dict):
        error = body.get("error")
        if isinstance(error, dict) and isinstance(error.get("message"), str):
            detail = error["message"]
    if not detail:
        detail = resp.text[:200].strip() or resp.reason_phrase
    return APIError(resp.status_code, detail)


def _json_body(resp: httpx.Response) -> Any:
    try:
        return resp.json()
    except ValueError as exc:
        raise ResponseError(f"返回内容不是合法 JSON：{resp.text[:120]!r}") from exc


def _extract_text(data: Any) -> str:
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise ResponseError("返回结构不符合预期：缺少 choices[0].message.content") from exc
    if not isinstance(content, str):
        raise ResponseError("返回结构不符合预期：content 不是字符串")
    return content


def _iter_sse(lines: Iterator[str]) -> Iterator[str]:
    """解析 SSE：只关心 data: 行，遇到 [DONE] 结束。"""
    for raw in lines:
        line = raw.strip()
        if not line or line.startswith(":") or not line.startswith("data:"):
            continue
        data = line[len("data:") :].strip()
        if data == "[DONE]":
            return
        try:
            event = json.loads(data)
        except json.JSONDecodeError as exc:
            raise ResponseError(f"流里的数据不是合法 JSON：{data[:80]!r}") from exc
        if not isinstance(event, dict):
            raise ResponseError("流里的数据结构不符合预期（不是 JSON 对象）")
        error = event.get("error")
        if error is not None:
            raise ResponseError(f"服务端在流里返回错误：{error}")
        choices = event.get("choices")
        if not isinstance(choices, list) or not choices:
            continue
        first = choices[0]
        if not isinstance(first, dict):
            continue
        delta = first.get("delta")
        if not isinstance(delta, dict):
            continue
        content = delta.get("content")
        if isinstance(content, str) and content:
            yield content


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)  # 直接运行时能看到重试日志
    for chunk in stream_chat([{"role": "user", "content": "用三句话解释什么是 RAG。"}]):
        print(chunk, end="", flush=True)
    print()
