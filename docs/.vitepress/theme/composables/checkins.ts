import { computed, reactive, watch } from 'vue';
import baselineCheckins from '../../../data/checkins.json';
import { allWeeksItems, todayStr, weeks, addDays } from './plan';

export type LogTag = 'harvest' | 'blocker' | 'idea';

/** 标签只影响颜色和周日汇总，不拆字段。 */
export const LOG_TAGS: Record<LogTag, string> = {
  harvest: '收获',
  blocker: '卡点',
  idea: '想法',
};

export interface DayLog {
  id: string;
  at: string;
  tag: LogTag;
  text: string;
}

export interface Entry {
  date: string;
  items: string[];
  /** 旧版单条笔记：仍会作为「旧记录」显示，新记录不再写入。 */
  note?: string;
  /** 旧版实际耗时：只保留历史数据，不再展示或编辑。 */
  minutes?: number;
  retro?: string;
  /** 当日追加式记录（评论流）。 */
  logs: DayLog[];
  updatedAt: string;
}

export interface CheckinFile {
  version: number;
  note?: string;
  entries: Entry[];
}

const STORE_KEY = 'dev4.checkins.v1';
const LOCAL_API = `${import.meta.env.BASE_URL}__local/checkins`;
const LOCAL_FILE = 'docs/data/checkins.json';
const CHECKINS_NOTE = '打卡数据。可手动编辑，格式见 docs/guide/data-format.md';
const IS_DEV = import.meta.env.DEV;
const isBrowser = typeof window !== 'undefined';

