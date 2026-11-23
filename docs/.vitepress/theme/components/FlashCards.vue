<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { withBase } from 'vitepress';
import {
  cards as allCards,
  grades,
  gradeCard,
  isDue,
  isLearned,
  recordOf,
  nextInterval,
  stats,
  localFile,
  type FlashCard,
} from '../composables/cards';
import { pad2 } from '../composables/plan';

const props = defineProps<{ week?: string | number }>();

const weekNo = computed(() => (props.week == null ? null : Number(props.week)));
const pool = computed(() =>
  weekNo.value == null ? allCards : allCards.filter((c) => c.week === weekNo.value)
);

type Filter = 'due' | 'learn' | 'all';
const filter = ref<Filter>('all');
const queue = ref<FlashCard[]>([]);
const index = ref(0);
const revealed = ref(false);
const shuffled = ref(false);
const session = ref({ graded: 0, again: 0 });

const current = computed<FlashCard | undefined>(() => queue.value[index.value]);
const finished = computed(() => queue.value.length > 0 && index.value >= queue.value.length);

const dueInPool = computed(() => pool.value.filter((c) => isDue(c.id)).length);
const learnedInPool = computed(() => pool.value.filter((c) => isLearned(c.id)).length);
const newInPool = computed(() => pool.value.length - learnedInPool.value);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQueue() {
  let list = [...pool.value];
  if (filter.value === 'due') list = list.filter((c) => isDue(c.id));
  if (filter.value === 'learn') list = list.filter((c) => isLearned(c.id) && !isDue(c.id));

  list.sort((a, b) => {
    const ar = recordOf(a.id);
    const br = recordOf(b.id);
    if (ar && !br) return -1;
    if (!ar && br) return 1;
    if (ar && br) return ar.due.localeCompare(br.due);
    return a.id.localeCompare(b.id);
  });

  if (shuffled.value) list = shuffle(list);
  queue.value = list;
  index.value = 0;
  revealed.value = false;
  session.value = { graded: 0, again: 0 };
}

watch([filter, pool, shuffled], buildQueue, { immediate: true });

const predictions = computed(() => {
  const rec = current.value ? recordOf(current.value.id) : undefined;
  return grades.map((g) => {
    const { interval } = nextInterval(rec, g.q);
    const label = interval <= 0 ? '稍后' : interval === 1 ? '1 天' : `${interval} 天`;
    return { ...g, label };
  });
});

const progressPercent = computed(() => {
  if (!queue.value.length) return 0;
  return Math.round((Math.min(index.value, queue.value.length) / queue.value.length) * 100);
});

function flip() {
  if (current.value) revealed.value = !revealed.value;
}

function grade(q: number) {
  const card = current.value;
  if (!card) return;
  gradeCard(card.id, q);
  session.value.graded += 1;
  if (q === 0) {
    session.value.again += 1;
    queue.value.push(card);
  }
  revealed.value = false;
  index.value += 1;
}

function restart(filterOverride?: Filter) {
  if (filterOverride) filter.value = filterOverride;
  buildQueue();
}

function onKey(e: KeyboardEvent) {
  if (!current.value) return;
  const target = e.target as HTMLElement;
  if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    if (!revealed.value) flip();
    return;
  }
  const n = Number(e.key);
  if (n >= 1 && n <= 4 && revealed.value) {
    e.preventDefault();
    grade(n - 1);
  }
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

const filterLabels: { key: Filter; text: string }[] = [
  { key: 'all', text: '全部' },
  { key: 'due', text: '今天到期' },
  { key: 'learn', text: '已学过' },
];
</script>

