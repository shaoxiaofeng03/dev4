---
title: 第 2 周学习指南 · Prompt、结构化输出与函数调用
description: 2026-11-30 起，P0 工程地基
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 2 周学习指南 · Prompt、结构化输出与函数调用

<div class="week-meta"><span>📅 2026-11-30 ~ 2026-12-06</span><span>⏱ 约 26 小时</span><span>🧭 P0 工程地基</span><span>🎴 0 张记忆卡</span></div>

> 这是骨架版指南：本周的完整讲义、资料顺序和自检题会在开周前补齐。当前先按目标、清单和交付物推进。

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

## 7 天拆分建议

| 时间 | 重点 | 产出 |
| --- | --- | --- |
| 周一–周二 | 主线概念 + 最小可运行例子 | 一个能跑的最小实现 |
| 周三–周四 | 工程化：错误处理、配置、测试 | 至少一个失败路径测试 |
| 周五 | 收尾 + 文档 + 复盘 | 当天交付物 |
| 周六 | 项目日：实现与集成 | 可演示的半成品 |
| 周日 | 测试、评测、复盘、记忆卡周测 | 本周交付包 |

## 本周清单

- 建 prompt 版本表，至少 3 个版本可切换
- 用同一组 10 个问题对比 3 个 prompt 版本
- 做一个 function calling demo：2 个工具 + 参数校验
- 建 20 条评测集，记录通过率与失败原因

## 本周交付

- prompt 版本库
- function calling demo
- 20 条评测集 + 对比报告

## 资料与阅读顺序

1. [OpenAI · Function calling](https://platform.openai.com/docs/guides/function-calling)
2. [Anthropic · Tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)

## 验收问题

- [ ] 能说清 JSON mode 与 function calling 的区别
- [ ] prompt 每次改动都有对比数据
- [ ] 评测集覆盖正常与失败输入

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 收尾

- 回到[第 2 周计划](/plan/week-02)勾选清单。
- 周日写复盘：计划 vs 实际 / 最大卡点 / 下周只改一件事。
