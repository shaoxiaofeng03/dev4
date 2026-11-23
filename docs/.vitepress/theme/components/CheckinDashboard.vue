<script setup lang="ts">
import { computed, ref } from 'vue';
import { withBase } from 'vitepress';
import { weeks, todayStr, pad2 } from '../composables/plan';
import {
  overview,
  weekStats,
  recentEntries,
  exportJson,
  importJson,
  weekMarkdown,
  localFile as checkinFile,
  saveLocalFile as saveCheckins,
  LOG_TAGS,
} from '../composables/checkins';
import {
  localFile as reviewFile,
  saveLocalFile as saveReview,
  exportJson as exportReviewJson,
  importJson as importReviewJson,
} from '../composables/cards';
import Heatmap from './Heatmap.vue';
import TodayPanel from './TodayPanel.vue';

const fileInput = ref<HTMLInputElement>();
const reviewInput = ref<HTMLInputElement>();
const localMsg = ref('');
const localStatus = ref<'idle' | 'ok' | 'error'>('idle');

const weekRows = computed(() => weeks.map((w) => ({ ...w, stats: weekStats(w.n) })));

const startedWeeks = computed(() =>
  weekRows.value.filter((w) => w.start <= todayStr() || w.stats.done > 0)
);

const notStarted = computed(() =>
  weekRows.value.filter((w) => !(w.start <= todayStr() || w.stats.done > 0))
);

function timeOf(at: string): string {
  const date = new Date(at);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function toast(msg: string, status: 'ok' | 'error' | 'idle' = 'ok') {
  localMsg.value = msg;
  localStatus.value = status === 'idle' ? 'idle' : status;
  window.setTimeout(() => {
    if (localMsg.value === msg) localMsg.value = '';
  }, 6000);
}

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCheckins() {
  download(`dev4-checkins-${todayStr()}.json`, exportJson());
  toast('已导出打卡 JSON');
}

function exportReview() {
  download(`dev4-review-state-${todayStr()}.json`, exportReviewJson());
  toast('已导出复习 JSON');
}

async function onCheckinFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const n = importJson(await file.text());
    toast(`已导入并合并 ${n} 天打卡记录`);
  } catch (err) {
    toast(`导入失败：${err instanceof Error ? err.message : err}`, 'error');
  } finally {
    (e.target as HTMLInputElement).value = '';
  }
}

async function onReviewFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const n = importReviewJson(await file.text());
    toast(`已导入 ${n} 张卡的复习进度`);
  } catch (err) {
    toast(`导入失败：${err instanceof Error ? err.message : err}`, 'error');
  } finally {
    (e.target as HTMLInputElement).value = '';
  }
}

async function copyWeek() {
  const weekNo = weeks.find((x) => todayStr() >= x.start && todayStr() <= x.end)?.n ?? 1;
  try {
    await navigator.clipboard.writeText(weekMarkdown(weekNo));
    toast(`已复制第 ${weekNo} 周打卡 Markdown`);
  } catch {
    toast('浏览器不允许剪贴板，请手动复制', 'error');
  }
}

async function copyCommit() {
  const cmd =
    'git add docs/data/checkins.json docs/data/review-state.json && ' +
    `git commit -m "chore(checkin): 打卡 ${todayStr()}" && git push`;
  try {
    await navigator.clipboard.writeText(cmd);
    toast('已复制 git 命令');
  } catch {
    toast('浏览器不允许剪贴板，请手动复制', 'error');
  }
}

async function saveNow() {
  try {
    await saveCheckins();
    await saveReview();
    toast('已写入打卡与复习文件');
  } catch (err) {
    toast(`保存失败：${err instanceof Error ? err.message : err}`, 'error');
  }
}

const entries = computed(() => recentEntries(10));
const itemCount = (ids: string[]) => (Array.isArray(ids) ? ids.length : 0);
</script>

