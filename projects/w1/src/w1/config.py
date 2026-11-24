"""配置加载：TOML 配置文件 + 环境变量 + 命令行覆盖。

优先级（后者覆盖前者）：
    1. w1.toml（或 --config / W1_CONFIG 指定的文件）
    2. 环境变量 DEEPSEEK_BASE_URL / DEEPSEEK_MODEL
    3. load_settings(overrides=...) 传入的命令行参数

API key 只从环境变量 DEEPSEEK_API_KEY 读取（.env 由 python-dotenv 加载），
不写进配置文件，避免密钥被提交到 git。
"""

from __future__ import annotations

import os
import tomllib
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path

from w1.errors import ConfigError

DEFAULT_CONFIG_FILENAME = "w1.toml"
DEFAULT_BASE_URL = "https://api.deepseek.com"
DEFAULT_MODEL = "deepseek-flash"
DEFAULT_SYSTEM_PROMPT = "你是一个简洁、准确的中文编程学习助手。回答尽量短，必要时给例子。"
DEFAULT_TIMEOUT_SECONDS = 30.0
DEFAULT_MAX_RETRIES = 2

ALLOWED_KEYS = frozenset({"model", "base_url", "system_prompt", "timeout", "max_retries"})
ENV_OVERRIDES = {"base_url": "DEEPSEEK_BASE_URL", "model": "DEEPSEEK_MODEL"}


@dataclass(frozen=True)
class Settings:
    """一次会话需要的全部配置，运行时不可变。"""

    api_key: str
    base_url: str = DEFAULT_BASE_URL
    model: str = DEFAULT_MODEL
    system_prompt: str = DEFAULT_SYSTEM_PROMPT
    timeout: float = DEFAULT_TIMEOUT_SECONDS
    max_retries: int = DEFAULT_MAX_RETRIES

    @property
    def headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}


def load_settings(
    config_path: Path | None = None,
    *,
    env: Mapping[str, str] | None = None,
    overrides: Mapping[str, object] | None = None,
) -> Settings:
    """组装 Settings；任何配置问题都抛 ConfigError，且信息里带上怎么改。"""
    environ = os.environ if env is None else env
    values = _file_values(config_path, environ)

    for key, env_name in ENV_OVERRIDES.items():
        env_value = environ.get(env_name, "").strip()
        if env_value:
            values[key] = env_value

    for key, value in (overrides or {}).items():
        if value is not None:
            values[key] = value

    api_key = environ.get("DEEPSEEK_API_KEY", "").strip()
    if not api_key:
        raise ConfigError(
            "缺少环境变量 DEEPSEEK_API_KEY。"
            "把 .env.example 复制为 .env 并填入你的 key，或先 export DEEPSEEK_API_KEY=..."
        )

    return Settings(
        api_key=api_key,
        base_url=_as_str(values, "base_url", DEFAULT_BASE_URL).rstrip("/"),
        model=_as_str(values, "model", DEFAULT_MODEL),
        system_prompt=_as_str(values, "system_prompt", DEFAULT_SYSTEM_PROMPT),
        timeout=_as_float(values, "timeout", DEFAULT_TIMEOUT_SECONDS),
        max_retries=_as_int(values, "max_retries", DEFAULT_MAX_RETRIES),
    )


def _file_values(config_path: Path | None, environ: Mapping[str, str]) -> dict[str, object]:
    path = _resolve_path(config_path, environ)
    if path is None:
        return {}
    if not path.is_file():
        raise ConfigError(
            f"找不到配置文件：{path}。"
            "检查 --config / W1_CONFIG 的路径，或删掉该参数使用默认配置。"
        )
    try:
        raw = tomllib.loads(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ConfigError(f"读不了配置文件 {path}：{exc}") from exc
    except tomllib.TOMLDecodeError as exc:
        raise ConfigError(f"配置文件 {path} 不是合法 TOML：{exc}") from exc

    unknown = set(raw) - ALLOWED_KEYS
    if unknown:
        supported = "、".join(sorted(ALLOWED_KEYS))
        raise ConfigError(
            f"配置文件 {path} 里有不认识的键：{'、'.join(sorted(unknown))}。支持的键：{supported}。"
        )
    return dict(raw)


def _resolve_path(config_path: Path | None, environ: Mapping[str, str]) -> Path | None:
    if config_path is not None:
        return config_path
    env_path = environ.get("W1_CONFIG", "").strip()
    if env_path:
        return Path(env_path)
    default = Path(DEFAULT_CONFIG_FILENAME)
    return default if default.is_file() else None


def _as_str(values: Mapping[str, object], key: str, default: str) -> str:
    value = values.get(key, default)
    if not isinstance(value, str) or not value.strip():
        raise ConfigError(f"配置项 {key} 必须是非空字符串，当前是 {value!r}")
    return value.strip()


def _as_float(values: Mapping[str, object], key: str, default: float) -> float:
    value = values.get(key, default)
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value <= 0:
        raise ConfigError(f"配置项 {key} 必须是正数（秒），当前是 {value!r}")
    return float(value)


def _as_int(values: Mapping[str, object], key: str, default: int) -> int:
    value = values.get(key, default)
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ConfigError(f"配置项 {key} 必须是 >= 0 的整数，当前是 {value!r}")
    return value
