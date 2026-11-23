// 内容生成器：唯一数据源在 content/ 目录，本脚本生成 docs/ 下的页面与索引。
// 用法：node scripts/build-content.mjs
import { mkdir, writeFile, access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs');
const content = path.join(root, 'content');
const dataDir = path.join(docs, 'data');

const GEN_NOTE =
  '<!-- 本页由 scripts/build-content.mjs 自动生成，请勿直接编辑。改 content/ 下的数据源后重新运行 npm run content -->\n';

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function n2(n) {
  return String(n).padStart(2, '0');
}

function escapeCell(text) {
  return String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return WEEKDAYS[(new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7];
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function exists(file) {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (err) {
    if (fallback !== undefined) return fallback;
    throw new Error(`读取失败 ${file}：${err.message}`);
  }
}

function renderResources(resources = []) {
  const lines = ['## 资料与阅读顺序', ''];
  if (!resources.length) {
    lines.push('本周没有额外阅读材料，按清单推进即可。', '');
    return lines;
  }
  resources.forEach((item, i) => {
    lines.push(`${i + 1}. [${item.title}](${item.url})${item.note ? ` — ${item.note}` : ''}`);
  });
  lines.push('');
  return lines;
}

function renderChecklist(title, items = []) {
  const lines = [`## ${title}`, ''];
  for (const item of items) lines.push(`- [ ] ${item}`);
  lines.push('');
  return lines;
}

function renderBullets(title, items = []) {
  const lines = [`## ${title}`, ''];
  for (const item of items) lines.push(`- ${item}`);
  lines.push('');
  return lines;
}

function fixedRhythmMd() {
  return [
    '## 每日固定节奏',
    '',
    '> 不随本周主题变化，按工作日 2h / 周末 8h 执行：',
    '',
    '- 25 分钟算法：W1–W6 从数组、二分、哈希表起步；W7 起每周至少 3 次，错题优先。',
    '- 15–25 分钟记忆卡：当天到期 + 本周卡；周日做一次周测。',
    '- 工作日 50 分钟主线；周末按本周清单推进。',
    '- 每天结束写一句记录：学到什么 / 卡在哪 / 明天怎么调。',
    '',
  ];
}

function dayStubMd(week, day, index) {
  const key = `w${n2(week.n)}d${index + 1}`;
  const lines = [
    '---',
    `title: W${week.n} ${weekdayOf(day.date)} · ${day.focus}`,
    `description: ${day.date} · 第 ${week.n} 周学习文档（骨架版）`,
    '---',
    GEN_NOTE,
    '',
    `# W${week.n} ${weekdayOf(day.date)} · ${day.focus}`,
    '',
    `<div class="week-meta"><span>📅 ${day.date}</span><span>⏱ ${day.hours}h</span><span>🧭 ${week.phase}</span><span>🗓 W${week.n}</span></div>`,
    '',
    '> 本节课讲义还在补充；先按下面的动手清单和计划页任务推进。',
    '',
    '## 今天要解决什么',
    '',
    day.focus,
    '',
    '## 动手清单',
    '',
    ...day.tasks.map((t) => `- [ ] ${t.text}${t.min ? `（${t.min} 分钟）` : ''}`),
    '',
    '## 今日产出',
    '',
    day.output?.replace(/^今日交付：/, '') ?? '',
    '',
    '## 今日记录',
    '',
    `<ClientOnly><DayLog date="${day.date}" /></ClientOnly>`,
    '',
    `[← 第 ${week.n} 周计划](/plan/week-${n2(week.n)})　|　[本周记忆卡](/cards/week-${n2(week.n)})`,
    '',
  ];
  return { key, text: lines.join('\n') };
}

function weekStudyFallbackMd(week) {
  const lines = [
    '---',
    `title: 第 ${week.n} 周学习指南 · ${week.theme}`,
    `description: ${week.start} 起，${week.phase}`,
    '---',
    GEN_NOTE,
    '',
    `# 第 ${week.n} 周学习指南 · ${week.theme}`,
    '',
    `<div class="week-meta"><span>📅 ${week.start} ~ ${week.end}</span><span>⏱ 约 ${week.hours} 小时</span><span>🧭 ${week.phase}</span><span>🎴 ${week.cards?.length ?? 0} 张记忆卡</span></div>`,
    '',
    '> 这是骨架版指南：本周的完整讲义、资料顺序和自检题会在开周前补齐。当前先按目标、清单和交付物推进。',
    '',
    '## 本周目标',
    '',
    week.goal,
    '',
    '## 为什么这样安排',
    '',
    week.why ?? '',
    '',
    '## 核心概念',
    '',
    ...(week.concepts ?? []).map((c) => `- ${c}`),
    '',
    '## 7 天拆分建议',
    '',
    '| 时间 | 重点 | 产出 |',
    '| --- | --- | --- |',
    `| 周一–周二 | 主线概念 + 最小可运行例子 | 一个能跑的最小实现 |`,
    `| 周三–周四 | 工程化：错误处理、配置、测试 | 至少一个失败路径测试 |`,
    `| 周五 | 收尾 + 文档 + 复盘 | 当天交付物 |`,
    `| 周六 | 项目日：实现与集成 | 可演示的半成品 |`,
    `| 周日 | 测试、评测、复盘、记忆卡周测 | 本周交付包 |`,
    '',
    ...renderBullets('本周清单', (week.checklist ?? []).map((c) => c.text)),
    ...renderBullets('本周交付', week.deliverables ?? []),
    ...renderResources(week.resources ?? []),
    ...renderChecklist('验收问题', week.checkpoints ?? []),
    ...fixedRhythmMd(),
    '## 收尾',
    '',
    `- 回到[第 ${week.n} 周计划](/plan/week-${n2(week.n)})勾选清单。`,
    '- 周日写复盘：计划 vs 实际 / 最大卡点 / 下周只改一件事。',
    '',
  ];
  return lines.join('\n');
}

function weekMd(week) {
  const lines = [
    '---',
    `title: 第 ${week.n} 周 · ${week.theme}`,
    `description: ${week.start} 起，${week.phase}`,
    '---',
    GEN_NOTE,
    '',
    `# 第 ${week.n} 周 · ${week.theme}`,
    '',
    `<div class="week-meta"><span>📅 ${week.start} ~ ${week.end}</span><span>⏱ 约 ${week.hours} 小时</span><span>🧭 ${week.phase}</span><span>🎴 ${week.cards?.length ?? 0} 张记忆卡</span></div>`,
    '',
    '## 本周目标',
    '',
    week.goal,
    '',
    '## 为什么这样安排',
    '',
    week.why ?? '',
    '',
    '## 核心概念',
    '',
    ...(week.concepts ?? []).map((c) => `- ${c}`),
    '',
  ];

  if (week.detail && week.days?.length) {
    lines.push(
      '## 每日安排',
      '',
      '> 每天 2 小时（工作日）/ 8 小时（周末）。勾选即打卡；当天的收获与卡点在学习页底部追加，周页面只读展示。',
      '',
      `<ClientOnly><WeekTasks week="${week.n}" /></ClientOnly>`,
      '',
      '### 时间分配一览',
      '',
      '| 日期 | 星期 | 时长 | 重点 | 当日交付 | 学习 |',
      '| --- | --- | --- | --- | --- | --- |',
    );
    week.days.forEach((d, i) => {
      lines.push(
        `| ${d.date} | ${weekdayOf(d.date)} | ${d.hours}h | ${escapeCell(d.focus)} | ${escapeCell(
          (d.output ?? '').replace(/^今日交付：/, '')
        )} | [打开](/study/w${n2(week.n)}d${i + 1}) |`
      );
    });
    lines.push('');
  } else {
    lines.push(
      '## 本周清单',
      '',
      `> 本周学习指南：[第 ${week.n} 周学习文档](/study/week-${n2(week.n)})。这一周按「周目标 + 清单」推进，开始前把清单拆成 7 天。`,
      '',
      `<ClientOnly><WeekTasks week="${week.n}" /></ClientOnly>`,
      '',
      ...fixedRhythmMd(),
    );
  }

  lines.push('## 本周交付', '');
  for (const d of week.deliverables ?? []) lines.push(`- ${d}`);
  lines.push('');
  lines.push('## 验收标准', '');
  for (const d of week.checkpoints ?? []) lines.push(`- [ ] ${d}`);
  lines.push('');
  lines.push('## 面试会问到', '');
  for (const q of week.interview ?? []) lines.push(`- ${q}`);
  lines.push('');
  lines.push(...renderResources(week.resources ?? []));

  lines.push('## 记忆卡', '');
  if (week.cards?.length) {
    lines.push(`<ClientOnly><FlashCards week="${week.n}" /></ClientOnly>`, '');
  } else {
    lines.push('本周记忆卡待补。开周前从讲义和自检问题里提炼 6 张左右。', '');
  }

  if (week.retro?.length) {
    lines.push('## 复盘问题', '');
    for (const q of week.retro) lines.push(`- ${q}`);
    lines.push('');
  }

  lines.push(
    '## 本周复盘',
    '',
    '> 周日晚花 30 分钟：下方会自动汇总本周的每日记录和卡点，填完保存即可。',
    '',
    `<ClientOnly><WeekReview week="${week.n}" /></ClientOnly>`,
    '',
    `[← 返回 20 周总览](/plan/)　|　[第 ${week.n} 周记忆卡](/cards/week-${n2(week.n)})`,
    ''
  );
  return lines.join('\n');
}

function cardsMd(week) {
  const lines = [
    '---',
    `title: 第 ${week.n} 周记忆卡`,
    '---',
    GEN_NOTE,
    '',
    `# 第 ${week.n} 周记忆卡`,
    '',
    `共 **${week.cards?.length ?? 0}** 张 · 主题：${week.theme}`,
    '',
  ];
  if (!week.cards?.length) {
    lines.push(
      '本周记忆卡待补。',
      '',
      '建议开周前从本周的自检问题和交付物里提炼 5–8 张：一张一个概念，正面问、背面答。',
      '',
      '[← 返回记忆卡总览](/cards/)',
      ''
    );
    return lines.join('\n');
  }
  lines.push(
    '> 点卡片翻面；按「忘记 / 模糊 / 记得 / 简单」评分，系统按 SM-2 算法安排下次复习。',
    '',
    `<ClientOnly><FlashCards week="${week.n}" /></ClientOnly>`,
    '',
    '## 卡片清单（快速浏览 / 打印）',
    ''
  );
  week.cards.forEach((card, i) => {
    lines.push(`### ${i + 1}. ${card.front}`, '');
    lines.push(`**答**：${card.back}`, '');
    lines.push(`<small>标签：${card.tag} · ID：${card.id}</small>`, '');
  });
  lines.push(
    `[← 返回记忆卡总览](/cards/)　|　[第 ${week.n} 周计划](/plan/week-${n2(week.n)})`,
    ''
  );
  return lines.join('\n');
}

function planIndexMd(plan) {
  const { meta, phases, weeks } = plan;
  const lines = [
    '---',
    'title: 20 周总览',
    '---',
    GEN_NOTE,
    '',
    `# ${meta.title} · 20 周作战面板`,
    '',
    `**${meta.subtitle}**　｜　共 ${meta.totalWeeks} 周　｜　约 ${meta.hoursPerWeek} 小时 / 周`,
    '',
    '## 你的参数',
    '',
    '| 项 | 取值 |',
    '| --- | --- |',
  ];
  const learner = meta.learner ?? {};
  const rows = [
    ['目标岗位', learner.goal],
    ['技术起点', learner.stack],
    ['目标城市', learner.city],
    ['时间投入', learner.rhythm],
    ['算法基础', learner.algo],
    ['周复盘', learner.reviewDay],
  ];
  for (const [k, v] of rows) if (v) lines.push(`| ${k} | ${escapeCell(v)} |`);
  lines.push('');
  lines.push('## 这套计划的原则', '');
  (meta.principles ?? []).forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  lines.push('');
  lines.push('## 每周节奏', '');
  lines.push('| 时段 | 时长 | 怎么用 |');
  lines.push('| --- | --- | --- |');
  for (const r of meta.weeklyRhythm ?? []) {
    lines.push(`| ${r.day} | ${r.hours} | ${escapeCell(r.detail)} |`);
  }
  lines.push('');
  if (meta.timelineNote) lines.push(`> ${meta.timelineNote}`, '');
  lines.push('## 阶段划分', '');
  lines.push('| 阶段 | 周次 | 时间 | 阶段目标 | 通过标准 |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const p of phases) {
    lines.push(
      `| ${p.name} | W${p.weeks[0]}–W${p.weeks[1]} | ${p.range} | ${escapeCell(p.goal)} | ${escapeCell(
        p.proof
      )} |`
    );
  }
  lines.push('');
  lines.push('## 20 周一览', '');
  lines.push('| 周 | 日期 | 阶段 | 主题 | 本周交付 |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const w of weeks) {
    lines.push(
      `| [W${w.n}](/plan/week-${n2(w.n)}) | ${w.start.slice(5)} ~ ${w.end.slice(5)} | ${w.phase} | ${escapeCell(
        w.theme
      )} | ${escapeCell((w.deliverables ?? [])[0] ?? '')} |`
    );
  }
  lines.push('');
  lines.push('## 现在开始', '');
  lines.push('1. 打开 [第 1 周计划](/plan/week-01)，先看「每日安排」。');
  lines.push('2. 打开 [打卡页](/checkin)，勾选今天的任务；本地开发时会自动写入 JSON。');
  lines.push('3. 每天结束写一句收获或卡点；每周日晚做复盘。');
  lines.push('');
  return lines.join('\n');
}

function cardsIndexMd(plan) {
  const weeks = plan.weeks;
  const total = weeks.reduce((s, w) => s + (w.cards?.length ?? 0), 0);
  const lines = [
    '---',
    'title: 记忆卡',
    '---',
    GEN_NOTE,
    '',
    '# 记忆卡 · 间隔重复',
    '',
    `全站已录入 **${total}** 张卡片，按周组织。每张卡片的复习间隔由 SM-2 算法根据你的评分自动调整。`,
    '',
    '<ClientOnly><FlashCards /></ClientOnly>',
    '',
    '## 按周查看',
    '',
  ];
  for (const w of weeks) {
    lines.push(`- [第 ${w.n} 周 · ${w.theme}](/cards/week-${n2(w.n)})（${w.cards?.length ?? 0} 张）`);
  }
  lines.push(
    '',
    '## 怎么用才有效',
    '',
    '1. **先理解再背**：当天学完看一遍卡片，用自己的话复述，再翻面核对。',
    '2. **每天 15 分钟**：只做「今天到期」的卡，不求一次背完。',
    '3. **评分要诚实**：想不起来就按「忘记」，间隔会重置——这是算法在帮你，不是惩罚你。',
    '4. **周日晚加一次周测**：把本周全部卡片过一遍，错 3 张以上重新看笔记。',
    ''
  );
  return lines.join('\n');
}

function studyIndexMd(plan) {
  const lines = [
    '---',
    'title: 学习文档',
    '---',
    GEN_NOTE,
    '',
    '# 学习文档',
    '',
    '> **W1 已提供每天一页的讲义**；W2–W4 的日讲义会在开周前补齐，当前先用每周指南；**W5–W20 每周一页**（7 天拆分、资料、常见坑、验收问题）。',
    '',
    '## 怎么用：先做，卡住再查，最后讲',
    '',
    '1. 打开当天页面，先看「今天要解决什么」，再直接看「动手清单」和「自检问题」，10 分钟内动手。',
    '2. 卡住再读对应小节或资料；讲义是参考手册，不要从头通读。',
    '3. 结束前合上讲义，写下当天 3 个概念 + 1 个公式/结论；再用 Java 类比讲 2 分钟，讲不通的地方就是漏洞。',
    '4. 回到[计划页](/plan/)勾选任务；周日晚做复盘。',
    '',
  ];
  for (const phase of plan.phases) {
    const list = plan.weeks.filter((w) => w.n >= phase.weeks[0] && w.n <= phase.weeks[1]);
    lines.push(`## ${phase.name}（W${phase.weeks[0]}–W${phase.weeks[1]}）`, '');
    for (const w of list) {
      if (w.detail && w.days?.length) {
        lines.push(`- **W${w.n} · ${w.theme}**`);
        w.days.forEach((day, i) => {
          lines.push(`  - [W${w.n} ${weekdayOf(day.date)} · ${day.focus}](/study/w${n2(w.n)}d${i + 1})`);
        });
      } else {
        lines.push(`- [W${w.n} · ${w.theme}](/study/week-${n2(w.n)})（每周一页）`);
      }
    }
    lines.push('');
  }
  return lines.join('\n');
}

function validate(plan, cardsByWeek) {
  const errors = [];
  const seen = new Map();
  const claim = (id, where) => {
    if (!id) return;
    if (seen.has(id)) errors.push(`重复 ID「${id}」：${seen.get(id)} 与 ${where}`);
    else seen.set(id, where);
  };

  if (plan.weeks.length !== plan.meta.totalWeeks) {
    errors.push(`周数应为 ${plan.meta.totalWeeks}，实际 ${plan.weeks.length}`);
  }

  plan.weeks.forEach((w, idx) => {
    if (w.n !== idx + 1) errors.push(`周序号不连续：第 ${idx + 1} 个对象写的是 ${w.n}`);
    if (idx > 0) {
      const expected = addDays(plan.weeks[idx - 1].start, 7);
      if (w.start !== expected) errors.push(`W${w.n} 起始日应为 ${expected}，实际 ${w.start}`);
    }
    if (!w.deliverables?.length) errors.push(`W${w.n} 缺少交付物`);
    if (!w.checkpoints?.length) errors.push(`W${w.n} 缺少验收标准`);
    if (!w.detail && !w.checklist?.length) errors.push(`W${w.n} 是周粒度但缺少 checklist`);
    for (const c of w.checklist ?? []) claim(c.id, `W${w.n} 清单`);
    for (const card of cardsByWeek.get(w.n) ?? []) claim(card.id, `W${w.n} 记忆卡`);

    if (w.detail) {
      if ((w.days ?? []).length !== 7) errors.push(`W${w.n} 应有 7 天，实际 ${w.days?.length ?? 0}`);
      (w.days ?? []).forEach((d, i) => {
        const expectedDate = addDays(w.start, i);
        if (d.date !== expectedDate) {
          errors.push(`W${w.n} 第 ${i + 1} 天日期应为 ${expectedDate}，实际 ${d.date}`);
        }
        if (!d.tasks?.length) errors.push(`W${w.n} ${d.date} 没有任务`);
        const mins = (d.tasks ?? []).reduce((s, t) => s + (t.min ?? 0), 0);
        const target = d.kind === 'weekend' ? 480 : 120;
        if (Math.abs(mins - target) > 15) {
          errors.push(`W${w.n} ${d.date} 任务时长合计 ${mins} 分钟，偏离 ${target} 分钟过多`);
        }
        for (const t of d.tasks ?? []) claim(t.id, `W${w.n} ${d.date}`);
      });
    }
  });

  for (const phase of plan.phases) {
    const first = plan.weeks.find((w) => w.n === phase.weeks[0]);
    const last = plan.weeks.find((w) => w.n === phase.weeks[1]);
    if (!first || !last) {
      errors.push(`阶段 ${phase.name} 的周次范围无效`);
      continue;
    }
    const range = `${first.start} ~ ${addDays(last.start, 6)}`;
    if (phase.range && phase.range !== range) {
      errors.push(`阶段 ${phase.name} 的时间范围应为 ${range}，实际 ${phase.range}`);
    }
  }

  if (errors.length) throw new Error(`内容校验失败：\n- ${errors.join('\n- ')}`);
}

async function loadCards() {
  const dir = path.join(content, 'cards');
  const files = (await readdir(dir).catch(() => [])).filter((f) => /^week-\d+\.json$/.test(f));
  const byWeek = new Map();
  for (const file of files) {
    const weekNo = Number(file.match(/week-(\d+)\.json/)[1]);
    const cards = await readJson(path.join(dir, file), []);
    if (!Array.isArray(cards)) throw new Error(`content/cards/${file} 应该是数组`);
    byWeek.set(weekNo, cards);
  }
  return byWeek;
}

async function main() {
  const rawPlan = await readJson(path.join(content, 'plan.json'));
  const cardsByWeek = await loadCards();

  const weeks = rawPlan.weeks.map((w) => {
    const end = addDays(w.start, 6);
    return {
      ...w,
      end,
      hours: w.hours ?? rawPlan.meta.hoursPerWeek,
      cards: cardsByWeek.get(w.n) ?? [],
    };
  });

  const plan = { ...rawPlan, weeks };

  validate(plan, cardsByWeek);

  await ensureDir(path.join(docs, 'plan'));
  await ensureDir(path.join(docs, 'cards'));
  await ensureDir(path.join(docs, 'study'));
  await ensureDir(path.join(docs, 'guide'));
  await ensureDir(dataDir);

  await writeFile(
    path.join(dataDir, 'plan.json'),
    JSON.stringify({ meta: plan.meta, phases: plan.phases, weeks }, null, 2) + '\n',
    'utf8'
  );

  const allCards = [];
  for (const w of weeks) {
    for (const card of w.cards) allCards.push({ ...card, week: w.n, weekTheme: w.theme });
  }
  await writeFile(path.join(dataDir, 'cards.json'), JSON.stringify(allCards, null, 2) + '\n', 'utf8');

  let studyPages = 0;
  for (const w of weeks) {
    await writeFile(path.join(docs, 'plan', `week-${n2(w.n)}.md`), weekMd(w), 'utf8');
    await writeFile(path.join(docs, 'cards', `week-${n2(w.n)}.md`), cardsMd(w), 'utf8');

    if (w.detail && w.days?.length) {
      for (let i = 0; i < w.days.length; i += 1) {
        const day = w.days[i];
        const src = path.join(content, 'study', `w${n2(w.n)}d${i + 1}.md`);
        if (await exists(src)) {
          await writeFile(path.join(docs, 'study', `w${n2(w.n)}d${i + 1}.md`), await readFile(src, 'utf8'), 'utf8');
        } else {
          const stub = dayStubMd(w, day, i);
          await writeFile(path.join(docs, 'study', `${stub.key}.md`), stub.text, 'utf8');
        }
        studyPages += 1;
      }
    } else {
      const src = path.join(content, 'study', `week-${n2(w.n)}.md`);
      if (await exists(src)) {
        await writeFile(path.join(docs, 'study', `week-${n2(w.n)}.md`), await readFile(src, 'utf8'), 'utf8');
      } else {
        await writeFile(path.join(docs, 'study', `week-${n2(w.n)}.md`), weekStudyFallbackMd(w), 'utf8');
      }
      studyPages += 1;
    }
  }

  await writeFile(path.join(docs, 'plan', 'index.md'), planIndexMd(plan), 'utf8');
  await writeFile(path.join(docs, 'cards', 'index.md'), cardsIndexMd(plan), 'utf8');
  await writeFile(path.join(docs, 'study', 'index.md'), studyIndexMd(plan), 'utf8');

  const guideDir = path.join(content, 'guide');
  const guides = (await readdir(guideDir).catch(() => [])).filter((f) => f.endsWith('.md'));
  for (const file of guides) {
    await writeFile(
      path.join(docs, 'guide', file),
      await readFile(path.join(guideDir, file), 'utf8'),
      'utf8'
    );
  }

  const checkins = path.join(dataDir, 'checkins.json');
  if (!(await exists(checkins))) {
    await writeFile(
      checkins,
      JSON.stringify(
        { version: 1, note: '打卡数据。可手动编辑，格式见 docs/guide/data-format.md', entries: [] },
        null,
        2
      ) + '\n',
      'utf8'
    );
  }

  const review = path.join(dataDir, 'review-state.json');
  if (!(await exists(review))) {
    await writeFile(
      review,
      JSON.stringify(
        { version: 1, note: '记忆卡复习状态（SM-2）。可手动编辑。', cards: {} },
        null,
        2
      ) + '\n',
      'utf8'
    );
  }

  console.log(
    `✅ 已生成：${weeks.length} 个周页面、${weeks.length} 个记忆卡页面、${studyPages} 个学习文档、${allCards.length} 张卡片、${guides.length} 篇指南`
  );
}

main().catch((err) => {
  console.error('❌ 生成失败：', err);
  process.exit(1);
});
