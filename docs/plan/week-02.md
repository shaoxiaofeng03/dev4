---
title: 第 2 周 · Prompt、结构化输出与函数调用
description: 2026-11-30 起，P0 工程地基
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 2 周 · Prompt、结构化输出与函数调用

<div class="week-meta"><span>📅 2026-11-30 ~ 2026-12-06</span><span>⏱ 约 26 小时</span><span>🧭 P0 工程地基</span><span>🎴 0 张记忆卡</span></div>

## 本周目标

把 prompt 从「试出来」变成可评测、可回滚的工程资产，并掌握 function calling。

## 为什么这样安排

第二周开始，模型输出要进入程序，不能靠肉眼判断好坏；prompt 也要有版本和对比。

## 核心概念

- prompt 版本化
- few-shot 与指令结构
- JSON schema / JSON mode
- function calling
- 评测基线

## 本周清单

> 本周学习指南：[第 2 周学习文档](/study/week-02)。这一周按「周目标 + 清单」推进，开始前把清单拆成 7 天。

<ClientOnly><WeekTasks week="2" /></ClientOnly>

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 本周交付

- prompt 版本库
- function calling demo
- 20 条评测集 + 对比报告

## 验收标准

- [ ] 能说清 JSON mode 与 function calling 的区别
- [ ] prompt 每次改动都有对比数据
- [ ] 评测集覆盖正常与失败输入

## 面试会问到

- 你怎么评测一个 prompt 的好坏？
- 结构化输出怎么保证稳定？

## 资料与阅读顺序

1. [OpenAI · Function calling](https://platform.openai.com/docs/guides/function-calling)
2. [Anthropic · Tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)

## 记忆卡

本周记忆卡待补。开周前从讲义和自检问题里提炼 6 张左右。

## 复盘问题

- prompt 改动是靠感觉还是靠数据？
- 这周哪个失败路径最有价值？

## 本周复盘

> 周日晚花 30 分钟：下方会自动汇总本周的每日记录和卡点，填完保存即可。

<ClientOnly><WeekReview week="2" /></ClientOnly>

[← 返回 20 周总览](/plan/)　|　[第 2 周记忆卡](/cards/week-02)
