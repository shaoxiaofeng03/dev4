---
title: 部署到 GitHub Pages
---

# 部署到 GitHub Pages

站点用 VitePress 构建，GitHub Actions 自动发布到 Pages。

## 仓库准备

- 仓库：`shaoxiaofeng03/dev4`
- 分支：`main`
- Pages 地址：`https://shaoxiaofeng03.github.io/dev4/`

VitePress 配置里已经设置：

```ts
base: '/dev4/'
```

如果仓库改名，记得同步修改 `docs/.vitepress/config.mts` 里的 `base` 和 `head` 里的 favicon 路径。

## 首次启用 Pages

1. 把代码推到 `main`。
2. 打开仓库 **Settings → Pages**。
3. 把 **Source** 设为 **GitHub Actions**。
4. 等第一次 Actions 跑完，访问 Pages 地址。

## 工作流

`.github/workflows/deploy.yml` 做三件事：

1. `npm ci`
2. `npm run build`（会先运行 `scripts/build-content.mjs`）
3. 上传 `docs/.vitepress/dist` 并部署

## 本地检查构建

推送前建议先跑一遍：

```bash
npm run build
npm run preview
```

`preview` 默认在 `http://localhost:4173/dev4/`。

## 常见问题

**页面 404 / 资源路径错**：检查 `base` 是否和仓库名一致。

**Actions 失败**：看 `npm run content` 是否报内容校验错误；本地先跑 `npm run build`。

**Pages 是只读的**：这是预期行为。打卡写入只在本地 `npm run dev` 时发生，见[本地保存与同步](/guide/local-sync)。
