---
title: 打卡
---

# 打卡与进度

今天的任务、连续天数、热力图、每周完成度都在这一页。本地 `npm run dev` 时，勾选会**直接写入** `docs/data/checkins.json` 和 `docs/data/review-state.json`；线上 GitHub Pages 只读。

<ClientOnly><CheckinDashboard /></ClientOnly>

## 数据存在哪

| 数据 | 位置 | 说明 |
| --- | --- | --- |
| 打卡记录 | `docs/data/checkins.json` | 勾选任务、每日记录（收获 / 卡点 / 想法）、周复盘 |
| 复习进度 | `docs/data/review-state.json` | 每张卡的间隔、到期日、难度系数 |
| 站点内容 | `content/` → `docs/` | 由 `scripts/build-content.mjs` 生成 |

两条规则：

1. **本机优先。** 断网也能打卡，页面不会因为网络失败而丢数据。
2. **同步是手动的。** 本地开发时自动写文件，但不会自动 commit / push；你确认 diff 后手动提交。

## 每天的用法

1. 打开这一页，看「今天」区块，逐条勾掉；也可以直接在周页面勾选。
2. 学完在当天学习页底部「今日记录」发一条（收获 / 卡点 / 想法），可追加多条。
3. 周日晚在周页面底部的「本周复盘」块里填写并保存，然后提交数据文件。

## 提交命令

```bash
git add docs/data/checkins.json docs/data/review-state.json
git commit -m "chore(checkin): 打卡 2026-11-23"
git push
```

## 常见问题

**勾错了怎么办？** 再点一次取消，记录会从当天条目里移除。

**换了电脑 / 清了缓存怎么办？** 在旧设备上「导出 JSON」，在新设备「导入 JSON」；如果数据已经提交到仓库，直接 `git pull` 后刷新即可。

**线上勾选会同步吗？** 不会。线上只写当前浏览器的 `localStorage`，这是静态站的限制。
