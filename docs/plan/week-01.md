---
title: 第 1 周 · 环境、Python 工程化与第一次 API 调用
description: 2026-11-23 起，P0 工程地基
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 1 周 · 环境、Python 工程化与第一次 API 调用

<div class="week-meta"><span>📅 2026-11-23 ~ 2026-11-29</span><span>⏱ 约 26 小时</span><span>🧭 P0 工程地基</span><span>🎴 10 张记忆卡</span></div>

## 本周目标

把开发环境、Python 工程化和 LLM 调用层一次打牢，后面每个项目都复用这一层。

## 为什么这样安排

零基础最容易死在先看三个月视频。第一周就动手调 API，把超时、重试、结构化输出、成本这些工程问题一次性解决。

## 核心概念

- Python 工程化：uv、src layout、pyproject、ruff、mypy、pytest
- LLM API 基本参数：token、上下文窗口、temperature、top_p
- 工程防护：超时、重试、限流、错误分类
- 结构化输出：JSON schema、校验、失败重试
- 成本与延迟：输入 / 输出 token、TTFT、总耗时

## 每日安排

> 每天 2 小时（工作日）/ 8 小时（周末）。勾选即打卡；当天的收获与卡点在学习页底部追加，周页面只读展示。

<ClientOnly><WeekTasks week="1" /></ClientOnly>

### 时间分配一览

| 日期 | 星期 | 时长 | 重点 | 当日交付 | 学习 |
| --- | --- | --- | --- | --- | --- |
| 2026-11-23 | 周一 | 2h | 环境自检与技术地图 | 环境自检报告 + 技术地图 v0 | [打开](/study/w01d1) |
| 2026-11-24 | 周二 | 2h | Python 工程化：可测试的包 | 可测试的 Python 包 | [打开](/study/w01d2) |
| 2026-11-25 | 周三 | 2h | HTTP / async 与第一次 LLM API 调用 | 可运行的 llm_client.py + 失败记录表 | [打开](/study/w01d3) |
| 2026-11-26 | 周四 | 2h | 结构化输出与失败路径 | 类型化响应 + 非法 JSON 失败测试 | [打开](/study/w01d4) |
| 2026-11-27 | 周五 | 2h | Prompt、参数与成本 | 成本表 + 参数对比 + 最佳 prompt | [打开](/study/w01d5) |
| 2026-11-28 | 周六 | 8h | 项目日：CLI chat v0.1 | 可运行 CLI + 5 个测试 + demo | [打开](/study/w01d6) |
| 2026-11-29 | 周日 | 8h | 交付日：验收、周测与复盘 | W1 交付包 + 周复盘 | [打开](/study/w01d7) |

## 本周交付

- 可复用的 llm_client.py（重试 / 超时 / 结构化输出 / 用量统计）
- CLI chat v0.1（多轮 + 流式 + 配置 + 错误处理）
- 5 个失败路径测试（空输入、超时、非法 JSON、断网、错误 key）
- 成本 / 参数对比表与技术地图 v0
- 第 1 周复盘

## 验收标准

- [ ] 能不看文档说清 temperature、top_p、max_tokens 各自的影响
- [ ] 能解释结构化输出为什么需要「校验 + 重试」，而不是「让模型别出错」
- [ ] 断网时 client 能在有限次数内失败，并给出可读错误
- [ ] 测试覆盖正常路径 + 至少 4 个失败路径

## 面试会问到

- 你理解的「AI 应用开发」和「算法工程师」有什么区别？
- 调用大模型时你做过哪些工程上的防护？
- token 是怎么算的？为什么同样的问题费用差很多？
- 结构化输出怎么保证稳定？

## 资料与阅读顺序

1. [DeepSeek API 文档](https://api-docs.deepseek.com/) — 本阶段默认调用入口
2. [Anthropic · Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — 先建立全景
3. [uv 官方文档](https://docs.astral.sh/uv/) — Python 版本、虚拟环境、依赖三合一
4. [Python 官方教程（中文）](https://docs.python.org/zh-cn/3/tutorial/) — 只查需要的章节
5. [Pydantic 文档](https://docs.pydantic.dev/) — 结构化输出校验
6. [httpx 文档](https://www.python-httpx.org/) — 超时与重试

## 记忆卡

<ClientOnly><FlashCards week="1" /></ClientOnly>

## 复盘问题

- 这周哪一天的计划没完成？原因是估时不准还是被打断？
- Python 写起来最别扭的地方是什么？下周怎么补？

## 本周复盘

> 周日晚花 30 分钟：下方会自动汇总本周的每日记录和卡点，填完保存即可。

<ClientOnly><WeekReview week="1" /></ClientOnly>

[← 返回 20 周总览](/plan/)　|　[第 1 周记忆卡](/cards/week-01)