<template>
  <div class="dash">
    <div class="stats">
      <div class="stat">
        <span class="stat-num">{{ overview.streak }}</span>
        <span class="stat-label">连续打卡（天）</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ overview.totalDone }}<em>/{{ overview.totalItems }}</em></span>
        <span class="stat-label">累计完成任务</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ overview.activeDays }}</span>
        <span class="stat-label">有记录的天数</span>
      </div>
    </div>

    <div class="total-bar">
      <div class="total-bar-fill" :style="{ width: overview.percent + '%' }"></div>
      <span class="total-bar-text">全计划进度 {{ overview.percent }}%</span>
    </div>

    <h3 class="sec-title">今天</h3>
    <TodayPanel />

    <h3 class="sec-title">打卡热力图</h3>
    <Heatmap />

    <h3 class="sec-title">每周进度</h3>
    <div class="week-table">
      <a
        v-for="w in startedWeeks"
        :key="w.n"
        class="week-row"
        :href="withBase(`/plan/week-${pad2(w.n)}`)"
      >
        <span class="wr-no">W{{ w.n }}</span>
        <span class="wr-theme">{{ w.theme }}</span>
        <span class="wr-bar"><i :style="{ width: w.stats.percent + '%' }"></i></span>
        <span class="wr-num">{{ w.stats.done }}/{{ w.stats.total }}</span>
      </a>
      <p class="muted" v-if="!startedWeeks.length">计划还没开始，开营后这里会出现每周进度。</p>
      <details v-if="notStarted.length" class="week-rest">
        <summary>未开始的周（{{ notStarted.length }}）</summary>
        <a
          v-for="w in notStarted"
          :key="w.n"
          class="week-row dim"
          :href="withBase(`/plan/week-${pad2(w.n)}`)"
        >
          <span class="wr-no">W{{ w.n }}</span>
          <span class="wr-theme">{{ w.theme }}</span>
          <span class="wr-bar"><i style="width: 0"></i></span>
          <span class="wr-num">0/{{ w.stats.total }}</span>
        </a>
      </details>
    </div>

    <h3 class="sec-title">本地保存与同步</h3>
    <div class="sync-box">
      <div v-if="checkinFile.enabled" class="local-mode">
        <p class="local-title">💾 本地文件模式（无 Token）</p>
        <p class="local-hint">
          <code>npm run dev</code> 时自动写入
          <code>docs/data/checkins.json</code> 和
          <code>docs/data/review-state.json</code>。确认后手动提交并推送：
        </p>
        <div class="local-cmd">
          <code
            >git add docs/data/checkins.json docs/data/review-state.json &amp;&amp; git commit -m
            "chore(checkin): 打卡 {{ todayStr() }}" &amp;&amp; git push</code
          >
          <button type="button" class="btn" @click="copyCommit">复制命令</button>
        </div>
        <div class="local-actions">
          <button
            type="button"
            class="btn"
            :disabled="checkinFile.saving || reviewFile.saving"
            @click="saveNow"
          >
            {{ checkinFile.saving || reviewFile.saving ? '保存中…' : '立即保存' }}
          </button>
          <span v-if="checkinFile.error" class="local-status error"
            >打卡写入失败：{{ checkinFile.error }}</span
          >
          <span v-else-if="reviewFile.error" class="local-status error"
            >复习写入失败：{{ reviewFile.error }}</span
          >
          <span v-else-if="checkinFile.savedAt" class="local-status ok"
            >打卡已写入（{{ checkinFile.savedAt }}）</span
          >
          <span v-else-if="checkinFile.ready" class="local-status">等待打卡…</span>
        </div>
      </div>
      <div v-else class="local-mode">
        <p class="local-title">☁️ 线上只读模式</p>
        <p class="local-hint">
          GitHub Pages 不能写文件。这里的勾选只会保存在当前浏览器；打卡和同步请在电脑上运行
          <code>npm run dev</code>。
        </p>
      </div>

      <div class="sync-actions">
        <button type="button" class="btn" @click="exportCheckins">导出打卡 JSON</button>
        <button type="button" class="btn" @click="fileInput?.click()">导入打卡 JSON</button>
        <button type="button" class="btn" @click="exportReview">导出复习 JSON</button>
        <button type="button" class="btn" @click="reviewInput?.click()">导入复习 JSON</button>
        <button type="button" class="btn ghost" @click="copyWeek">复制本周 Markdown</button>
        <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onCheckinFile" />
        <input ref="reviewInput" type="file" accept="application/json,.json" hidden @change="onReviewFile" />
      </div>
      <p class="sync-tip">
        线上 GitHub Pages 是只读站点，不会写文件；换设备时用导出 / 导入 JSON 恢复。
      </p>
      <p v-if="localMsg" class="sync-msg" :class="localStatus">{{ localMsg }}</p>
    </div>

    <h3 class="sec-title">最近记录</h3>
    <div class="recent">
      <div v-for="e in entries" :key="e.date" class="recent-item">
        <div class="recent-head">
          <strong>{{ e.date }}</strong>
          <span class="recent-meta">
            {{ itemCount(e.items) }} 项
            <template v-if="e.logs.length"> · {{ e.logs.length }} 条记录</template>
          </span>
        </div>
        <p v-if="e.note" class="recent-note">{{ e.note }}</p>
        <ul v-if="e.logs.length" class="recent-logs">
          <li v-for="log in e.logs.slice(-3)" :key="log.id">
            <span class="rlog-time">{{ timeOf(log.at) }}</span>
            <span class="rtag" :class="log.tag">{{ LOG_TAGS[log.tag] }}</span>
            <span class="rlog-text">{{ log.text }}</span>
          </li>
        </ul>
        <p v-if="e.retro" class="recent-retro">复盘：{{ e.retro }}</p>
      </div>
      <p v-if="!entries.length" class="muted">
        还没有记录。勾选任意一个任务，这里就会出现今天的打卡。
      </p>
    </div>
  </div>
