---
title: 第 3 周 · 流式输出、日志追踪与评测入门
description: 2026-12-07 起，P0 工程地基
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 3 周 · 流式输出、日志追踪与评测入门

<div class="week-meta"><span>📅 2026-12-07 ~ 2026-12-13</span><span>⏱ 约 26 小时</span><span>🧭 P0 工程地基</span><span>🎴 0 张记忆卡</span></div>

## 本周目标

让 LLM 调用可观测：流式、trace、成本、延迟、错误率。

## 为什么这样安排

进入 RAG 前先把可观测性做好，否则后面调优无法归因。

## 核心概念

- streaming
- trace / span
- token accounting
- eval harness
- TTFT 与总延迟

## 本周清单

> 本周学习指南：[第 3 周学习文档](/study/week-03)。这一周按「周目标 + 清单」推进，开始前把清单拆成 7 天。

<ClientOnly><WeekTasks week="3" /></ClientOnly>

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 本周交付

- 流式 chat
- trace JSON
- 评测报告 v1

## 验收标准

- [ ] 能定位一次慢请求的瓶颈
- [ ] 能解释 TTFT 与总延迟
- [ ] 评测结果可重复

## 面试会问到

- 怎么监控一个 LLM 应用？
- 流式输出的原理和坑？

## 资料与阅读顺序

1. [OpenTelemetry GenAI 语义约定](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
2. [Langfuse 文档](https://langfuse.com/docs)

## 记忆卡

本周记忆卡待补。开周前从讲义和自检问题里提炼 6 张左右。

## 复盘问题

- 可观测性做到了什么程度？
- 哪项指标最能指导下一步？

## 本周复盘

> 周日晚花 30 分钟：下方会自动汇总本周的每日记录和卡点，填完保存即可。

<ClientOnly><WeekReview week="3" /></ClientOnly>

[← 返回 20 周总览](/plan/)　|　[第 3 周记忆卡](/cards/week-03)
