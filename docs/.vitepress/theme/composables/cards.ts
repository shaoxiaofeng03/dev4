import { computed, reactive, watch } from 'vue';
import rawCards from '../../../data/cards.json';
import baselineReview from '../../../data/review-state.json';
import { addDays, todayStr } from './plan';

export interface FlashCard {
  id: string;
  week: number;
  weekTheme: string;
  tag: string;
  front: string;
  back: string;
}

export interface ReviewRecord {
  ease: number;
  interval: number;
  due: string;
  reps: number;
  lapses: number;
  last: string;
}

export const cards = rawCards as unknown as FlashCard[];

export const cardById = new Map(cards.map((c) => [c.id, c]));

const STORE_KEY = 'dev4.cards.v1';
const LOCAL_API = `${import.meta.env.BASE_URL}__local/review-state`;
const LOCAL_FILE = 'docs/data/review-state.json';
const isBrowser = typeof window !== 'undefined';
const IS_DEV = import.meta.env.DEV;

export const grades = [
  { q: 0, label: '忘记', hint: '完全想不起来', cls: 'again' },
  { q: 1, label: '模糊', hint: '想起一部分', cls: 'hard' },
  { q: 2, label: '记得', hint: '正常想起来了', cls: 'good' },
  { q: 3, label: '简单', hint: '毫不费力', cls: 'easy' },
] as const;

interface ReviewFile {
  version: number;
  cards: Record<string, ReviewRecord>;
}

export const localFile = reactive({
  enabled: IS_DEV,
  ready: false,
  saving: false,
  savedAt: '',
  error: '',
});

let saveChain: Promise<unknown> = Promise.resolve();
let saveTimer: number | undefined;
let localLoad: Promise<void> | null = null;

function readLocal(): Record<string, ReviewRecord> {
  if (!isBrowser) return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReviewFile | Record<string, ReviewRecord>;
    return (parsed as ReviewFile).cards ?? (parsed as Record<string, ReviewRecord>) ?? {};
  } catch {
    return {};
  }
}

function baseline(): Record<string, ReviewRecord> {
  const b = baselineReview as unknown as ReviewFile;
  return b?.cards ?? {};
}

export const store = reactive<{ cards: Record<string, ReviewRecord> }>({ cards: {} });

function init(): void {
  const base = baseline();
  const local = readLocal();
  for (const [id, rec] of Object.entries(base)) store.cards[id] = { ...rec };
  for (const [id, rec] of Object.entries(local)) {
    const prev = store.cards[id];
    if (!prev || (rec.last ?? '') >= (prev.last ?? '')) store.cards[id] = { ...rec };
  }
}

if (isBrowser) {
  init();
  if (IS_DEV) void loadLocalFile();
}

watch(
  store,
  () => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ version: 1, cards: store.cards }));
    } catch {
      /* ignore */
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

export function recordOf(id: string): ReviewRecord | undefined {
  return store.cards[id];
}

export function isLearned(id: string): boolean {
  return Boolean(store.cards[id]);
}

export function isDue(id: string, date = todayStr()): boolean {
  const rec = store.cards[id];
  return Boolean(rec) && rec.due <= date;
}

export function nextInterval(
  rec: ReviewRecord | undefined,
  q: number
): { interval: number; ease: number; reps: number; lapses: number } {
  const ease = rec?.ease ?? 2.5;
  const reps = rec?.reps ?? 0;
  const lapses = rec?.lapses ?? 0;
  const interval = rec?.interval ?? 0;

  if (q === 0) {
    return { interval: 0, ease: Math.max(1.3, ease - 0.2), reps: 0, lapses: lapses + 1 };
  }
  if (q === 1) {
    return { interval: 1, ease: Math.max(1.3, ease - 0.15), reps: Math.max(1, reps), lapses };
  }
  const nextEase = q === 3 ? Math.min(3.0, ease + 0.1) : ease;
  let next: number;
  if (reps === 0) next = 1;
  else if (reps === 1) next = 3;
  else next = Math.max(1, Math.round(interval * nextEase));
  if (q === 3) next = Math.max(2, Math.round(next * 1.3));
  return { interval: next, ease: nextEase, reps: reps + 1, lapses };
}

export function gradeCard(id: string, q: number): ReviewRecord {
  const rec = store.cards[id];
  const { interval, ease, reps, lapses } = nextInterval(rec, q);
  const due = addDays(todayStr(), interval);
  const next: ReviewRecord = {
    ease,
    interval,
    due,
    reps,
    lapses,
    last: todayStr(),
  };
  store.cards[id] = next;
  return next;
}

export function resetCard(id: string): void {
  delete store.cards[id];
}

export const stats = computed(() => {
  const today = todayStr();
  const total = cards.length;
  const learned = Object.keys(store.cards).length;
  const due = cards.filter((c) => isDue(c.id, today)).length;
  const fresh = total - learned;
  const reviewedToday = Object.values(store.cards).filter((r) => r.last === today).length;
  const mature = Object.values(store.cards).filter((r) => r.interval >= 7).length;
  return { total, learned, due, fresh, reviewedToday, mature };
});

export function weekCards(week: number): FlashCard[] {
  return cards.filter((c) => c.week === week);
}

export function exportJson(): string {
  return JSON.stringify({ version: 1, cards: store.cards }, null, 2);
}

export function importJson(text: string): number {
  const parsed = JSON.parse(text) as ReviewFile | Record<string, ReviewRecord>;
  const incoming = (parsed as ReviewFile).cards ?? (parsed as Record<string, ReviewRecord>) ?? {};
  let count = 0;
  for (const [id, rec] of Object.entries(incoming)) {
    if (!rec || typeof rec !== 'object') continue;
    const prev = store.cards[id];
    if (!prev || (rec.last ?? '') >= (prev.last ?? '')) {
      store.cards[id] = { ...rec };
      count += 1;
    }
  }
  return count;
}

/** 从 Vite 开发服务器读取仓库里的 review-state.json；文件为空时迁移本地草稿 */
export function loadLocalFile(): Promise<void> {
  if (!isBrowser || !IS_DEV) return Promise.resolve();
  if (localLoad) return localLoad;

  localLoad = (async () => {
    try {
      const res = await fetch(LOCAL_API, { cache: 'no-store' });
      if (!res.ok) throw new Error(`读取本地文件失败（HTTP ${res.status}）`);
      const data = (await res.json()) as ReviewFile;
      const fileCards = data?.cards ?? {};
      const localCards = { ...store.cards };

      if (Object.keys(fileCards).length === 0 && Object.keys(localCards).length > 0) {
        // 文件还是空的时候，把 localStorage 草稿迁移进去。
        for (const [id, rec] of Object.entries(localCards)) store.cards[id] = { ...rec };
        localFile.ready = true;
        await saveLocalFile();
        return;
      }

      store.cards = {};
      for (const [id, rec] of Object.entries(fileCards)) store.cards[id] = { ...rec };
      localFile.ready = true;
      localFile.error = '';
    } catch (err) {
      localFile.error = err instanceof Error ? err.message : String(err);
      localFile.ready = false;
    }
  })();

  return localLoad;
}

/** 把当前复习进度写入仓库里的 docs/data/review-state.json（仅开发服务器可用） */
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
      body: JSON.stringify({ version: 1, cards: store.cards }),
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
