# dev4 · Java 后端 → AI 应用 / Agent 开发 · 20 周作战面板

一套**可执行、可打卡、可复习**的学习站点。内容以 Markdown / JSON 存储，用 VitePress（Vite）构建，部署在 GitHub Pages。

- 周期：2026-11-23 → 2027-04-11（20 周，约 26 小时/周）
- 目标：2027 年 4 月拿到 AI 应用 / Agent 开发方向 offer
- 岗位侧重：AI 应用开发 + Agent 平台 / 基础设施
- 站点：<https://shaoxiaofeng03.github.io/dev4/>

## 本地开发

```bash
npm install
npm run dev      # 生成内容 + http://localhost:5173/dev4/
npm run build    # 构建到 docs/.vitepress/dist
npm run preview  # 预览构建产物
```

修改内容：

1. 路线、任务、每周交付：`content/plan.json`
2. 日/周讲义：`content/study/*.md`
3. 记忆卡：`content/cards/week-XX.json`
4. 指南：`content/guide/*.md`
5. 然后运行 `npm run content`（`npm run dev` 和 `npm run build` 会自动执行）。

## 打卡与复习

- 本地 `npm run dev` 时，打卡和复习进度会写入：
  - `docs/data/checkins.json`
  - `docs/data/review-state.json`
- 数据同时保存在浏览器 `localStorage`，断网也能用。
- 同步方式：**手动提交**。页面上会给出命令：

```bash
git add docs/data/checkins.json docs/data/review-state.json
git commit -m "chore(checkin): 打卡 2026-11-23"
git push
```

- 不使用 GitHub Token；GitHub Pages 是只读站点。

## 目录结构

```
content/                 # 唯一内容源
├── plan.json            # 阶段、20 周、W1 每日任务
├── study/               # 日讲义 / 周指南
├── cards/               # 每周记忆卡
└── guide/               # 使用指南
docs/                    # VitePress 站点
├── .vitepress/          # 配置、主题组件、本地写文件插件
├── data/                # 生成索引 + 打卡/复习数据（提交）
├── plan/ study/ cards/ guide/
└── projects/ jobs.md
scripts/build-content.mjs
.github/workflows/deploy.yml
```

## 部署

推送到 `main` 后 GitHub Actions 自动构建并发布。首次需要在仓库 **Settings → Pages** 把 Source 设为 **GitHub Actions**。
