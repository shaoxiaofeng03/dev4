<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { addDays, weekByNo } from '../composables/plan';
import { store, setRetro, LOG_TAGS, type DayLog } from '../composables/checkins';

const props = defineProps<{ week: string | number }>();

const w = computed(() => weekByNo(Number(props.week)));

interface Row {
  date: string;
  logs: DayLog[];
  note: string;
}

const dates = computed(() => {
  if (!w.value) return [];
  const out: string[] = [];
  let cursor = w.value.start;
  for (let i = 0; i < 7; i += 1) {
    out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
});

const rows = computed<Row[]>(() =>
  dates.value
    .map((date) => {
      const entry = store.entries[date];
      return {
        date,
        logs: entry?.logs ?? [],
        note: entry?.note?.trim() ?? '',
      };
    })
    .filter((row) => row.logs.length || row.note)
);

const blockers = computed(() =>
  rows.value.flatMap((row) =>
    row.logs
      .filter((log) => log.tag === 'blocker')
      .map((log) => ({ ...log, date: row.date }))
  )
);

const entry = computed(() => (w.value ? store.entries[w.value.end] : undefined));

const blocker = ref('');
const change = ref('');
const insight = ref('');
const saved = ref(false);
const copied = ref(false);
const message = ref('');
const hydrated = ref(false);

function pick(value: string, label: string): string {
  const match = value.match(new RegExp(`${label}[：:]\\s*([\\s\\S]*?)(?=\\n[①②③]|$)`));
  return match ? match[1].trim().replace(/^—$/, '') : '';
}

function hydrate(value: string): void {
  const maxBlocker = pick(value, '① 最大卡点');
  const oneChange = pick(value, '② 下周只改一件事');
  const bestInsight = pick(value, '③ 本周最值钱认知');
  if (maxBlocker) blocker.value = maxBlocker;
  if (oneChange) change.value = oneChange;
  if (bestInsight) insight.value = bestInsight;
}

watch(
  () => entry.value?.retro ?? '',
  (value) => {
    if (hydrated.value || !value) return;
    hydrate(value);
    hydrated.value = true;
  },
  { immediate: true }
);

watch([blocker, change, insight], () => {
  saved.value = false;
});

function compose(): string {
  return [
    `① 最大卡点：${blocker.value.trim() || '—'}`,
    `② 下周只改一件事：${change.value.trim() || '—'}`,
    `③ 本周最值钱认知：${insight.value.trim() || '—'}`,
  ].join('\n');
}

function save(): void {
  if (!w.value) return;
  setRetro(w.value.end, compose());
  saved.value = true;
}

async function copy(): Promise<void> {
  if (!w.value) return;
  message.value = '';
  const lines = [`## 第 ${w.value.n} 周复盘 · ${w.value.start} ~ ${w.value.end}`, ''];
  if (blockers.value.length) {
    lines.push('### 本周卡点');
    for (const item of blockers.value) lines.push(`- ${item.date.slice(5)} ${item.text}`);
    lines.push('');
  }
  if (rows.value.length) {
    lines.push('### 每日记录');
    for (const row of rows.value) {
      lines.push(`#### ${row.date.slice(5)}`);
      if (row.note) lines.push(`- ${row.note}`);
      for (const log of row.logs) lines.push(`- [${LOG_TAGS[log.tag]}] ${log.text}`);
      lines.push('');
    }
  }
  lines.push('### 复盘');
  lines.push(compose());
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    copied.value = true;
    saved.value = false;
    window.setTimeout(() => {
      copied.value = false;
    }, 4000);
  } catch {
    message.value = '浏览器不允许剪贴板，请手动复制';
  }
}
</script>

