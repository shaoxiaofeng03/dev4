---
title: 第 4 周 · 文档解析、chunking、embedding 与向量库
description: 2026-12-14 起，P1 RAG 工程化
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 4 周 · 文档解析、chunking、embedding 与向量库

<div class="week-meta"><span>📅 2026-12-14 ~ 2026-12-20</span><span>⏱ 约 26 小时</span><span>🧭 P1 RAG 工程化</span><span>🎴 0 张记忆卡</span></div>

## 本周目标

搭出可复现的 ingest 管道：解析 → 清洗 → 切分 → 向量化 → 入库。

## 为什么这样安排

RAG 的效果一半取决于 ingest，而不是模型。

## 核心概念

- 文档解析
- chunking 策略
- embedding 模型
- 向量索引
- 元数据

## 本周清单

> 本周学习指南：[第 4 周学习文档](/study/week-04)。这一周按「周目标 + 清单」推进，开始前把清单拆成 7 天。

<ClientOnly><WeekTasks week="4" /></ClientOnly>

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 本周交付

- ingest 管道
- chunk 报告
- 检索 smoke test

## 验收标准

- [ ] 能解释 chunk size / overlap 的取舍
- [ ] 同一文档可复现向量
- [ ] 元数据可用于过滤

## 面试会问到

- chunking 怎么做？
- embedding 模型怎么选？

## 资料与阅读顺序

1. [NirDiamant/RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques)
2. [DataTalksClub/llm-zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp)

## 记忆卡

本周记忆卡待补。开周前从讲义和自检问题里提炼 6 张左右。

## 复盘问题

- ingest 哪一步最耗时？
- 切分策略有什么数据支撑？

## 本周复盘

> 周日晚花 30 分钟：下方会自动汇总本周的每日记录和卡点，填完保存即可。

<ClientOnly><WeekReview week="4" /></ClientOnly>

[← 返回 20 周总览](/plan/)　|　[第 4 周记忆卡](/cards/week-04)
