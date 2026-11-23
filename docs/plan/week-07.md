---
title: 第 7 周 · ReAct、tool calling 与状态机
description: 2027-01-04 起，P2 Agent 基础
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 7 周 · ReAct、tool calling 与状态机

<div class="week-meta"><span>📅 2027-01-04 ~ 2027-01-10</span><span>⏱ 约 26 小时</span><span>🧭 P2 Agent 基础</span><span>🎴 0 张记忆卡</span></div>

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

## 本周清单

> 本周学习指南：[第 7 周学习文档](/study/week-07)。这一周按「周目标 + 清单」推进，开始前把清单拆成 7 天。

<ClientOnly><WeekTasks week="7" /></ClientOnly>

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 本周交付

- 手写 Agent
- 3 个工具
- 失败测试 + trace

## 验收标准

- [ ] 能解释 ReAct 的三段式
- [ ] 工具失败可恢复
- [ ] 有步数 / 时间上限

## 面试会问到

- ReAct 原理？
- 什么时候不该用 Agent？

## 资料与阅读顺序

1. [Anthropic · Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
2. [ReAct 论文](https://arxiv.org/abs/2210.03629)

## 记忆卡

本周记忆卡待补。开周前从讲义和自检问题里提炼 6 张左右。

## 复盘问题

- Agent 为什么走错路？
- 手写循环暴露了哪些框架问题？

## 本周复盘

> 周日晚花 30 分钟：下方会自动汇总本周的每日记录和卡点，填完保存即可。

<ClientOnly><WeekReview week="7" /></ClientOnly>

[← 返回 20 周总览](/plan/)　|　[第 7 周记忆卡](/cards/week-07)