let localLoad: Promise<void> | null = null;
let saveChain: Promise<unknown> = Promise.resolve();

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(): string {
  return `l_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 缺 id / 时间的历史数据给一个稳定兜底，避免每次加载都生成新 id 造成重复。 */
function fallbackId(at: string, text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return `l_${Date.parse(at) || 0}_${Math.abs(hash).toString(36)}`;
}

function normalizeLog(raw: unknown): DayLog | null {
  if (!raw || typeof raw !== 'object') return null;
  const log = raw as Partial<DayLog>;
  const text = typeof log.text === 'string' ? log.text.trim() : '';
  if (!text) return null;
  const at = typeof log.at === 'string' && log.at ? log.at : nowIso();
  const tag: LogTag =
    log.tag === 'harvest' || log.tag === 'blocker' || log.tag === 'idea' ? log.tag : 'idea';
  return {
    id: typeof log.id === 'string' && log.id ? log.id : fallbackId(at, text),
    at,
    tag,
    text,
  };
}

function normalize(entry: Partial<Entry> & { date: string }): Entry {
  return {
    date: entry.date,
    items: Array.isArray(entry.items) ? [...new Set(entry.items)] : [],
    note: entry.note ?? '',
    minutes: Number.isFinite(entry.minutes) ? Number(entry.minutes) : 0,
    retro: entry.retro ?? '',
    logs: Array.isArray(entry.logs)
      ? entry.logs.map(normalizeLog).filter((log): log is DayLog => Boolean(log))
      : [],
    updatedAt: entry.updatedAt || nowIso(),
  };
}

export function mergeEntries(a: Entry[], b: Entry[]): Entry[] {
  const map = new Map<string, Entry>();
  for (const raw of [...a, ...b]) {
    if (!raw?.date) continue;
    const e = normalize(raw);
    const prev = map.get(e.date);
    if (!prev) {
      map.set(e.date, e);
      continue;
    }
    const newer = e.updatedAt >= prev.updatedAt ? e : prev;
    const logMap = new Map<string, DayLog>();
    for (const log of [...prev.logs, ...e.logs]) logMap.set(log.id, log);
    map.set(e.date, {
      date: e.date,
      items: [...new Set([...prev.items, ...e.items])],
      note: newer.note || prev.note || e.note || '',
      retro: newer.retro || prev.retro || e.retro || '',
      minutes: Math.max(prev.minutes ?? 0, e.minutes ?? 0),
      logs: [...logMap.values()].sort((x, y) => x.at.localeCompare(y.at)),
      updatedAt: newer.updatedAt,
    });
  }
  return [...map.values()].sort((x, y) => x.date.localeCompare(y.date));
}

function readLocal(): Entry[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Entry[] | CheckinFile;
    const list = Array.isArray(parsed) ? parsed : parsed.entries;
    return Array.isArray(list) ? list.map((e) => normalize(e)) : [];
  } catch {
    return [];
  }
}

function readBaseline(): Entry[] {
  const base = baselineCheckins as unknown as CheckinFile;
  return Array.isArray(base?.entries) ? base.entries.map((e) => normalize(e)) : [];
}

export const store = reactive<{ entries: Record<string, Entry> }>({
  entries: {},
});

export const loaded = reactive({ value: false });

/** 本地开发模式：打卡页直接读写仓库里的 docs/data/checkins.json */
export const localFile = reactive({
  enabled: IS_DEV,
  ready: false,
  saving: false,
  savedAt: '',
  error: '',
});

export function initStore(): void {
  if (loaded.value) return;
  // 本地 dev 时文件是唯一数据源：先用 localStorage 草稿占位，
  // 读取文件成功后由 loadLocalFile 覆盖（只有文件为空时才迁移草稿）。
  const initial = IS_DEV ? readLocal() : mergeEntries(readBaseline(), readLocal());
  for (const e of initial) store.entries[e.date] = e;
  loaded.value = true;
}

if (isBrowser) {
  initStore();
  if (IS_DEV) void loadLocalFile();
}

let saveTimer: number | undefined;

watch(
  store,
  () => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ version: 1, entries: Object.values(store.entries) })
      );
    } catch {
      /* 存储配额满时静默失败，不影响使用 */
    }
    if (IS_DEV && localFile.ready) {
      if (saveTimer !== undefined) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        void saveLocalFile().catch(() => {
          /* 错误已经写进 localFile.error */
        });
      }, 300);
    }
  },
  { deep: true }
);

export const doneSet = computed<Set<string>>(() => {
  const s = new Set<string>();
  for (const e of Object.values(store.entries)) {
    for (const id of e.items) s.add(id);
  }
  return s;
});

export function isDone(itemId: string): boolean {
  return doneSet.value.has(itemId);
}

function upsert(date: string): Entry {
  if (!store.entries[date]) {
    store.entries[date] = {
      date,
      items: [],
      note: '',
      minutes: 0,
      retro: '',
      logs: [],
      updatedAt: nowIso(),
    };
  }
  return store.entries[date];
}

export function toggleItem(itemId: string, date: string): void {
  const current = doneSet.value.has(itemId);
  if (current) {
    for (const e of Object.values(store.entries)) {
      const idx = e.items.indexOf(itemId);
      if (idx >= 0) {
        e.items.splice(idx, 1);
        e.updatedAt = nowIso();
      }
    }
    return;
  }
  const e = upsert(date);
  e.items.push(itemId);
  e.updatedAt = nowIso();
}

export function setNote(date: string, note: string): void {
  const e = upsert(date);
  e.note = note;
  e.updatedAt = nowIso();
}

export function setRetro(date: string, retro: string): void {
  const e = upsert(date);
  e.retro = retro;
  e.updatedAt = nowIso();
}

export function setMinutes(date: string, minutes: number): void {
  const e = upsert(date);
  e.minutes = Number(minutes) || 0;
  e.updatedAt = nowIso();
}

/** 追加一条当日记录。 */
export function addLog(date: string, text: string, tag: LogTag = 'idea'): void {
  const value = text.trim();
  if (!value) return;
  const e = upsert(date);
  e.logs.push({ id: makeId(), at: nowIso(), tag, text: value });
  e.updatedAt = nowIso();
}

export function removeLog(date: string, id: string): void {
  const e = store.entries[date];
  if (!e) return;
  e.logs = e.logs.filter((log) => log.id !== id);
  e.updatedAt = nowIso();
}

export function weekStats(n: number): { total: number; done: number; minutes: number; percent: number } {
  const items = allWeeksItems.get(n) ?? [];
  const done = items.filter((i) => doneSet.value.has(i.id)).length;
  const minutes = Object.values(store.entries)
    .filter((e) => e.date >= (weeks[n - 1]?.start ?? '') && e.date <= (weeks[n - 1]?.end ?? ''))
    .reduce((s, e) => s + (e.minutes ?? 0), 0);
  return {
    total: items.length,
    done,
    minutes,
    percent: items.length ? Math.round((done / items.length) * 100) : 0,
  };
}

export const overview = computed(() => {
  const entries = Object.values(store.entries);
  const activeDays = entries.filter((e) => e.items.length > 0).length;
  const totalItems = weeks.reduce((s, w) => s + (allWeeksItems.get(w.n)?.length ?? 0), 0);
  const totalDone = [...doneSet.value].length;
  const totalMinutes = entries.reduce((s, e) => s + (e.minutes ?? 0), 0);

  // 连续打卡：从「最近一次有记录的那天」往前数连续天数
  const has = (d: string) => (store.entries[d]?.items.length ?? 0) > 0;
  const activeDates = entries
    .filter((e) => e.items.length > 0)
    .map((e) => e.date)
    .sort();
  let streak = 0;
  if (activeDates.length) {
    let cursor = activeDates[activeDates.length - 1];
    while (has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
  }

  return {
    activeDays,
    totalItems,
    totalDone,
    totalMinutes,
    streak,
    percent: totalItems ? Math.round((totalDone / totalItems) * 100) : 0,
  };
});

export interface HeatCell {
  date: string;
  count: number;
  minutes: number;
  isFuture: boolean;
}

/** 按日期区间生成热力图数据（区间通常就是整个计划周期） */
export function heatmapRange(start: string, end: string): HeatCell[] {
  const out: HeatCell[] = [];
  const today = todayStr();
  let cursor = start;
  let guard = 0;
  while (cursor <= end && guard < 800) {
    const e = store.entries[cursor];
    out.push({
      date: cursor,
      count: e?.items.length ?? 0,
      minutes: e?.minutes ?? 0,
      isFuture: cursor > today,
    });
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return out;
}

export function recentEntries(limit = 12): Entry[] {
  return Object.values(store.entries)
    .filter((e) => e.items.length || e.note || e.retro || e.logs.length)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function exportJson(): string {
  return JSON.stringify({ version: 1, entries: Object.values(store.entries) }, null, 2);
}

export function importJson(text: string): number {
  const parsed = JSON.parse(text) as CheckinFile | Entry[];
  const list = Array.isArray(parsed) ? parsed : parsed.entries;
  if (!Array.isArray(list)) throw new Error('格式不对：需要 { entries: [...] } 或数组');
  const merged = mergeEntries(Object.values(store.entries), list.map((e) => normalize(e)));
  store.entries = {};
  for (const e of merged) store.entries[e.date] = e;
  return merged.length;
}

export function weekMarkdown(n: number): string {
  const w = weeks[n - 1];
  if (!w) return '';
  const stats = weekStats(n);
  const lines = [
    `## 第 ${w.n} 周打卡 · ${w.start} ~ ${w.end}`,
    '',
    `完成 ${stats.done}/${stats.total}（${stats.percent}%）`,
    '',
  ];
  for (const item of allWeeksItems.get(n) ?? []) {
    const mark = doneSet.value.has(item.id) ? 'x' : ' ';
    lines.push(`- [${mark}] ${item.date} ${item.text}`);
  }
  return lines.join('\n');
}

