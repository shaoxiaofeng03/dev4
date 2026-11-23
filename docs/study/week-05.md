---
title: 第 5 周学习指南 · 检索、hybrid、rerank 与引用
description: 2026-12-21 起，P1 RAG 工程化
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 5 周学习指南 · 检索、hybrid、rerank 与引用

<div class="week-meta"><span>📅 2026-12-21 ~ 2026-12-27</span><span>⏱ 约 26 小时</span><span>🧭 P1 RAG 工程化</span><span>🎴 0 张记忆卡</span></div>

> 这是骨架版指南：本周的完整讲义、资料顺序和自检题会在开周前补齐。当前先按目标、清单和交付物推进。

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

## 7 天拆分建议

| 时间 | 重点 | 产出 |
| --- | --- | --- |
| 周一–周二 | 主线概念 + 最小可运行例子 | 一个能跑的最小实现 |
| 周三–周四 | 工程化：错误处理、配置、测试 | 至少一个失败路径测试 |
| 周五 | 收尾 + 文档 + 复盘 | 当天交付物 |
| 周六 | 项目日：实现与集成 | 可演示的半成品 |
| 周日 | 测试、评测、复盘、记忆卡周测 | 本周交付包 |

## 本周清单

- 搭 BM25 baseline，记录 recall@k
- 做 hybrid 检索并与 baseline 对比
- 接入 rerank，比较效果与延迟
- 输出带引用（chunk id / 文档链接）的答案

## 本周交付

- 检索服务
- 20 条查询对比
- 带引用的答案

## 资料与阅读顺序

1. [NirDiamant/RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques)
2. [Ragas 文档](https://docs.ragas.io/)

## 验收问题

- [ ] recall@k 有前后对比
- [ ] 能解释 rerank 的成本
- [ ] 引用可追溯到原文

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 收尾

- 回到[第 5 周计划](/plan/week-05)勾选清单。
- 周日写复盘：计划 vs 实际 / 最大卡点 / 下周只改一件事。