</template>

<style scoped>
.dash {
  margin: 8px 0 24px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 14px 0;
}
.stat {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-num {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--vp-c-brand-1);
}
.stat-num em {
  font-style: normal;
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-weight: 500;
}
.stat-label {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.total-bar {
  position: relative;
  height: 26px;
  border-radius: 8px;
  background: var(--vp-c-default-soft);
  overflow: hidden;
  margin-bottom: 8px;
}
.total-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(91, 108, 255, 0.35), rgba(139, 92, 246, 0.55));
  transition: width 0.3s ease;
}
.total-bar-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11.5px;
  color: var(--vp-c-text-1);
}
.sec-title {
  font-size: 15px;
  margin: 26px 0 8px;
  padding: 0;
  border: none;
}
.week-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.week-row {
  display: grid;
  grid-template-columns: 38px 1fr 90px 56px;
  gap: 10px;
  align-items: center;
  padding: 5px 8px;
  border-radius: 7px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  font-size: 12.5px;
}
.week-row:hover {
  background: var(--vp-c-default-soft);
}
.week-row.dim {
  opacity: 0.55;
}
.wr-no {
  font-family: var(--vp-font-family-mono, monospace);
  color: var(--vp-c-text-3);
  font-size: 11.5px;
}
.wr-theme {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wr-bar {
  height: 6px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  overflow: hidden;
}
.wr-bar i {
  display: block;
  height: 100%;
  background: var(--vp-c-brand-1);
}
.wr-num {
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-align: right;
  font-family: var(--vp-font-family-mono, monospace);
}
.week-rest {
  margin-top: 6px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.week-rest summary {
  cursor: pointer;
}
.local-mode {
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
}
.local-title {
  margin: 0 0 6px;
  font-weight: 600;
}
.local-hint {
  margin: 0 0 8px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
.local-cmd {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.local-cmd code {
  flex: 1;
  min-width: 220px;
  padding: 6px 8px;
  border-radius: 8px;
  background: var(--vp-c-default-soft);
  font-size: 11.5px;
  line-height: 1.5;
  word-break: break-all;
}
.local-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.local-status {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.local-status.ok {
  color: #0a7d32;
}
.local-status.error {
  color: #b91c1c;
}
.sync-box {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--vp-c-bg-soft);
}
.sync-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.btn {
  padding: 6px 13px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12.5px;
  cursor: pointer;
}
.btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.btn.ghost {
  color: var(--vp-c-text-2);
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.sync-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--vp-c-text-3);
  line-height: 1.6;
}
.sync-msg {
  margin: 10px 0 0;
  font-size: 12px;
  padding: 7px 10px;
  border-radius: 8px;
}
.sync-msg.ok {
  color: #0a7d32;
  background: rgba(16, 185, 129, 0.12);
}
.sync-msg.error {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.12);
}
.recent {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.recent-item {
  border-left: 3px solid var(--vp-c-brand-1);
  padding: 2px 0 2px 10px;
}
.recent-head {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 12.5px;
}
.recent-meta {
  color: var(--vp-c-text-3);
  font-size: 11.5px;
}
.recent-note,
.recent-retro {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  white-space: pre-wrap;
}
.recent-retro {
  color: var(--vp-c-text-3);
}
.recent-logs {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
}
.recent-logs li {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin-top: 3px;
  font-size: 12.5px;
  line-height: 1.55;
}
.rlog-time {
  flex: none;
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono, monospace);
}
.rtag {
  flex: none;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10.5px;
}
.rtag.harvest {
  color: #15803d;
  background: rgba(34, 197, 94, 0.16);
}
.rtag.blocker {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.16);
}
.rtag.idea {
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}
.rlog-text {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-word;
}
.muted {
  color: var(--vp-c-text-3);
  font-size: 12.5px;
}
@media (max-width: 640px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .week-row {
    grid-template-columns: 34px 1fr 56px;
  }
  .wr-bar {
    display: none;
  }
}
</style>
