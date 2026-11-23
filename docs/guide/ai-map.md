---
title: AI 技术地图
---

# AI 技术地图

这张图用来回答两个问题：**我现在在哪一层？下一周要补哪一层？**

## 四层结构

```
应用形态    问答 / 知识库 / Agent / 工作流 / 企业集成
              ↑
编排层      Prompt / 状态机 / 循环 / 人工审批 / 多智能体
              ↑
能力层      检索 / 工具 / 记忆 / 评测 / 护栏 / 可观测
              ↑
基础设施    LLM API / 向量库 / 日志 / 成本 / 部署
```

## 和 20 周的对应

| 层 | 阶段 | 关键产出 |
| --- | --- | --- |
| 基础设施 | P0（W1–W3） | LLM 客户端、结构化输出、日志、评测基线 |
| 能力层：检索 | P1（W4–W6） | ingest 管道、hybrid 检索、rerank、RAG 评测 |
| 能力层：工具 / 记忆 / 评测 | P2（W7–W9） | 手写 Agent、工具注册、memory、MCP、guardrails |
| 编排层 | P3（W10–W12） | LangGraph、checkpoint、human-in-the-loop、项目二 |
| 应用形态：企业集成 | P4（W13–W14） | Spring AI / LangChain4j、路由、审计、降级 |
| 生产化 / 求职 | P5–P6（W15–W20） | Docker、可观测、作品集、八股、投递、offer |

## 参考项目怎么用

每个阶段只选**一条主线**，其余只当参考实现：

| 阶段 | 主线 | 参考 |
| --- | --- | --- |
| P0 | `microsoft/generative-ai-for-beginners` | `anthropics/anthropic-cookbook`、`openai/openai-cookbook` |
| P1 | `DataTalksClub/llm-zoomcamp` | `NirDiamant/RAG_Techniques`、`explodinggradients/ragas` |
| P2 | `microsoft/ai-agents-for-beginners` | `huggingface/agents-course`、`NirDiamant/GenAI_Agents` |
| P3 | `langchain-ai/langgraph` | `microsoft/autogen`、`crewAIInc/crewAI` |
| P4 | `spring-projects/spring-ai` | `langchain4j/langchain4j`（含 examples） |
| P5–P6 | `wdndev/llm_interview_note` | `donnemartin/system-design-primer`、`ByteByteGoHq/system-design-101` |

> 收藏不是学习。每个阶段结束时，问自己：我能不能用自己的项目讲清楚这一层？

## 三个不要

1. **不要同时学多套课程**：主线一套，其余查漏。
2. **不要只做 demo 不做评测**：没有评测就没有工程能力。
3. **不要丢掉 Java**：Spring AI / LangChain4j 是企业落地里的差异化。
