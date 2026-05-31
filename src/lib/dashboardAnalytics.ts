import type { Timestamp } from "firebase/firestore";
import type { ExchangeRequest, ExchangeStatus, Skill, SkillCategory } from "../types";

export interface DayBucket {
  label: string;
  key: string;
  date: Date;
}

export interface FlowPoint {
  label: string;
  total: number;
  completed: number;
}

export interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

export interface CategorySlice {
  name: SkillCategory | string;
  value: number;
  color: string;
}

export interface TrendResult {
  pct: number;
  up: boolean;
}

const STATUS_COLORS: Record<ExchangeStatus, string> = {
  pending: "#A2C2E8",
  negotiating: "#8eb4ff",
  accepted: "#A8D5BA",
  completed: "#5b8def",
  rejected: "#F5C896",
  cancelled: "#d0d8e8",
};

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Design: "#A2C2E8",
  Dev: "#5b8def",
  AI: "#0D1B3E",
  Writing: "#8eb4ff",
  Music: "#F5C896",
  Marketing: "#A8D5BA",
  Other: "#d0d8e8",
};

export function exchangeDate(ts: Timestamp): Date {
  return ts.toDate();
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getLastNDays(n: number): DayBucket[] {
  const today = startOfDay(new Date());
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (n - 1 - i));
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      key: date.toISOString().slice(0, 10),
      date,
    };
  });
}

export function getLastNMonths(n: number): DayBucket[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (n - 1 - i), 1);
    return {
      label: date.toLocaleDateString("en-US", { month: "short" }),
      key: `${date.getFullYear()}-${date.getMonth()}`,
      date,
    };
  });
}

export function buildWeeklyFlow(requests: ExchangeRequest[]): FlowPoint[] {
  const buckets = getLastNDays(7);
  return buckets.map(({ label, date }) => {
    const dayRequests = requests.filter((r) => isSameDay(exchangeDate(r.createdAt), date));
    return {
      label,
      total: dayRequests.length,
      completed: dayRequests.filter((r) => r.status === "completed").length,
    };
  });
}

export function buildRecentWeeksFlow(requests: ExchangeRequest[], weeks = 4): FlowPoint[] {
  const today = startOfDay(new Date());
  return Array.from({ length: weeks }, (_, i) => {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const inWeek = requests.filter((r) => {
      const d = startOfDay(exchangeDate(r.createdAt));
      return d >= weekStart && d <= weekEnd;
    });

    return {
      label: `W${weeks - i}`,
      total: inWeek.length,
      completed: inWeek.filter((r) => r.status === "completed").length,
    };
  }).reverse();
}

export function buildMonthlyFlow(requests: ExchangeRequest[]): FlowPoint[] {
  const buckets = getLastNMonths(12);
  return buckets.map(({ label, date }) => {
    const monthRequests = requests.filter((r) => {
      const d = exchangeDate(r.createdAt);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
    });
    return {
      label,
      total: monthRequests.length,
      completed: monthRequests.filter((r) => r.status === "completed").length,
    };
  });
}

export function buildStatusSlices(requests: ExchangeRequest[]): StatusSlice[] {
  const counts = new Map<ExchangeStatus, number>();
  for (const r of requests) {
    counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, v]) => v > 0)
    .map(([status, value]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value,
      color: STATUS_COLORS[status],
    }));
}

export function buildCategorySlices(skills: Skill[]): CategorySlice[] {
  const counts = new Map<SkillCategory, number>();
  for (const s of skills) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, v]) => v > 0)
    .map(([category, value]) => ({
      name: category,
      value,
      color: CATEGORY_COLORS[category],
    }));
}

export function buildSparkline(requests: ExchangeRequest[], days = 14): number[] {
  const buckets = getLastNDays(days);
  return buckets.map(({ date }) =>
    requests.filter((r) => isSameDay(exchangeDate(r.createdAt), date)).length,
  );
}

export function countInRange(
  requests: ExchangeRequest[],
  start: Date,
  end: Date,
  predicate?: (r: ExchangeRequest) => boolean,
): number {
  return requests.filter((r) => {
    const d = exchangeDate(r.createdAt);
    if (d < start || d > end) return false;
    return predicate ? predicate(r) : true;
  }).length;
}

export function computeTrend(current: number, previous: number): TrendResult {
  if (previous === 0) {
    return { pct: current > 0 ? 100 : 0, up: current >= previous };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct: Math.abs(pct), up: current >= previous };
}

export function successRate(requests: ExchangeRequest[]): number {
  const settled = requests.filter((r) =>
    ["completed", "rejected", "cancelled"].includes(r.status),
  );
  if (settled.length === 0) return 0;
  const completed = settled.filter((r) => r.status === "completed").length;
  return Math.round((completed / settled.length) * 100);
}

export function sumFlow(points: FlowPoint[]): { total: number; completed: number } {
  return points.reduce(
    (acc, p) => ({ total: acc.total + p.total, completed: acc.completed + p.completed }),
    { total: 0, completed: 0 },
  );
}
