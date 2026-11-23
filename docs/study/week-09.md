---
title: 第 9 周学习指南 · Agent 评测、guardrails 与成本
description: 2027-01-18 起，P2 Agent 基础
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 9 周学习指南 · Agent 评测、guardrails 与成本

<div class="week-meta"><span>📅 2027-01-18 ~ 2027-01-24</span><span>⏱ 约 26 小时</span><span>🧭 P2 Agent 基础</span><span>🎴 0 张记忆卡</span></div>

> 这是骨架版指南：本周的完整讲义、资料顺序和自检题会在开周前补齐。当前先按目标、清单和交付物推进。

## 本周目标

给 Agent 建评测集、护栏和成本预算。

## 为什么这样安排

Agent 的自由度越高，越需要评测和边界。

## 核心概念

- task success rate
- trajectory eval
- guardrails
- 预算
- human approval

## 7 天拆分建议

| 时间 | 重点 | 产出 |
| --- | --- | --- |
| 周一–周二 | 主线概念 + 最小可运行例子 | 一个能跑的最小实现 |
| 周三–周四 | 工程化：错误处理、配置、测试 | 至少一个失败路径测试 |
| 周五 | 收尾 + 文档 + 复盘 | 当天交付物 |
| 周六 | 项目日：实现与集成 | 可演示的半成品 |
| 周日 | 测试、评测、复盘、记忆卡周测 | 本周交付包 |

## 本周清单

- 建 30 条任务评测，记录成功率与步数
- 加 guardrails：危险工具、敏感信息、循环检测
- 给每次任务设 token / 金额预算
- 关键操作加人工审批

## 本周交付

- Agent 评测报告
- guardrails
- 成本看板

## 资料与阅读顺序

1. [promptfoo](https://github.com/promptfoo/promptfoo)
2. [OWASP Top 10 for LLM](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

## 验收问题

- [ ] 任务成功率可复现
- [ ] 能拦截危险调用
- [ ] 成本可控

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 收尾

- 回到[第 9 周计划](/plan/week-09)勾选清单。
- 周日写复盘：计划 vs 实际 / 最大卡点 / 下周只改一件事。
