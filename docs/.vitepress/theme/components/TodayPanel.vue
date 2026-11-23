<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import {
  currentWeek,
  todayItems,
  flatItems,
  todayStr,
  weekdayName,
  weekOfDate,
  isTodayInPlan,
  daysBetween,
  pad2,
  plan,
} from '../composables/plan';
import { doneSet, toggleItem, overview, store } from '../composables/checkins';

const today = todayStr();
const week = computed(() => currentWeek(today));
const inPlan = computed(() => isTodayInPlan(today));
const isWeekly = computed(() => !week.value.days?.length);
const items = computed(() => {
  if (!inPlan.value) return [];
  const dayItems = todayItems(week.value, today);
  if (dayItems.length) return dayItems;
  // 周粒度周次没有每日任务：直接展示本周清单，避免「今天没有排任务」的误导
  return isWeekly.value ? flatItems(week.value) : [];
});
const doneCount = computed(() => items.value.filter((i) => doneSet.value.has(i.id)).length);
const day = computed(() => week.value.days?.find((d) => d.date === today));
const latestLog = computed(() => {
  const entry = store.entries[today];
  if (!entry) return undefined;
  if (entry.logs.length) return entry.logs[entry.logs.length - 1];
  if (entry.note) return { tag: 'idea' as const, text: entry.note, at: '' };
  return undefined;
});
const studyLink = computed(() => {
  if (isWeekly.value) return withBase(`/study/week-${pad2(week.value.n)}`);
  const idx = week.value.days?.findIndex((d) => d.date === today) ?? -1;
  return idx >= 0 ? withBase(`/study/w${pad2(week.value.n)}d${idx + 1}`) : '';
});

const countdown = computed(() => {
  if (inPlan.value) return '';
  if (today < plan.meta.start) return `距离开营还有 ${daysBetween(today, plan.meta.start)} 天`;
  return `计划已结束 ${daysBetween(plan.meta.end, today)} 天`;
});
</script>

<template>
  <div class="today">
    <div class="today-head">
      <div>
        <span class="today-label">今天 · {{ today }} {{ weekdayName(today) }}</span>
        <h3 class="today-theme">
          第 {{ week.n }} 周 · {{ week.theme }}
        </h3>
      </div>
      <div class="today-links">
        <a class="today-link" :href="withBase(`/plan/week-${pad2(week.n)}`)">本周计划 →</a>
        <a v-if="studyLink" class="today-link" :href="studyLink">学习文档 →</a>
      </div>
    </div>

    <div v-if="!inPlan" class="today-empty">
      <p>{{ countdown }}。计划区间：{{ plan.meta.start }} → {{ plan.meta.end }}</p>
      <p class="muted">
        现在可以先把
        <a :href="withBase('/plan/week-01')">第 1 周</a>
        的环境搭建做了，或者打开
        <a :href="withBase('/checkin')">打卡页</a> 看看进度。
      </p>
    </div>

    <template v-else-if="items.length">
      <div class="today-bar">
        <span :style="{ width: (doneCount / items.length) * 100 + '%' }"></span>
      </div>
      <p class="today-meta">
        <template v-if="isWeekly">本周清单 · 任意天完成</template>
        <template v-else>{{ day?.focus }} · 计划 {{ day?.hours ?? 2 }}h</template>
        · 完成 {{ doneCount }}/{{ items.length }}
        <template v-if="overview.streak"> · 连续打卡 {{ overview.streak }} 天</template>
      </p>
      <ul class="today-list">
        <li v-for="item in items" :key="item.id" :class="{ done: doneSet.has(item.id) }">
          <label>
            <input
              type="checkbox"
              :checked="doneSet.has(item.id)"
              @change="toggleItem(item.id, item.date)"
            />
            <span>{{ item.text }}</span>
            <em v-if="item.min">{{ item.min }}m</em>
          </label>
        </li>
      </ul>
      <p v-if="latestLog" class="today-note">
        💬 {{ latestLog.text }}
        <span v-if="(store.entries[today]?.logs.length ?? 0) > 1" class="today-note-more">
          共 {{ store.entries[today]?.logs.length }} 条
        </span>
      </p>
    </template>

    <div v-else-if="inPlan" class="today-empty">
      <p>今天没有排任务（计划里的缓冲区）。</p>
      <p class="muted">
        建议：补昨天欠的账，或者去
        <a :href="withBase(`/cards/week-${pad2(week.n)}`)">背本周记忆卡</a>。
      </p>
    </div>
  </div>
</template>

<style scoped>
.today {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 16px 18px;
  background: var(--vp-c-bg-soft);
  margin: 16px 0;
}
.today-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.today-label {
  font-size: 12px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.02em;
}
.today-theme {
  margin: 4px 0 0;
  font-size: 16px;
  line-height: 1.4;
  border: none;
  padding: 0;
}
.today-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}
.today-link {
  font-size: 12.5px;
  white-space: nowrap;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.today-bar {
  height: 6px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  margin: 12px 0 8px;
  overflow: hidden;
}
.today-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand-1), #8b5cf6);
  transition: width 0.2s ease;
}
.today-meta {
  margin: 0 0 8px;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}
.today-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.today-list li {
  border-top: 1px dashed var(--vp-c-divider);
  padding: 7px 0;
}
.today-list li:first-child {
  border-top: none;
}
.today-list label {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  font-size: 13.5px;
  line-height: 1.55;
  cursor: pointer;
}
.today-list input {
  margin-top: 3px;
  width: 16px;
  height: 16px;
  flex: none;
  accent-color: var(--vp-c-brand-1);
}
.today-list li.done span {
  color: var(--vp-c-text-3);
  text-decoration: line-through;
}
.today-list em {
  flex: none;
  font-style: normal;
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono, monospace);
}
.today-note {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 8px 10px;
}
.today-note-more {
  margin-left: 6px;
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.today-empty p {
  margin: 8px 0;
  font-size: 13.5px;
}
.today-empty .muted {
  color: var(--vp-c-text-2);
  font-size: 12.5px;
}
</style>