function snapshot(): CheckinFile {
  return {
    version: 1,
    note: CHECKINS_NOTE,
    entries: Object.values(store.entries)
      .map((e) => normalize(e))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/** 从 Vite 开发服务器读取仓库里的 checkins.json；文件为空时迁移本地草稿 */
export function loadLocalFile(): Promise<void> {
  if (!isBrowser || !IS_DEV) return Promise.resolve();
  if (localLoad) return localLoad;

  localLoad = (async () => {
    try {
      const res = await fetch(LOCAL_API, { cache: 'no-store' });
      if (!res.ok) throw new Error(`读取本地文件失败（HTTP ${res.status}）`);
      const data = (await res.json()) as CheckinFile;
      const fileEntries = Array.isArray(data?.entries)
        ? data.entries.map((e) => normalize(e))
        : [];
      const localEntries = Object.values(store.entries);
      // 文件是唯一数据源；只有文件还是空的时候，才把 localStorage 草稿迁移进去。
      const migrate = fileEntries.length === 0 && localEntries.length > 0;
      const next = migrate ? mergeEntries(fileEntries, localEntries) : fileEntries;

      store.entries = {};
      for (const e of next) store.entries[e.date] = e;
      localFile.ready = true;
      localFile.error = '';

      if (migrate) {
        await saveLocalFile();
      }
    } catch (err) {
      localFile.error = err instanceof Error ? err.message : String(err);
      localFile.ready = false;
    }
  })();

  return localLoad;
}

/** 把当前打卡数据写入仓库里的 docs/data/checkins.json（仅开发服务器可用） */
export function saveLocalFile(): Promise<string> {
  if (!isBrowser || !IS_DEV) {
    return Promise.resolve('当前不是本地开发模式，未写入文件');
  }
  const task = saveChain.then(() => doSaveLocalFile());
  saveChain = task.catch(() => undefined);
  return task;
}

async function doSaveLocalFile(): Promise<string> {
  localFile.saving = true;
  localFile.error = '';
  try {
    const res = await fetch(LOCAL_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot()),
    });
    if (!res.ok) {
      const text = await res.text();
      let message = text;
      try {
        const body = JSON.parse(text) as { error?: string };
        if (body.error) message = body.error;
      } catch {
        /* 非 JSON 错误响应，保留原文 */
      }
      throw new Error(message || `保存失败（HTTP ${res.status}）`);
    }
    localFile.savedAt = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    return `已写入 ${LOCAL_FILE}`;
  } catch (err) {
    localFile.error = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    localFile.saving = false;
  }
}
