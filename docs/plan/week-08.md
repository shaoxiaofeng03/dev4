---
title: 第 8 周 · 工具设计、错误恢复、memory 与 MCP
description: 2027-01-11 起，P2 Agent 基础
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 8 周 · 工具设计、错误恢复、memory 与 MCP

<div class="week-meta"><span>📅 2027-01-11 ~ 2027-01-17</span><span>⏱ 约 26 小时</span><span>🧭 P2 Agent 基础</span><span>🎴 0 张记忆卡</span></div>

## 本周目标

让 Agent 在真实工具上跑稳：工具设计、重试、记忆、MCP。

## 为什么这样安排

Agent 的失败大多不是模型笨，而是工具契约和恢复策略没设计好。

## 核心概念

- 工具命名与参数
- 幂等性
- retry / circuit breaker
- memory
- MCP

## 本周清单

> 本周学习指南：[第 8 周学习文档](/study/week-08)。这一周按「周目标 + 清单」推进，开始前把清单拆成 7 天。

<ClientOnly><WeekTasks week="8" /></ClientOnly>

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 本周交付

- 工具注册表
- memory 模块
- MCP demo
- 失败案例集

## 验收标准

- [ ] 工具失败可恢复
- [ ] 记忆不污染后续任务
- [ ] 能讲清 MCP 解决什么

## 面试会问到

- 工具怎么设计？
- memory 怎么存、怎么删？

## 资料与阅读顺序

1. [Model Context Protocol](https://modelcontextprotocol.io/)
2. [Anthropic · Tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)

## 记忆卡

本周记忆卡待补。开周前从讲义和自检问题里提炼 6 张左右。

## 复盘问题

- 哪个工具最难设计？
- 记忆带来了哪些新问题？

## 本周复盘

> 周日晚花 30 分钟：下方会自动汇总本周的每日记录和卡点，填完保存即可。

<ClientOnly><WeekReview week="8" /></ClientOnly>

[← 返回 20 周总览](/plan/)　|　[第 8 周记忆卡](/cards/week-08)
