<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import { weekByNo, weekdayName, todayStr, pad2, type DayPlan } from '../composables/plan';
import { store, toggleItem, setNote, doneSet, weekStats } from '../composables/checkins';

const props = defineProps<{ week: string | number }>();

const w = computed(() => weekByNo(Number(props.week)));
const stats = computed(() => weekStats(Number(props.week)));
const today = todayStr();

function dayDone(day: DayPlan): number {
  return day.tasks.filter((t) => doneSet.value.has(t.id)).length;
}

function onNote(date: string, e: Event) {
  setNote(date, (e.target as HTMLTextAreaElement).value);
}

function logCount(date: string): number {
  const entry = store.entries[date];
  if (!entry) return 0;
  return entry.logs.length + (entry.note?.trim() ? 1 : 0);
}

function checkAll() {
  const week = w.value;
  if (!week) return;
  if (week.days) {
    for (const d of week.days) {
      for (const t of d.tasks) if (!doneSet.value.has(t.id)) toggleItem(t.id, d.date);
    }
  }
  if (week.checklist) {
    for (const c of week.checklist) if (!doneSet.value.has(c.id)) toggleItem(c.id, week.start);
  }
}

function progressLabel(n: number, total: number) {
  return `${n}/${total}`;
}
</script>

<template>
  <div v-if="w" class="week-tasks">
    <div class="wk-head">
      <div class="wk-progress">
        <div class="wk-bar">
          <span :style="{ width: stats.percent + '%' }"></span>
        </div>
        <span class="wk-num">
          已完成 <strong>{{ stats.done }}</strong> / {{ stats.total }}（{{ stats.percent }}%）
        </span>
      </div>
      <div class="wk-actions">
        <button type="button" class="mini" @click="checkAll">全部勾选</button>
        <a class="mini" :href="withBase(`/cards/week-${pad2(w.n)}`)">本周记忆卡</a>
        <a class="mini" :href="withBase('/checkin')">打卡总览</a>
      </div>
    </div>

    <template v-if="w.days?.length">
      <section
        v-for="(day, dayIndex) in w.days"
        :key="day.date"
        class="day"
        :class="{ 'is-today': day.date === today, weekend: day.kind === 'weekend' }"
      >
        <header class="day-head">
          <span class="day-wd">{{ weekdayName(day.date) }}</span>
          <span class="day-date">{{ day.date.slice(5) }}</span>
          <span v-if="day.date === today" class="day-today">今天</span>
          <span class="day-hours">{{ day.hours }}h</span>
          <span class="day-count">{{ progressLabel(dayDone(day), day.tasks.length) }}</span>
          <a class="day-study" :href="withBase(`/study/w${pad2(Number(w.n))}d${dayIndex + 1}`)">学习 →</a>
        </header>
        <p class="day-focus">{{ day.focus }}</p>
        <ul class="tasks">
          <li
            v-for="t in day.tasks"
            :key="t.id"
            :class="{ done: doneSet.has(t.id) }"
          >
            <label>
              <input
                type="checkbox"
                :checked="doneSet.has(t.id)"
                @change="toggleItem(t.id, day.date)"
              />
              <span class="task-text">{{ t.text }}</span>
              <span class="task-min">{{ t.min }}m</span>
              <span v-if="t.deliverable" class="task-dlv">交付</span>
            </label>
          </li>
        </ul>
        <p class="day-output">{{ day.output }}</p>
        <details class="day-note">
          <summary>
            💬 今日记录
            <span v-if="logCount(day.date)" class="log-count">{{ logCount(day.date) }}</span>
          </summary>
          <DayLog :date="day.date" readonly />
        </details>
      </section>
    </template>

    <template v-else>
      <section class="day">
        <header class="day-head">
          <span class="day-wd">本周清单</span>
          <span class="day-date">{{ w.start.slice(5) }} 起</span>
          <a class="day-study" :href="withBase(`/study/week-${pad2(Number(w.n))}`)">学习指南 →</a>
        </header>
        <p class="day-focus">按清单推进，开始前把它们拆到 7 天里</p>
        <ul class="tasks">
          <li
            v-for="item in w.checklist"
            :key="item.id"
            :class="{ done: doneSet.has(item.id) }"
          >
            <label>
              <input
                type="checkbox"
                :checked="doneSet.has(item.id)"
                @change="toggleItem(item.id, w.start)"
              />
              <span class="task-text">{{ item.text }}</span>
            </label>
          </li>
        </ul>
        <details class="day-note">
          <summary>✍️ 本周记录</summary>
          <textarea
            :value="store.entries[w.start]?.note ?? ''"
            rows="3"
            placeholder="本周进展、卡点、下周要改的一件事…"
            @input="onNote(w.start, $event)"
          ></textarea>
        </details>
      </section>
    </template>
  </div>
</template>

<style scoped>
.week-tasks {
  margin: 18px 0 8px;
}
.wk-head {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.wk-progress {
  flex: 1;
  min-width: 220px;
}
.wk-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  overflow: hidden;
}
.wk-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), #8b5cf6);
  transition: width 0.25s ease;
}
.wk-num {
  display: inline-block;
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}
.wk-actions {
  display: flex;
  gap: 8px;
}
.mini {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}
.mini:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.day {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: var(--vp-c-bg-soft);
}
.day.is-today {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 1px var(--vp-c-brand-1) inset;
}
.day.weekend {
  background: var(--vp-c-bg-alt);
}
.day-head {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.day-wd {
  font-weight: 700;
  color: var(--vp-c-text-1);
  font-size: 14px;
}
.day-today {
  font-size: 11px;
  color: #fff;
  background: var(--vp-c-brand-1);
  border-radius: 999px;
  padding: 0 7px;
}
.day-hours,
.day-count {
  margin-left: auto;
  font-size: 12px;
}
.day-count {
  margin-left: 0;
  color: var(--vp-c-brand-1);
}
.day-study {
  margin-left: 10px;
  font-size: 12px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  white-space: nowrap;
}
.day-focus {
  margin: 6px 0 8px;
  font-size: 13.5px;
  color: var(--vp-c-text-1);
}
.tasks {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tasks li {
  border-top: 1px dashed var(--vp-c-divider);
  padding: 7px 0;
}
.tasks li:first-child {
  border-top: none;
}
.tasks label {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  cursor: pointer;
  font-size: 13.5px;
  line-height: 1.55;
}
.tasks input[type='checkbox'] {
  margin-top: 3px;
  width: 16px;
  height: 16px;
  flex: none;
  accent-color: var(--vp-c-brand-1);
}
.task-text {
  flex: 1;
}
.tasks li.done .task-text {
  color: var(--vp-c-text-3);
  text-decoration: line-through;
}
.task-min {
  flex: none;
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono, monospace);
}
.task-dlv {
  flex: none;
  font-size: 10.5px;
  padding: 0 6px;
  border-radius: 999px;
  color: #7c3aed;
  background: rgba(139, 92, 246, 0.14);
}
.day-output {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.day-note {
  margin-top: 8px;
}
.day-note summary {
  cursor: pointer;
  font-size: 12px;
  color: var(--vp-c-text-3);
  list-style: none;
}
.day-note summary::-webkit-details-marker {
  display: none;
}
.log-count {
  display: inline-block;
  min-width: 16px;
  margin-left: 4px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 10.5px;
  text-align: center;
}
.day-note textarea {
  width: 100%;
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
}
@media (max-width: 640px) {
  .day {
    padding: 10px 11px;
  }
  .task-min {
    display: none;
  }
}
</style>
