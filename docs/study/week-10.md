---
title: 第 10 周学习指南 · LangGraph、human-in-the-loop 与持久化
description: 2027-01-25 起，P3 Agent 工程化
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 10 周学习指南 · LangGraph、human-in-the-loop 与持久化

<div class="week-meta"><span>📅 2027-01-25 ~ 2027-01-31</span><span>⏱ 约 26 小时</span><span>🧭 P3 Agent 工程化</span><span>🎴 0 张记忆卡</span></div>

> 这是骨架版指南：本周的完整讲义、资料顺序和自检题会在开周前补齐。当前先按目标、清单和交付物推进。

## 本周目标

用图编排 Agent，支持中断、恢复、人工审批。

## 为什么这样安排

项目二需要一个可恢复、可观测的运行时，而不是一个 while 循环。

## 核心概念

- graph / state / checkpoint
- interrupt
- human-in-the-loop
- persistence

## 7 天拆分建议

| 时间 | 重点 | 产出 |
| --- | --- | --- |
| 周一–周二 | 主线概念 + 最小可运行例子 | 一个能跑的最小实现 |
| 周三–周四 | 工程化：错误处理、配置、测试 | 至少一个失败路径测试 |
| 周五 | 收尾 + 文档 + 复盘 | 当天交付物 |
| 周六 | 项目日：实现与集成 | 可演示的半成品 |
| 周日 | 测试、评测、复盘、记忆卡周测 | 本周交付包 |

## 本周清单

- 用 LangGraph 重写 W7 的 Agent
- 加 checkpoint，进程重启后能恢复
- 加 interrupt + 人工审批节点
- 保存并回放一次完整执行

## 本周交付

- 图工作流
- checkpoint 存储
- 审批流程

## 资料与阅读顺序

1. [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
2. [microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners)

## 验收问题

- [ ] 中断后可恢复
- [ ] 状态可回放
- [ ] 审批节点可插入

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 收尾

- 回到[第 10 周计划](/plan/week-10)勾选清单。
- 周日写复盘：计划 vs 实际 / 最大卡点 / 下周只改一件事。
