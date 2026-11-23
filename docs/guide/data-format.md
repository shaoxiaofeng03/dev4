---
title: 数据格式
---

# 数据格式

站点有两类数据：

- **内容数据**：`content/plan.json`、`content/cards/*.json`、`content/study/*.md`，由你编辑。
- **进度数据**：`docs/data/checkins.json`、`docs/data/review-state.json`，由页面写入，可以手动编辑。

## checkins.json

```json
{
  "version": 1,
  "note": "打卡数据。可手动编辑，格式见 docs/guide/data-format.md",
  "entries": [
    {
      "date": "2026-11-23",
      "items": ["w1d1-t1", "w1d1-t3"],
      "note": "旧版单条笔记，可为空",
      "minutes": 0,
      "retro": "周复盘文本，只有周日条目会用到",
      "logs": [
        {
          "id": "l_abc123",
          "at": "2026-11-23T12:00:00.000Z",
          "tag": "harvest",
          "text": "今天把环境装好了"
        }
      ],
      "updatedAt": "2026-11-23T12:00:00.000Z"
    }
  ]
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `date` | `YYYY-MM-DD` |
| `items` | 已勾选的任务 ID，来自 `plan.json` 的 `tasks[].id` 或 `checklist[].id` |
| `logs` | 当日追加记录，`tag` 为 `harvest` / `blocker` / `idea` |
| `retro` | 周复盘文本 |
| `updatedAt` | 合并时用于判断较新记录 |

## review-state.json

```json
{
  "version": 1,
  "note": "记忆卡复习状态（SM-2）",
  "cards": {
    "w1-c1": {
      "ease": 2.5,
      "interval": 3,
      "due": "2026-11-26",
      "reps": 2,
      "lapses": 0,
      "last": "2026-11-23"
    }
  }
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `ease` | 难度系数，越高越容易 |
| `interval` | 下次复习间隔（天） |
| `due` | 到期日 |
| `reps` | 连续记住次数 |
| `lapses` | 遗忘次数 |
| `last` | 上次复习日 |

## 合并规则

导入 JSON 或文件与浏览器草稿合并时：

- 打卡：按日期合并，`items` 取并集，笔记取较新者，日志按 ID 去重。
- 复习：同一张卡取 `last` 较新的记录。

## 不要手改生成文件

`docs/data/plan.json`、`docs/data/cards.json` 是构建生成的；改 `content/` 下的源文件，然后运行 `npm run content`。