<template>
  <div v-if="w" class="week-review">
    <div class="wr-head">
      <span class="wr-title">本周复盘</span>
      <span class="wr-meta">{{ w.start }} ~ {{ w.end }} · 建议 30 分钟</span>
    </div>

    <div class="wr-block">
      <h4>
        本周卡点
        <span class="wr-count">{{ blockers.length }}</span>
      </h4>
      <ul v-if="blockers.length" class="wr-blockers">
        <li v-for="item in blockers" :key="item.id">
          <span class="wr-date">{{ item.date.slice(5) }}</span>
          <span>{{ item.text }}</span>
        </li>
      </ul>
      <p v-else class="wr-empty">本周还没有标记为「卡点」的记录。</p>
    </div>

    <details v-if="rows.length" class="wr-days">
      <summary>每日记录（{{ rows.length }} 天）</summary>
      <ul>
        <li v-for="row in rows" :key="row.date" class="wr-day">
          <span class="wr-date">{{ row.date.slice(5) }}</span>
          <div class="wr-day-body">
            <p v-if="row.note" class="wr-legacy">{{ row.note }}</p>
            <p v-for="log in row.logs" :key="log.id" class="wr-log">
              <span class="wr-tag" :class="log.tag">{{ LOG_TAGS[log.tag] }}</span>
              <span>{{ log.text }}</span>
            </p>
          </div>
        </li>
      </ul>
    </details>

    <div class="wr-fields">
      <label>
        <span>① 最大卡点</span>
        <textarea v-model="blocker" rows="2" placeholder="这周最卡的一件事"></textarea>
      </label>
      <label>
        <span>② 下周只改一件事</span>
        <textarea v-model="change" rows="2" placeholder="只写一件，别写清单"></textarea>
      </label>
      <label>
        <span>③ 本周最值钱的一个认知</span>
        <textarea v-model="insight" rows="2" placeholder="能用一句话讲清楚的那种"></textarea>
      </label>
    </div>

    <div class="wr-actions">
      <button type="button" class="wr-btn primary" @click="save">保存复盘</button>
      <button type="button" class="wr-btn" @click="copy">复制 Markdown</button>
      <span v-if="saved" class="wr-ok">已保存</span>
      <span v-else-if="copied" class="wr-ok">已复制</span>
      <span v-else-if="message" class="wr-err">{{ message }}</span>
    </div>
  </div>
</template>

<style scoped>
.week-review {
  margin: 16px 0;
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
}
.wr-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
  justify-content: space-between;
}
.wr-title {
  font-size: 15px;
  font-weight: 600;
}
.wr-meta {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.wr-block {
  margin-top: 12px;
}
.wr-block h4 {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 600;
}
.wr-count {
  display: inline-block;
  min-width: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 11px;
  text-align: center;
}
.wr-blockers {
  margin: 0;
  padding: 0;
  list-style: none;
}
.wr-blockers li {
  display: flex;
  gap: 8px;
  padding: 5px 0;
  border-top: 1px dashed var(--vp-c-divider);
  font-size: 13px;
  line-height: 1.55;
}
.wr-blockers li:first-child {
  border-top: none;
}
.wr-date {
  flex: none;
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.wr-empty {
  margin: 0;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}
.wr-days {
  margin-top: 10px;
}
.wr-days summary {
  cursor: pointer;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}
.wr-days ul {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}
.wr-day {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-top: 1px dashed var(--vp-c-divider);
}
.wr-day:first-child {
  border-top: none;
}
.wr-day-body {
  flex: 1;
}
.wr-log,
.wr-legacy {
  margin: 2px 0;
  font-size: 13px;
  line-height: 1.55;
}
.wr-legacy {
  color: var(--vp-c-text-2);
}
.wr-tag {
  display: inline-block;
  margin-right: 6px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 11px;
}
.wr-tag.harvest {
  color: #15803d;
  background: rgba(34, 197, 94, 0.16);
}
.wr-tag.blocker {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.16);
}
.wr-tag.idea {
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}
.wr-fields {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}
.wr-fields label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}
.wr-fields textarea {
  width: 100%;
  padding: 7px 9px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
}
.wr-fields textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.wr-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}
.wr-btn {
  padding: 4px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12.5px;
  cursor: pointer;
}
.wr-btn.primary {
  border-color: transparent;
  background: var(--vp-c-brand-1);
  color: #fff;
}
.wr-ok {
  font-size: 12px;
  color: #15803d;
}
.wr-err {
  font-size: 12px;
  color: #b91c1c;
}
</style>
