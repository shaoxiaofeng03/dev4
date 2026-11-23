import rawPlan from '../../../data/plan.json';

export interface Task {
  id: string;
  min: number;
  text: string;
  deliverable?: boolean;
}

export interface DayPlan {
  date: string;
  kind: 'weekday' | 'weekend';
  hours: number;
  focus: string;
  tasks: Task[];
  output: string;
}

export interface CheckItem {
  id: string;
  text: string;
}

export interface CardData {
  id: string;
  tag: string;
  front: string;
  back: string;
}

export interface WeekPlan {
  n: number;
  phase: string;
  start: string;
  end: string;
  hours: number;
  theme: string;
  goal: string;
  why: string;
  concepts: string[];
  detail?: boolean;
  days?: DayPlan[];
  checklist?: CheckItem[];
  deliverables: string[];
  checkpoints: string[];
  interview: string[];
  resources?: { title: string; url: string }[];
  retro?: string[];
  cards: CardData[];
}

export interface PhasePlan {
  id: string;
  name: string;
  weeks: [number, number];
  range: string;
  goal: string;
  proof: string;
}

export interface PlanData {
  meta: {
    title: string;
    subtitle: string;
    start: string;
    end: string;
    totalWeeks: number;
    hoursPerWeek: number;
    weeklyRhythm: { day: string; hours: string; detail: string }[];
    principles: string[];
    timelineNote: string;
  };
  phases: PhasePlan[];
  weeks: WeekPlan[];
}

export const plan = rawPlan as unknown as PlanData;
export const weeks: WeekPlan[] = plan.weeks;

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** YYYY-MM-DD，本地时区 */
export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export function weekdayName(s: string): string {
  return WEEKDAY_NAMES[parseDate(s).getDay()];
}

export function daysBetween(a: string, b: string): number {
  const ms = parseDate(b).getTime() - parseDate(a).getTime();
  return Math.round(ms / 86400000);
}

export function weekByNo(n: number): WeekPlan | undefined {
  return weeks.find((w) => w.n === n);
}

export function weekOfDate(date: string): WeekPlan | undefined {
  return weeks.find((w) => date >= w.start && date <= w.end);
}

/** 当前周：落在计划区间内就返回该周；早于开始返回第 1 周，晚于结束返回最后一周 */
export function currentWeek(date = todayStr()): WeekPlan {
  if (date < weeks[0].start) return weeks[0];
  const found = weekOfDate(date);
  if (found) return found;
  return weeks[weeks.length - 1];
}

export function isTodayInPlan(date = todayStr()): boolean {
  return date >= plan.meta.start && date <= plan.meta.end;
}

/** 一周内的全部可勾选项（含每日任务与周清单） */
export interface FlatItem {
  id: string;
  text: string;
  min: number;
  date: string;
  day?: string;
  kind: 'task' | 'check';
  deliverable?: boolean;
}

export function flatItems(week: WeekPlan): FlatItem[] {
  const out: FlatItem[] = [];
  if (week.days?.length) {
    for (const d of week.days) {
      for (const t of d.tasks) {
        out.push({
          id: t.id,
          text: t.text,
          min: t.min,
          date: d.date,
          day: weekdayName(d.date),
          kind: 'task',
          deliverable: t.deliverable,
        });
      }
    }
  }
  if (week.checklist?.length) {
    week.checklist.forEach((item, i) => {
      out.push({
        id: item.id,
        text: item.text,
        min: 0,
        date: week.start,
        kind: 'check',
      });
    });
  }
  return out;
}

export function todayItems(week: WeekPlan, date = todayStr()): FlatItem[] {
  return flatItems(week).filter((i) => i.date === date);
}

export const allWeeksItems = new Map<number, FlatItem[]>(
  weeks.map((w) => [w.n, flatItems(w)])
);
