<script setup lang="ts">
import { computed, ref } from 'vue';
import { withBase } from 'vitepress';
import { pad2, weekOfDate } from '../composables/plan';
import { store, addLog, removeLog, LOG_TAGS, type LogTag } from '../composables/checkins';

const props = defineProps<{
  date: string;
  /** 只读：周页面用，输入统一放在每日学习页。 */
  readonly?: boolean;
}>();

const text = ref('');
const tag = ref<LogTag>('idea');

const logs = computed(() => store.entries[props.date]?.logs ?? []);
const legacyNote = computed(() => store.entries[props.date]?.note?.trim() ?? '');

const studyHref = computed(() => {
  const week = weekOfDate(props.date);
  if (!week?.days?.length) return '';
  const index = week.days.findIndex((day) => day.date === props.date);
  return index >= 0 ? withBase(`/study/w${pad2(week.n)}d${index + 1}`) : '';
});

function timeOf(at: string): string {
  const date = new Date(at);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function setTag(key: string): void {
  tag.value = key as LogTag;
}

function send(): void {
  const value = text.value.trim();
  if (!value) return;
  addLog(props.date, value, tag.value);
  text.value = '';
}

function onEnter(event: KeyboardEvent): void {
  if (event.isComposing) return;
  event.preventDefault();
  send();
}

function remove(id: string): void {
  if (window.confirm('删除这条记录？')) removeLog(props.date, id);
}
</script>

<template>
  <div class="day-log">
    <ul v-if="logs.length || legacyNote" class="log-list">
      <li v-for="log in logs" :key="log.id" class="log-item">
        <span class="log-time">{{ timeOf(log.at) }}</span>
        <span class="log-tag" :class="log.tag">{{ LOG_TAGS[log.tag] }}</span>
        <span class="log-text">{{ log.text }}</span>
        <button
          v-if="!readonly"
          type="button"
          class="log-del"
          title="删除这条记录"
          @click="remove(log.id)"
        >
          ×
        </button>
      </li>
      <li v-if="legacyNote" class="log-item legacy">
        <span class="log-tag idea">旧记录</span>
        <span class="log-text">{{ legacyNote }}</span>
      </li>
    </ul>
    <p v-else-if="readonly" class="log-empty">今天还没有记录。</p>

    <a v-if="readonly && studyHref" class="log-link" :href="studyHref">去学习页记一句 →</a>

    <form v-if="!readonly" class="log-composer" @submit.prevent="send">
      <div class="log-tags">
        <button
          v-for="(label, key) in LOG_TAGS"
          :key="key"
          type="button"
          class="tag-btn"
          :class="[key, { active: tag === key }]"
          @click="setTag(key)"
        >
          {{ label }}
        </button>
      </div>
      <textarea
        v-model="text"
        rows="2"
        placeholder="记一句…（Enter 发送，Shift+Enter 换行）"
        @keydown.enter.exact="onEnter"
      ></textarea>
      <div class="log-actions">
        <span class="log-hint">已记 {{ logs.length }} 条</span>
        <button type="submit" class="log-send" :disabled="!text.trim()">发送</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.day-log {
  margin: 10px 0 0;
}
.log-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.log-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  font-size: 13.5px;
  line-height: 1.6;
}
.log-time {
  flex: none;
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono, monospace);
}
.log-tag {
  flex: none;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.6;
}
.log-tag.harvest {
  color: #15803d;
  background: rgba(34, 197, 94, 0.16);
}
.log-tag.blocker {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.16);
}
.log-tag.idea {
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}
.log-text {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-word;
}
.log-del {
  flex: none;
  border: none;
  background: none;
  padding: 0 2px;
  color: var(--vp-c-text-3);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}
.log-del:hover {
  color: #b91c1c;
}
.log-empty {
  margin: 6px 0;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}
.log-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12.5px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.log-composer {
  margin-top: 10px;
}
.log-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}
.tag-btn {
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
}
.tag-btn.harvest.active {
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.5);
  background: rgba(34, 197, 94, 0.12);
}
.tag-btn.blocker.active {
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.12);
}
.tag-btn.idea.active {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-3);
  background: var(--vp-c-default-soft);
}
.log-composer textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
}
.log-composer textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.log-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}
.log-hint {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.log-send {
  padding: 4px 16px;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 12.5px;
  cursor: pointer;
}
.log-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
