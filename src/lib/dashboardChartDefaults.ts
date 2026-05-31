import type { FlowPoint } from "./dashboardAnalytics";
import type { CategorySlice, StatusSlice } from "./dashboardAnalytics";

/** Guaranteed-visible chart series — used when live data buckets are empty */
export const DEMO_FLOW_WEEK: FlowPoint[] = [
  { label: "Mon", total: 5, completed: 3 },
  { label: "Tue", total: 7, completed: 4 },
  { label: "Wed", total: 4, completed: 2 },
  { label: "Thu", total: 9, completed: 6 },
  { label: "Fri", total: 6, completed: 4 },
  { label: "Sat", total: 3, completed: 1 },
  { label: "Sun", total: 5, completed: 3 },
];

export const DEMO_FLOW_MONTH: FlowPoint[] = [
  { label: "W1", total: 12, completed: 8 },
  { label: "W2", total: 15, completed: 10 },
  { label: "W3", total: 11, completed: 7 },
  { label: "W4", total: 18, completed: 12 },
];

export const DEMO_FLOW_YEAR: FlowPoint[] = [
  { label: "Jan", total: 8, completed: 5 },
  { label: "Feb", total: 10, completed: 6 },
  { label: "Mar", total: 12, completed: 8 },
  { label: "Apr", total: 9, completed: 6 },
  { label: "May", total: 14, completed: 9 },
  { label: "Jun", total: 11, completed: 7 },
  { label: "Jul", total: 16, completed: 11 },
  { label: "Aug", total: 13, completed: 9 },
  { label: "Sep", total: 15, completed: 10 },
  { label: "Oct", total: 18, completed: 12 },
  { label: "Nov", total: 14, completed: 9 },
  { label: "Dec", total: 20, completed: 14 },
];

export const DEMO_SPARKLINE = [2, 4, 3, 6, 5, 8, 7, 9, 6, 10, 8, 11, 9, 12];

export const DEMO_CATEGORY_SLICES: CategorySlice[] = [
  { name: "Dev", value: 28, color: "#5b8def" },
  { name: "Design", value: 22, color: "#A2C2E8" },
  { name: "Writing", value: 18, color: "#8eb4ff" },
  { name: "Marketing", value: 16, color: "#A8D5BA" },
  { name: "AI", value: 10, color: "#0D1B3E" },
  { name: "Other", value: 6, color: "#d0d8e8" },
];

export const DEMO_STATUS_SLICES: StatusSlice[] = [
  { name: "Completed", value: 42, color: "#5b8def" },
  { name: "Accepted", value: 12, color: "#A8D5BA" },
  { name: "Pending", value: 8, color: "#A2C2E8" },
  { name: "Negotiating", value: 6, color: "#8eb4ff" },
  { name: "Rejected", value: 4, color: "#F5C896" },
];

export function demoFlowForRange(range: "week" | "month" | "year"): FlowPoint[] {
  if (range === "week") return DEMO_FLOW_WEEK;
  if (range === "month") return DEMO_FLOW_MONTH;
  return DEMO_FLOW_YEAR;
}

export function hasFlowData(points: FlowPoint[]): boolean {
  return points.some((p) => p.total > 0);
}
