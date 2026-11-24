"""CLI / 客户端的失败测试：全部用 httpx.MockTransport，不碰真实网络。

五个场景：正常流式、空输入、超时、非法 JSON、断网。
"""

from __future__ import annotations

import json
from collections.abc import Callable
from typing import Any

import httpx
import pytest

from w1.cli import ChatSession, explain_error, run_repl
from w1.config import Settings
from w1.errors import NetworkError, ResponseError


def make_settings(**overrides: Any) -> Settings:
    values: dict[str, Any] = {
        "api_key": "test-key",
        "base_url": "https://example.test",
        "model": "test-model",
        "system_prompt": "你是测试助手",
        "timeout": 1.0,
        "max_retries": 0,  # 测试里不 sleep
    }
    values.update(overrides)
    return Settings(**values)


def sse_body(*deltas: str) -> bytes:
    events = [
        f"data: {json.dumps({'choices': [{'delta': {'content': delta}}]})}\n\n"
        for delta in deltas
    ]
    return ("".join(events) + "data: [DONE]\n\n").encode()


Handler = Callable[[httpx.Request], httpx.Response]


def make_session(
    handler: Handler,
) -> tuple[ChatSession, list[str], list[httpx.Request]]:
    requests: list[httpx.Request] = []

    def recording_handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return handler(request)

    emitted: list[str] = []
    session = ChatSession(
        make_settings(), transport=httpx.MockTransport(recording_handler), emit=emitted.append
    )
    return session, emitted, requests


def test_normal_stream_builds_history_and_payload() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=sse_body("你", "好"))

    session, emitted, requests = make_session(handler)
    reply = session.answer("  什么是 RAG？  ")

    assert reply == "你好"
    assert "".join(emitted) == "你好"
    assert session.history == [
        {"role": "user", "content": "什么是 RAG？"},
        {"role": "assistant", "content": "你好"},
    ]

    body = json.loads(requests[0].content)
    assert body["stream"] is True
    assert body["model"] == "test-model"
    assert body["messages"][0] == {"role": "system", "content": "你是测试助手"}
    assert body["messages"][1] == {"role": "user", "content": "什么是 RAG？"}


def test_blank_lines_are_ignored() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=sse_body("不该被调用"))

    lines = iter(["", "   ", "\t", "/exit"])
    session, _, requests = make_session(handler)
    output: list[str] = []

    def fake_read(_prompt: str = "") -> str:
        return next(lines)

    code = run_repl(session, read=fake_read, write=output.append)

    assert code == 0
    assert requests == []
    assert session.history == []
    assert "再见。" in output


def test_timeout_is_explained_and_history_rolled_back() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("timed out", request=request)

    session, _, _ = make_session(handler)

    with pytest.raises(NetworkError) as excinfo:
        session.answer("在吗？")

    assert "超时" in str(excinfo.value)
    assert "超时" in explain_error(excinfo.value)
    assert session.history == []  # 失败的轮次不留在历史里


def test_invalid_json_raises_response_error() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=b"data: {not json\n\n")

    session, _, _ = make_session(handler)

    with pytest.raises(ResponseError) as excinfo:
        session.answer("随便问问")

    assert "JSON" in str(excinfo.value)
    assert session.history == []


def test_network_down_is_reported() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("connection refused", request=request)

    session, _, _ = make_session(handler)

    with pytest.raises(NetworkError) as excinfo:
        session.answer("hello")

    assert "连不上" in str(excinfo.value)
    assert session.history == []
