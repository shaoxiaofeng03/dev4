---
title: 本地保存与同步
---

# 本地保存与同步

dev4 **不使用 GitHub Token**。打卡和复习进度只做两件事：

1. 本地 `npm run dev` 时，页面通过开发服务器写入仓库里的 JSON。
2. 你手动 `git commit` / `git push`，GitHub Actions 重新部署 Pages。

## 数据写到哪里

| 数据 | 文件 |
| --- | --- |
| 打卡、日志、周复盘 | `docs/data/checkins.json` |
| 记忆卡复习状态（SM-2） | `docs/data/review-state.json` |

这两个文件会进 git，所以换电脑、重装环境都能恢复。

## 每天怎么操作

1. `npm run dev`
2. 打开 `http://localhost:5173/dev4/checkin`
3. 正常勾选任务、写记录；页面显示「已写入（时间）」即成功
4. 结束前提交：

```bash
git add docs/data/checkins.json docs/data/review-state.json
git commit -m "chore(checkin): 打卡 2026-11-23"
git push
```

打卡页的「复制命令」按钮会生成当天日期版本的命令。

## 为什么没有自动 push

- 自动 push 需要把写权限放进浏览器或开发服务器，复杂且有风险。
- 手动提交让你能检查 diff：确认没有把密钥、临时文件一起提交。
- 一天一个 commit，历史干净，周复盘时可以直接看本周改了哪些数据。

## 线上 Pages 是只读的

GitHub Pages 是静态站点，没有写接口：

- 线上勾选只会写当前设备的 `localStorage`。
- 刷新、换设备后不会自动同步。
- 手机建议只看内容；打卡在电脑上做。

换设备时用打卡页的「导出 / 导入 JSON」。

## 断网怎么办

页面优先写 `localStorage`，断网也能继续用。恢复网络后：

- 本地 dev 模式下，改动会继续写入文件。
- 如果浏览器提示写入失败，点「立即保存」重试。

## 文件冲突

如果你在多台设备上同时改同一个 JSON：

- 先 `git pull --rebase`。
- 冲突时保留两边条目，按日期 / ID 合并。
- 打卡数据的合并规则见[数据格式](/guide/data-format)。
