import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localDataPlugin } from './plugins/localData';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(__dirname, '..');
const dataDir = path.join(docsDir, 'data');

let plan: {
  meta: { title: string; subtitle: string };
  phases: { id: string; name: string; weeks: [number, number] }[];
  weeks: {
    n: number;
    phase: string;
    theme: string;
    detail?: boolean;
    days?: { focus: string }[];
    cards?: unknown[];
  }[];
} = { meta: { title: '', subtitle: '' }, phases: [], weeks: [] };

try {
  plan = JSON.parse(fs.readFileSync(path.join(dataDir, 'plan.json'), 'utf8'));
} catch {
  console.warn('[vitepress] 未找到 docs/data/plan.json，请先运行 npm run content');
}

const pad = (n: number) => String(n).padStart(2, '0');
const shortTheme = (theme: string) => (theme.length > 30 ? `${theme.slice(0, 29)}…` : theme);

const planSidebar = [
  { text: '20 周总览', link: '/plan/' },
  ...plan.phases.map((phase) => ({
    text: phase.name,
    collapsed: false,
    items: plan.weeks
      .filter((w) => w.n >= phase.weeks[0] && w.n <= phase.weeks[1])
      .map((w) => ({
        text: `W${w.n} · ${shortTheme(w.theme)}`,
        link: `/plan/week-${pad(w.n)}`,
      })),
  })),
];

const studySidebar = [
  { text: '学习文档总览', link: '/study/' },
  ...plan.phases.map((phase) => ({
    text: phase.name,
    collapsed: false,
    items: plan.weeks
      .filter((w) => w.n >= phase.weeks[0] && w.n <= phase.weeks[1])
      .map((w) =>
        w.detail && w.days?.length
          ? {
              text: `W${w.n} · ${shortTheme(w.theme)}`,
              collapsed: true,
              items: w.days.map((d, i) => ({
                text: `D${i + 1} ${d.focus}`,
                link: `/study/w${pad(w.n)}d${i + 1}`,
              })),
            }
          : { text: `W${w.n} · ${shortTheme(w.theme)}`, link: `/study/week-${pad(w.n)}` }
      ),
  })),
];

const cardsSidebar = [
  { text: '记忆卡总览', link: '/cards/' },
  {
    text: '按周复习',
    collapsed: false,
    items: plan.weeks.map((w) => ({
      text: `W${w.n} · ${w.cards?.length ?? 0} 张`,
      link: `/cards/week-${pad(w.n)}`,
    })),
  },
];

const guideSidebar = [
  {
    text: '指南',
    items: [
      { text: '怎么用这套站点', link: '/guide/how-to-use' },
      { text: 'AI 技术地图', link: '/guide/ai-map' },
      { text: '数据格式', link: '/guide/data-format' },
      { text: '本地保存与同步', link: '/guide/local-sync' },
      { text: '部署到 GitHub Pages', link: '/guide/deploy' },
    ],
  },
];

export default defineConfig({
  base: '/dev4/',
  lang: 'zh-CN',
  title: 'dev4 · AI 应用 / Agent 20 周',
  description:
    'Java 后端转 AI 应用 / Agent 开发的 20 周作战面板：每日任务、打卡、记忆卡、项目交付与求职看板。',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }],
    ['meta', { name: 'theme-color', content: '#5b6cff' }],
    ['link', { rel: 'icon', href: '/dev4/favicon.svg' }],
  ],
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    logo: '/logo.svg',
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdatedText: '最后更新',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    nav: [
      { text: '总览', link: '/plan/' },
      { text: '学习', link: '/study/' },
      { text: '打卡', link: '/checkin' },
      { text: '记忆卡', link: '/cards/' },
      { text: '作品集', link: '/projects/' },
      { text: '求职', link: '/jobs' },
      { text: '指南', link: '/guide/how-to-use' },
    ],
    sidebar: {
      '/plan/': planSidebar,
      '/study/': studySidebar,
      '/cards/': cardsSidebar,
      '/guide/': guideSidebar,
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/shaoxiaofeng03/dev4' }],
    footer: {
      message: '20 周作战面板 · 内容与进度均以 Markdown / JSON 存储',
      copyright: 'Built with VitePress',
    },
  },
  vite: {
    plugins: [
      localDataPlugin({
        checkins: path.join(dataDir, 'checkins.json'),
        review: path.join(dataDir, 'review-state.json'),
      }),
    ],
  },
});
