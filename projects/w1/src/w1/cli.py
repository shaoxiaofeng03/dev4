"""w1 CLI 学习助手：多轮对话 + 流式输出 + 配置文件 + 可解释的报错。

运行：
    uv run w1-chat                # 交互式
    uv run w1-chat --once "什么是 RAG？"   # 只问一次
    uv run w1-chat --no-stream    # 关闭流式，便于复制输出

命令（交互模式）：
    /help  /history  /clear  /exit
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Callable
from pathlib import Path

import httpx

from w1.config import Settings, load_settings
from w1.errors import APIError, ConfigError, LLMError
from w1.llm_client import Message, complete, stream_chat

HELP_TEXT = """/help     查看帮助
/history  查看本次对话历史
/clear    清空对话历史
/exit     退出（也可以用 /quit、exit、quit）
Ctrl+C    中断正在生成的回答，已生成的部分会保留在历史里"""


def explain_error(exc: Exception) -> str:
    """把异常翻译成「原因 + 怎么办」，这是这个 CLI 演示的重点之一。"""
    if isinstance(exc, APIError):
        if exc.status_code == 401:
            return "认证失败（HTTP 401）：DEEPSEEK_API_KEY 无效或过期。检查 .env 里的 key。"
        if exc.status_code == 402:
            return "余额不足（HTTP 402）：去 DeepSeek 控制台充值后再试。"
        if exc.status_code == 429:
            return "被限流了（HTTP 429）：请求太频繁，等几秒再发。"
        if exc.status_code >= 500:
            return f"服务端错误（HTTP {exc.status_code}）：不是你的问题，稍后重试或换模型。"
        return f"请求被拒绝：{exc}。检查模型名 model 是否可用。"
    if isinstance(exc, ConfigError):
        return f"配置错误：{exc}"
    if isinstance(exc, LLMError):
        return str(exc)
    return f"意外错误：{type(exc).__name__}: {exc}"


def _print_delta(text: str) -> None:
    print(text, end="", flush=True)


class ChatSession:
    """一次多轮对话。只依赖 Settings + 可选 transport，方便测试替换网络。"""

    def __init__(
        self,
        settings: Settings,
        *,
        transport: httpx.BaseTransport | None = None,
        stream: bool = True,
        emit: Callable[[str], None] | None = None,
    ) -> None:
        self.settings = settings
        self.transport = transport
        self.stream = stream
        self.emit = emit or _print_delta
        self.history: list[Message] = []

    def build_messages(self) -> list[Message]:
        messages: list[Message] = []
        if self.settings.system_prompt:
            messages.append({"role": "system", "content": self.settings.system_prompt})
        messages.extend(self.history)
        return messages

    def answer(self, text: str) -> str:
        """追加一轮用户消息并拿到回复；失败时回滚用户消息，历史保持干净。"""
        text = text.strip()
        if not text:
            raise ValueError("空输入")
        self.history.append({"role": "user", "content": text})
        parts: list[str] = []
        try:
            if self.stream:
                for delta in stream_chat(
                    self.build_messages(), self.settings, transport=self.transport
                ):
                    parts.append(delta)
                    self.emit(delta)
                reply = "".join(parts)
            else:
                reply = complete(self.build_messages(), self.settings, transport=self.transport)
                self.emit(reply)
        except KeyboardInterrupt:
            # 中断时保留已经生成的部分，不让用户白白重问。
            if parts:
                self.history.append({"role": "assistant", "content": "".join(parts)})
            else:
                self.history.pop()
            raise
        except LLMError:
            self.history.pop()
            raise
        self.history.append({"role": "assistant", "content": reply})
        return reply

    def clear(self) -> None:
        self.history.clear()


def format_history(session: ChatSession) -> str:
    if not session.history:
        return "（还没有对话历史）"
    lines: list[str] = []
    for message in session.history:
        speaker = "你" if message["role"] == "user" else "AI"
        lines.append(f"{speaker}> {message['content']}")
    return "\n".join(lines)


def _default_read(prompt: str) -> str:
    return input(prompt)


def _default_write(text: str) -> None:
    print(text)


def run_repl(
    session: ChatSession,
    *,
    read: Callable[[str], str] = _default_read,
    write: Callable[[str], None] = _default_write,
) -> int:
    """交互循环。read/write 可注入，测试里用假输入跑完整流程。"""
    write("w1 学习助手已启动。输入 /help 看命令，Ctrl+C 中断回答，/exit 退出。")
    while True:
        try:
            line = read("\n你> ")
        except (EOFError, KeyboardInterrupt):
            write("\n再见。")
            return 0

        text = line.strip()
        if not text:
            continue  # 空输入直接忽略，不占用对话历史
        command = text.lower()
        if command in {"/exit", "/quit", "exit", "quit"}:
            write("再见。")
            return 0
        if command in {"/help", "help", "?"}:
            write(HELP_TEXT)
            continue
        if command == "/clear":
            session.clear()
            write("已清空对话历史。")
            continue
        if command == "/history":
            write(format_history(session))
            continue

        write("AI> ")
        try:
            session.answer(text)
        except KeyboardInterrupt:
            write("\n[已中断] 已生成的部分保留在历史里，可以继续追问。")
        except LLMError as exc:
            write(f"\n[错误] {explain_error(exc)}")
            write("提示：失败的这一轮没有写进历史，修正后直接重发即可。")
        else:
            write("")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="w1-chat",
        description="W1 CLI 学习助手：多轮对话、流式输出、配置文件。",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=None,
        help="TOML 配置文件路径（默认读 ./w1.toml，也可用 W1_CONFIG 指定）",
    )
    parser.add_argument("--model", default=None, help="覆盖配置里的模型名")
    parser.add_argument("--timeout", type=float, default=None, help="请求超时秒数")
    parser.add_argument("--no-stream", action="store_true", help="关闭流式输出")
    parser.add_argument("--once", metavar="PROMPT", default=None, help="只问一次然后退出")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    overrides: dict[str, object] = {"model": args.model, "timeout": args.timeout}
    try:
        settings = load_settings(args.config, overrides=overrides)
    except ConfigError as exc:
        print(f"[配置错误] {exc}", file=sys.stderr)
        print("提示：先复制 .env.example 为 .env 并填入 DEEPSEEK_API_KEY。", file=sys.stderr)
        return 2

    session = ChatSession(settings, stream=not args.no_stream)

    if args.once is not None:
        try:
            session.answer(args.once)
        except LLMError as exc:
            print(f"\n[错误] {explain_error(exc)}", file=sys.stderr)
            return 1
        except KeyboardInterrupt:
            print("\n[已中断]", file=sys.stderr)
            return 130
        print()
        return 0

    return run_repl(session)


if __name__ == "__main__":
    raise SystemExit(main())
