# w1 · CLI 学习助手

W1 的收尾项目：把环境自检、HTTP 客户端、配置、错误处理拼成一个能演示的命令行学习助手。

- 多轮对话：历史在进程内保留，`/clear` 清空，`/history` 查看。
- 流式输出：逐字打印，Ctrl+C 可中断，已生成的部分会保留。
- 配置：TOML 配置文件 + 环境变量 + 命令行参数，优先级明确。
- 错误处理：超时、断网、401、429、5xx、非法 JSON 都翻译成「原因 + 怎么办」。
- 测试：5 个失败场景全部用 `httpx.MockTransport` 模拟，不访问真实网络。

## 环境要求

- Python 3.13+
- [uv](https://docs.astral.sh/uv/)
- 一个 DeepSeek API key（`sk-` 开头）

## 安装

```bash
cd projects/w1
uv sync
```

## 配置

**1. 填 API key（必须）**

```bash
cp .env.example .env
# 编辑 .env，把 DEEPSEEK_API_KEY 换成你的 key
```

**2. 可选：改模型、超时等**

```bash
cp w1.toml.example w1.toml
```

`w1.toml` 支持的键：`model`、`base_url`、`system_prompt`、`timeout`、`max_retries`。
键名拼错会直接报错并列出支持的键，不会静默忽略。

**优先级**（后者覆盖前者）：

| 顺序 | 来源 | 例子 |
| --- | --- | --- |
| 1 | `w1.toml`（或 `--config` / `W1_CONFIG` 指定） | `model = "deepseek-flash"` |
| 2 | 环境变量 | `DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL` |
| 3 | 命令行参数 | `--model deepseek-flash --timeout 60` |

API key 只从环境变量 `DEEPSEEK_API_KEY` 读取，不写进配置文件，避免提交到 git。

## 运行

```bash
# 交互式（默认流式）
uv run w1-chat

# 只问一次，适合演示或脚本
uv run w1-chat --once "用三句话解释什么是 RAG"

# 关闭流式（输出一次性出现，方便复制）
uv run w1-chat --no-stream

# 指定配置文件 / 覆盖参数
uv run w1-chat --config ./w1.toml --model deepseek-flash --timeout 60
```

交互模式下的命令：

```text
/help     查看帮助
/history  查看本次对话历史
/clear    清空对话历史
/exit     退出（也可以 /quit、exit、quit）
Ctrl+C    中断正在生成的回答，已生成的部分保留在历史里
```

也可以直接跑客户端 demo：

```bash
uv run python -m w1.llm_client
```

## 失败排查

| 现象 | 原因 | 怎么办 |
| --- | --- | --- |
| `[配置错误] 缺少环境变量 DEEPSEEK_API_KEY` | 没有 `.env` 或没填 key | 复制 `.env.example` 为 `.env` 并填 key |
| `认证失败（HTTP 401）` | key 无效、过期或复制时多了空格 | 重新复制 key，确认 `sk-` 开头、没有引号 |
| `余额不足（HTTP 402）` | 账户没余额 | 去 DeepSeek 控制台充值 |
| `被限流了（HTTP 429）` | 请求太频繁 | 等几秒再发；客户端会自动重试 2 次 |
| `服务端错误（HTTP 5xx）` | 对方服务异常 | 稍后重试；客户端会自动重试 2 次 |
| `请求超时` | 网络慢 / 服务端慢 | `--timeout 60` 调大超时，或检查代理 |
| `连不上 API 服务器` | 断网、代理拦截、`base_url` 写错 | 检查网络；`base_url` 不要加 `/v1` |
| `流里的数据不是合法 JSON` | 代理/网关改写了返回内容 | 关掉代理或换网络；`--no-stream` 试试 |
| `配置文件 ... 不是合法 TOML` | 手写配置出错 | 按报错里的行号修，或先删掉 `w1.toml` 用默认值 |
| 中文乱码（Windows） | 控制台编码是 GBK | `chcp 65001`，或在 Windows Terminal 里跑 |

失败的那一轮不会写进对话历史，修正后直接重发即可。

## 测试与检查

```bash
uv run pytest -q
uv run mypy src tests
uv run ruff check .
```

`tests/test_cli.py` 覆盖五个场景：正常流式、空输入、超时、非法 JSON、断网。
测试用 `httpx.MockTransport` 注入假响应，不需要 key、不联网、不 sleep。

## 目录

```text
projects/w1/
├── pyproject.toml          # 依赖 + w1-chat 命令入口
├── w1.toml.example         # 配置文件模板
├── .env.example            # 环境变量模板
├── src/w1/
│   ├── cli.py              # 交互循环、命令、错误翻译
│   ├── config.py           # TOML + 环境变量 + 命令行覆盖
│   ├── errors.py           # LLMError 及其子类
│   ├── llm_client.py       # complete() / stream_chat()，含重试
│   └── exercises.py        # W1 的 10 个热身练习
└── tests/
    ├── test_cli.py         # 5 个失败场景
    └── test_exercises.py   # 练习验收测试
```

## 相关：W1 热身练习

`src/w1/exercises.py` 里的 10 个 TODO 是 W1 的热身题，验收测试见 `tests/test_exercises.py`，
规则：只补 TODO，不改函数签名和测试。

```bash
uv run pytest -q tests/test_exercises.py
```
