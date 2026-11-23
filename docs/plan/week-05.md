---
title: 第 5 周 · 检索、hybrid、rerank 与引用
description: 2026-12-21 起，P1 RAG 工程化
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 5 周 · 检索、hybrid、rerank 与引用

<div class="week-meta"><span>📅 2026-12-21 ~ 2026-12-27</span><span>⏱ 约 26 小时</span><span>🧭 P1 RAG 工程化</span><span>🎴 0 张记忆卡</span></div>

## 本周目标

把召回做成可调参的系统：dense / sparse / hybrid + rerank + citation。

## 为什么这样安排

只做向量检索会遇到专有名词和数字查不准，hybrid + rerank 是常见解法。

## 核心概念

- BM25
- hybrid fusion
- rerank
- citation
- recall@k

## 本周清单

> 本周学习指南：[第 5 周学习文档](/study/week-05)。这一周按「周目标 + 清单」推进，开始前把清单拆成 7 天。

<ClientOnly><WeekTasks week="5" /></ClientOnly>

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 本周交付

- 检索服务
- 20 条查询对比
- 带引用的答案

## 验收标准

- [ ] recall@k 有前后对比
- [ ] 能解释 rerank 的成本
- [ ] 引用可追溯到原文

## 面试会问到

- hybrid search 怎么融合？
- rerank 模型怎么选？

## 资料与阅读顺序

1. [NirDiamant/RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques)
2. [Ragas 文档](https://docs.ragas.io/)

## 记忆卡

本周记忆卡待补。开周前从讲义和自检问题里提炼 6 张左右。

## 复盘问题

- 哪种检索策略提升最大？
- 引用有没有真正被用户需要？

## 本周复盘

> 周日晚花 30 分钟：下方会自动汇总本周的每日记录和卡点，填完保存即可。

<ClientOnly><WeekReview week="5" /></ClientOnly>

[← 返回 20 周总览](/plan/)　|　[第 5 周记忆卡](/cards/week-05)
