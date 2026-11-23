---
title: 第 4 周学习指南 · 文档解析、chunking、embedding 与向量库
description: 2026-12-14 起，P1 RAG 工程化
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 4 周学习指南 · 文档解析、chunking、embedding 与向量库

<div class="week-meta"><span>📅 2026-12-14 ~ 2026-12-20</span><span>⏱ 约 26 小时</span><span>🧭 P1 RAG 工程化</span><span>🎴 0 张记忆卡</span></div>

> 这是骨架版指南：本周的完整讲义、资料顺序和自检题会在开周前补齐。当前先按目标、清单和交付物推进。

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

## 7 天拆分建议

| 时间 | 重点 | 产出 |
| --- | --- | --- |
| 周一–周二 | 主线概念 + 最小可运行例子 | 一个能跑的最小实现 |
| 周三–周四 | 工程化：错误处理、配置、测试 | 至少一个失败路径测试 |
| 周五 | 收尾 + 文档 + 复盘 | 当天交付物 |
| 周六 | 项目日：实现与集成 | 可演示的半成品 |
| 周日 | 测试、评测、复盘、记忆卡周测 | 本周交付包 |

## 本周清单

- 解析 3 种格式：Markdown、PDF、HTML
- 对比 3 种 chunk size / overlap 的切分结果
- 用 embedding + 向量库完成入库与检索 smoke test
- 同一文档重复 ingest 结果一致（幂等）

## 本周交付

- ingest 管道
- chunk 报告
- 检索 smoke test

## 资料与阅读顺序

1. [NirDiamant/RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques)
2. [DataTalksClub/llm-zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp)

## 验收问题

- [ ] 能解释 chunk size / overlap 的取舍
- [ ] 同一文档可复现向量
- [ ] 元数据可用于过滤

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 收尾

- 回到[第 4 周计划](/plan/week-04)勾选清单。
- 周日写复盘：计划 vs 实际 / 最大卡点 / 下周只改一件事。
