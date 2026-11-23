---
title: 第 10 周 · LangGraph、human-in-the-loop 与持久化
description: 2027-01-25 起，P3 Agent 工程化
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 10 周 · LangGraph、human-in-the-loop 与持久化

<div class="week-meta"><span>📅 2027-01-25 ~ 2027-01-31</span><span>⏱ 约 26 小时</span><span>🧭 P3 Agent 工程化</span><span>🎴 0 张记忆卡</span></div>

## 本周目标

用图编排 Agent，支持中断、恢复、人工审批。

## 为什么这样安排

项目二需要一个可恢复、可观测的运行时，而不是一个 while 循环。

## 核心概念

- graph / state / checkpoint
- interrupt
- human-in-the-loop
- persistence

## 本周清单

> 本周学习指南：[第 10 周学习文档](/study/week-10)。这一周按「周目标 + 清单」推进，开始前把清单拆成 7 天。

<ClientOnly><WeekTasks week="10" /></ClientOnly>

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 本周交付

- 图工作流
- checkpoint 存储
- 审批流程

## 验收标准

- [ ] 中断后可恢复
- [ ] 状态可回放
- [ ] 审批节点可插入

## 面试会问到

- 工作流和 Agent 怎么选？
- 状态怎么持久化？

## 资料与阅读顺序

1. [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
2. [microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners)

## 记忆卡

本周记忆卡待补。开周前从讲义和自检问题里提炼 6 张左右。

## 复盘问题

- 图编排比 while 循环多解决了什么？
- 恢复点在哪些地方最容易丢状态？

## 本周复盘

> 周日晚花 30 分钟：下方会自动汇总本周的每日记录和卡点，填完保存即可。

<ClientOnly><WeekReview week="10" /></ClientOnly>

[← 返回 20 周总览](/plan/)　|　[第 10 周记忆卡](/cards/week-10)
