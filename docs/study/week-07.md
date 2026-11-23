---
title: 第 7 周学习指南 · ReAct、tool calling 与状态机
description: 2027-01-04 起，P2 Agent 基础
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 7 周学习指南 · ReAct、tool calling 与状态机

<div class="week-meta"><span>📅 2027-01-04 ~ 2027-01-10</span><span>⏱ 约 26 小时</span><span>🧭 P2 Agent 基础</span><span>🎴 0 张记忆卡</span></div>

> 这是骨架版指南：本周的完整讲义、资料顺序和自检题会在开周前补齐。当前先按目标、清单和交付物推进。

## 本周目标

不依赖框架，手写一个可解释的 Agent 循环。

## 为什么这样安排

框架会掩盖状态和错误处理；先手写一遍，后面用 LangGraph 才知道它在做什么。

## 核心概念

- ReAct
- tool schema
- state machine
- max steps
- observation

## 7 天拆分建议

| 时间 | 重点 | 产出 |
| --- | --- | --- |
| 周一–周二 | 主线概念 + 最小可运行例子 | 一个能跑的最小实现 |
| 周三–周四 | 工程化：错误处理、配置、测试 | 至少一个失败路径测试 |
| 周五 | 收尾 + 文档 + 复盘 | 当天交付物 |
| 周六 | 项目日：实现与集成 | 可演示的半成品 |
| 周日 | 测试、评测、复盘、记忆卡周测 | 本周交付包 |

## 本周清单

- 手写 ReAct 循环，输出 thought / action / observation
- 实现 3 个工具：搜索、计算、读文件
- 加 max steps、超时、工具失败重试
- 保存完整 trace，能回放一次任务

## 本周交付

- 手写 Agent
- 3 个工具
- 失败测试 + trace

## 资料与阅读顺序

1. [Anthropic · Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
2. [ReAct 论文](https://arxiv.org/abs/2210.03629)

## 验收问题

- [ ] 能解释 ReAct 的三段式
- [ ] 工具失败可恢复
- [ ] 有步数 / 时间上限

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 收尾

- 回到[第 7 周计划](/plan/week-07)勾选清单。
- 周日写复盘：计划 vs 实际 / 最大卡点 / 下周只改一件事。