<template>
  <div class="fc">
    <div class="fc-toolbar">
      <div class="fc-filters">
        <button
          v-for="f in filterLabels"
          :key="f.key"
          type="button"
          class="fc-tab"
          :class="{ active: filter === f.key }"
          @click="filter = f.key"
        >
          {{ f.text }}
          <em v-if="f.key === 'due' && dueInPool">({{ dueInPool }})</em>
        </button>
      </div>
      <button type="button" class="fc-shuffle" :class="{ on: shuffled }" @click="shuffled = !shuffled">
        {{ shuffled ? '已打乱' : '打乱' }}
      </button>
    </div>

    <p class="fc-meta">
      共 {{ pool.length }} 张 · 已学 {{ learnedInPool }} · 到期 {{ dueInPool }} · 未学 {{ newInPool }}
      <template v-if="weekNo"> · 第 {{ weekNo }} 周</template>
    </p>

    <div v-if="!pool.length" class="fc-empty">
      <p>这一周还没有卡片。</p>
      <a :href="withBase('/cards/')">去记忆卡总览 →</a>
    </div>

    <div v-else-if="finished" class="fc-done">
      <h4>本轮结束 🎉</h4>
      <p>
        本轮评分 {{ session.graded }} 次
        <template v-if="session.again">，其中 {{ session.again }} 次「忘记」会排到本轮后面再出现</template>。
      </p>
      <p class="muted">
        今日全站：到期 {{ stats.due }} 张 · 已学 {{ stats.learned }}/{{ stats.total }} · 今天已复习
        {{ stats.reviewedToday }} 张
      </p>
      <div class="fc-done-actions">
        <button type="button" class="fc-btn primary" @click="restart('due')">再来一轮（到期）</button>
        <button type="button" class="fc-btn" @click="restart('all')">重看全部</button>
        <a class="fc-btn ghost" :href="withBase('/cards/')">记忆卡总览</a>
      </div>
    </div>

    <div v-else-if="current" class="fc-stage">
      <div class="fc-progress">
        <span :style="{ width: progressPercent + '%' }"></span>
      </div>
      <p class="fc-counter">
        {{ index + 1 }} / {{ queue.length }} · 第 {{ current.week }} 周 · {{ current.tag }}
      </p>

      <div class="fc-card" :class="{ revealed }" role="button" tabindex="0" @click="flip" @keydown.enter.prevent="flip">
        <div class="fc-q">{{ current.front }}</div>
        <div v-if="revealed" class="fc-a">{{ current.back }}</div>
        <div v-else class="fc-hint">点卡片看答案<span class="fc-kb">（空格）</span></div>
      </div>

      <div v-if="!revealed" class="fc-actions single">
        <button type="button" class="fc-btn primary wide" @click="flip">显示答案</button>
      </div>
      <div v-else class="fc-actions">
        <button
          v-for="(p, i) in predictions"
          :key="p.q"
          type="button"
          class="fc-btn"
          :class="p.cls"
          @click="grade(p.q)"
        >
          <span class="grade-label">{{ i + 1 }}. {{ p.label }}</span>
          <span class="grade-hint">{{ p.hint }} · 下次 {{ p.label }}</span>
        </button>
      </div>

      <div class="fc-foot">
        <span class="muted">
          进度自动保存在本机<template v-if="localFile.enabled">，本地开发时写入
          <code>docs/data/review-state.json</code></template>
          <template v-if="localFile.savedAt">（{{ localFile.savedAt }}）</template>
          <span v-if="localFile.error" class="fc-error"> · {{ localFile.error }}</span>
        </span>
        <span class="muted">空格翻面 · 1–4 评分</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fc {
  margin: 16px 0;
}
.fc-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.fc-filters {
  display: flex;
  gap: 6px;
}
.fc-tab {
  font-size: 12.5px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.fc-tab.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}
.fc-tab em {
  font-style: normal;
  opacity: 0.85;
}
.fc-shuffle {
  font-size: 12px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px dashed var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.fc-shuffle.on {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.fc-meta {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  margin: 8px 0 12px;
}
.fc-stage {
  position: relative;
}
.fc-progress {
  height: 3px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  overflow: hidden;
  margin-bottom: 10px;
}
.fc-progress span {
  display: block;
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.25s ease;
}
.fc-counter {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  margin: 0 0 8px;
  font-family: var(--vp-font-family-mono, monospace);
}
.fc-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  padding: 22px 20px;
  min-height: 190px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}
.fc-card:focus-visible {
  border-color: var(--vp-c-brand-1);
}
.fc-card.revealed {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 6px 24px rgba(91, 108, 255, 0.12);
}
.fc-q {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.65;
}
.fc-a {
  font-size: 14px;
  line-height: 1.8;
  color: var(--vp-c-text-1);
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 14px;
  white-space: pre-wrap;
}
.fc-hint {
  margin-top: auto;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.fc-kb {
  opacity: 0.7;
}
.fc-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}
.fc-actions.single {
  grid-template-columns: 1fr;
}
.fc-btn {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
  padding: 9px 6px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
}
.fc-btn:hover {
  border-color: var(--vp-c-brand-1);
}
.fc-btn.primary {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}
.fc-btn.wide {
  padding: 11px;
  font-weight: 600;
}
.fc-btn.again {
  border-color: rgba(239, 68, 68, 0.45);
  color: #dc2626;
}
.fc-btn.hard {
  border-color: rgba(245, 158, 11, 0.45);
  color: #d97706;
}
.fc-btn.good {
  border-color: rgba(16, 185, 129, 0.45);
  color: #059669;
}
.fc-btn.easy {
  border-color: rgba(59, 130, 246, 0.45);
  color: #2563eb;
}
.grade-label {
  font-weight: 600;
  font-size: 12.5px;
}
.grade-hint {
  font-size: 10px;
  color: var(--vp-c-text-3);
}
.fc-foot {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
}
.fc-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  text-decoration: underline;
}
.fc-done {
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  padding: 18px;
  text-align: center;
}
.fc-done h4 {
  margin: 0 0 6px;
  font-size: 15px;
}
.fc-done p {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 4px 0;
}
.fc-done-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
  flex-wrap: wrap;
}
.fc-done-actions .fc-btn {
  flex-direction: row;
  padding: 7px 14px;
  font-size: 12.5px;
}
.fc-empty {
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  padding: 18px;
  font-size: 13px;
  text-align: center;
  color: var(--vp-c-text-2);
}
.muted {
  color: var(--vp-c-text-3);
  font-size: 11.5px;
}
.fc-error {
  color: #b91c1c;
}
@media (max-width: 640px) {
  .fc-card {
    padding: 18px 16px;
    min-height: 170px;
  }
  .fc-q {
    font-size: 16px;
  }
  .fc-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .grade-hint {
    display: none;
  }
}
</style>
