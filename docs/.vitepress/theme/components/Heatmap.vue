<script setup lang="ts">
import { computed, ref } from 'vue';
import { parseDate, plan } from '../composables/plan';
import { heatmapRange, store } from '../composables/checkins';

const props = withDefaults(defineProps<{ start?: string; end?: string }>(), {
  start: plan.meta.start,
  end: plan.meta.end,
});

const selected = ref<string>('');

const cells = computed(() => heatmapRange(props.start, props.end));

const columns = computed(() => {
  const list = cells.value;
  if (!list.length) return [] as (typeof list)[number][][];
  const firstWeekday = (parseDate(list[0].date).getDay() + 6) % 7; // 0=周一
  const padded: (typeof list)[number][] = [...Array(firstWeekday).fill(null), ...list];
  const cols: (typeof list)[number][][] = [];
  for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7));
  return cols;
});

const monthLabels = computed(() => {
  const labels: { index: number; text: string }[] = [];
  let lastMonth = -1;
  columns.value.forEach((col, i) => {
    const first = col.find(Boolean);
    if (!first) return;
    const d = parseDate(first.date);
    if (d.getMonth() !== lastMonth) {
      lastMonth = d.getMonth();
      labels.push({ index: i, text: `${d.getMonth() + 1}月` });
    }
  });
  return labels;
});

function level(count: number): string {
  if (count <= 0) return 'l0';
  if (count <= 2) return 'l1';
  if (count <= 4) return 'l2';
  if (count <= 6) return 'l3';
  return 'l4';
}

function pick(date: string) {
  selected.value = date === selected.value ? '' : date;
}

const selectedEntry = computed(() => (selected.value ? store.entries[selected.value] : undefined));
</script>

<template>
  <div class="heatmap">
    <div class="hm-scroll">
      <div class="hm-grid">
        <div
          class="hm-months"
          :style="{ gridTemplateColumns: `repeat(${columns.length}, 12px)` }"
        >
          <span
            v-for="label in monthLabels"
            :key="label.index + label.text"
            class="hm-month"
            :style="{ gridColumnStart: label.index + 1 }"
            >{{ label.text }}</span
          >
        </div>
        <div class="hm-body">
          <div class="hm-weekdays">
            <span>一</span><span></span><span>三</span><span></span><span>五</span><span></span><span>日</span>
          </div>
          <div class="hm-cols">
            <div v-for="(col, ci) in columns" :key="ci" class="hm-col">
              <template v-for="(cell, ri) in col" :key="ri">
                <span v-if="!cell" class="hm-cell empty"></span>
                <button
                  v-else
                  type="button"
                  class="hm-cell"
                  :class="[level(cell.count), { active: selected === cell.date, future: cell.isFuture }]"
                  :title="`${cell.date} · 完成 ${cell.count} 项`"
                  @click="pick(cell.date)"
                ></button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hm-foot">
      <span v-if="selected" class="hm-detail">
        {{ selected }} · 完成 {{ selectedEntry?.items.length ?? 0 }} 项
        <template v-if="selectedEntry?.logs.length">
           · {{ selectedEntry.logs.length }} 条记录 ·
          {{ selectedEntry.logs[selectedEntry.logs.length - 1].text.slice(0, 40) }}
        </template>
        <template v-else-if="selectedEntry?.note"> · {{ selectedEntry.note.slice(0, 40) }}</template>
      </span>
      <span v-else class="hm-detail muted">点格子看当天记录</span>
      <span class="hm-legend">少 <i class="hm-cell l0"></i><i class="hm-cell l1"></i><i class="hm-cell l2"></i><i class="hm-cell l3"></i><i class="hm-cell l4"></i> 多</span>
    </div>
  </div>
</template>

<style scoped>
.heatmap {
  margin: 8px 0 16px;
}
.hm-scroll {
  overflow-x: auto;
  padding-bottom: 4px;
}
.hm-grid {
  min-width: max-content;
}
.hm-months {
  display: grid;
  gap: 3px;
  font-size: 10.5px;
  color: var(--vp-c-text-3);
  margin-left: 26px;
  margin-bottom: 3px;
  height: 14px;
}
.hm-month {
  grid-row: 1;
  white-space: nowrap;
}
.hm-body {
  display: flex;
  gap: 4px;
}
.hm-weekdays {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
  font-size: 9.5px;
  color: var(--vp-c-text-3);
  line-height: 12px;
  width: 22px;
  text-align: right;
}
.hm-cols {
  display: flex;
  gap: 3px;
}
.hm-col {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
}
.hm-cell {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: none;
  padding: 0;
  display: block;
  background: var(--vp-c-default-soft);
}
button.hm-cell {
  cursor: pointer;
}
.hm-cell.empty {
  background: transparent;
}
.hm-cell.l0 {
  background: var(--vp-c-default-soft);
  opacity: 0.85;
}
.hm-cell.l1 {
  background: rgba(91, 108, 255, 0.3);
}
.hm-cell.l2 {
  background: rgba(91, 108, 255, 0.55);
}
.hm-cell.l3 {
  background: rgba(91, 108, 255, 0.78);
}
.hm-cell.l4 {
  background: var(--vp-c-brand-1);
}
.hm-cell.future {
  opacity: 0.45;
}
.hm-cell.active {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
}
.hm-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--vp-c-text-2);
}
.hm-detail.muted {
  color: var(--vp-c-text-3);
}
.hm-legend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--vp-c-text-3);
}
.hm-legend i {
  display: inline-block;
}
</style>

