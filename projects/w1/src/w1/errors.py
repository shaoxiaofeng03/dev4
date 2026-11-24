"""LLM 调用的失败类型。

原则：所有“可预期的失败”都继承 LLMError，CLI 只需要 catch 一个基类，
再用 explain_error() 把技术错误翻译成用户看得懂的话。
"""

from __future__ import annotations


class LLMError(Exception):
    """所有 LLM 调用失败的基类。"""


class ConfigError(LLMError):
    """配置缺失或不合法（缺 API key、TOML 写错、键名拼错等）。"""


class NetworkError(LLMError):
    """连不上服务器，或请求超时。"""


class APIError(LLMError):
    """服务端返回了 4xx/5xx。"""

    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(f"接口返回 HTTP {status_code}：{detail}")
        self.status_code = status_code
        self.detail = detail


class ResponseError(LLMError):
    """HTTP 通了，但返回的 JSON / 结构不符合预期。"""
