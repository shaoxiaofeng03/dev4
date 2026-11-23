---
layout: home

hero:
  name: dev4
  text: Java 后端 → AI 应用 / Agent
  tagline: 20 周作战面板 · 2026.11.23 → 2027.04.11 · 每天 2h + 周末 8h
  actions:
    - theme: brand
      text: 今天做什么
      link: /checkin
    - theme: alt
      text: 20 周总览
      link: /plan/

features:
  - title: 每天知道做什么
    details: 20 周拆到每天 3–6 条任务，勾选即打卡；W1 已有日讲义，后续按阶段补齐周指南。
  - title: 打卡与复盘
    details: 热力图、连续天数、每日收获 / 卡点 / 想法、周复盘；本地写 JSON，手动提交。
  - title: 记忆卡
    details: 每周约 6 张卡，SM-2 间隔重复，只做当天到期的卡。
  - title: 项目与求职
    details: RAG、Agent 运行时、Java 企业级 AI 三个项目；求职看板与 70 题答案库。
---

<div class="home-section">

## 今天

<ClientOnly><TodayPanel /></ClientOnly>

## 快速入口

- [20 周总览](/plan/)：阶段、周主题、每周交付与验收标准
- [学习文档](/study/)：日讲义与周指南
- [打卡页](/checkin)：今天、热力图、每周进度、复盘
- [记忆卡](/cards/)：按周复习，SM-2 安排间隔
- [作品集](/projects/)：三个项目的目标、指标与失败案例
- [求职看板](/jobs)：投递、面试、反馈
- [怎么用这套站点](/guide/how-to-use)：每天 / 每周 / 每月怎么维护

## 三个原则

1. **先做，卡住再查。** 讲义是参考手册，不是从头读到尾的教材。
2. **每周只改一个变量。** 改 prompt、检索、Agent 时都一样，否则说不清是谁的功劳。
3. **项目要有评测和失败案例。** 没有评测的 demo，面试时讲不出深度。

</div>
