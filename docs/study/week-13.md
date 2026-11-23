---
title: 第 13 周学习指南 · Spring AI / LangChain4j 与多模型路由
description: 2027-02-15 起，P4 Java 企业级 AI
---
<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->


# 第 13 周学习指南 · Spring AI / LangChain4j 与多模型路由

<div class="week-meta"><span>📅 2027-02-15 ~ 2027-02-21</span><span>⏱ 约 26 小时</span><span>🧭 P4 Java 企业级 AI</span><span>🎴 0 张记忆卡</span></div>

> 这是骨架版指南：本周的完整讲义、资料顺序和自检题会在开周前补齐。当前先按目标、清单和交付物推进。

## 本周目标

把 RAG / Agent 能力接进 Java 服务，做多模型路由。

## 为什么这样安排

Java 后端经验是差异化，不是包袱。

## 核心概念

- Spring AI
- LangChain4j
- 多模型路由
- fallback

## 7 天拆分建议

| 时间 | 重点 | 产出 |
| --- | --- | --- |
| 周一–周二 | 主线概念 + 最小可运行例子 | 一个能跑的最小实现 |
| 周三–周四 | 工程化：错误处理、配置、测试 | 至少一个失败路径测试 |
| 周五 | 收尾 + 文档 + 复盘 | 当天交付物 |
| 周六 | 项目日：实现与集成 | 可演示的半成品 |
| 周日 | 测试、评测、复盘、记忆卡周测 | 本周交付包 |

## 本周清单

- 建一个 Spring Boot 服务，接入 Spring AI 或 LangChain4j
- 调用项目一的 RAG 接口
- 实现两个模型的路由与 fallback
- 写集成测试，覆盖主模型失败

## 本周交付

- Java AI 服务
- 多模型路由 demo
- 集成测试

## 资料与阅读顺序

1. [spring-projects/spring-ai](https://github.com/spring-projects/spring-ai)
2. [langchain4j/langchain4j](https://github.com/langchain4j/langchain4j)

## 验收问题

- [ ] 能切换模型
- [ ] 主模型失败可降级
- [ ] 接口风格与存量系统一致

## 每日固定节奏

> 不随本周主题变化，按工作日 2h / 周末 8h 执行：

- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。
- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。
- 工作日 50 分钟主线；周末按本周清单推进。
- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。

## 收尾

- 回到[第 13 周计划](/plan/week-13)勾选清单。
- 周日写复盘：计划 vs 实际 / 最大卡点 / 下周只改一件事。
