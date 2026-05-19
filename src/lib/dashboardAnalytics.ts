import type { Timestamp } from "firebase/firestore";
import type { Transaction, TransactionStatus } from "../types";

export interface DayBucket {
  key: string;
  label: string;
  shortLabel: string;
}

export interface WeeklyFlowPoint extends DayBucket {
  earned: number;
  spent: number;
  net: number;
}

export interface ActivitySlot {
  label: string;
  earned: number;
  spent: number;
  net: number;
}

export interface StatusSlice {
  status: TransactionStatus;
  label: string;
  count: number;
  color: string;
}

const DAY_MS = 86_400_000;

export function transactionDate(createdAt: Timestamp): Date {
  if (createdAt && typeof createdAt.toDate === "function") {
    return createdAt.toDate();
  }
  return new Date();
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

/** Last N calendar days ending today (always length N). */
export function getLastNDays(n: number): DayBucket[] {
  const today = startOfDay(new Date());
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(today.getTime() - (n - 1 - i) * DAY_MS);
    return {
      key: dayKey(date),
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      shortLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });
}

export function buildWeeklyFlow(
  transactions: Transaction[],
  userId: string,
  days = 7,
): WeeklyFlowPoint[] {
  const buckets = getLastNDays(days);

  return buckets.map((bucket) => {
    let earned = 0;
    let spent = 0;

    for (const tx of transactions) {
      if (tx.status !== "completed") continue;
      if (dayKey(transactionDate(tx.createdAt)) !== bucket.key) continue;
      if (tx.receiverId === userId) earned += tx.tokens;
      if (tx.senderId === userId) spent += tx.tokens;
    }

    return { ...bucket, earned, spent, net: earned - spent };
  });
}

/** Fixed slot chart — pads with zero bars when fewer than `slots` completed txs. */
export function buildActivitySlots(
  transactions: Transaction[],
  userId: string,
  slots = 8,
): ActivitySlot[] {
  const completed = [...transactions]
    .filter((t) => t.status === "completed")
    .sort((a, b) => transactionDate(b.createdAt).getTime() - transactionDate(a.createdAt).getTime())
    .slice(0, slots)
    .reverse();

  const filled: ActivitySlot[] = completed.map((tx) => {
    const earned = tx.receiverId === userId ? tx.tokens : 0;
    const spent = tx.senderId === userId ? tx.tokens : 0;
    return {
      label: tx.description.slice(0, 10) || "Trade",
      earned,
      spent,
      net: earned - spent,
    };
  });

  const emptyCount = slots - filled.length;
  const emptySlots: ActivitySlot[] = Array.from({ length: emptyCount }, (_, i) => ({
    label: emptyCount === slots ? getLastNDays(slots)[i]?.shortLabel ?? "—" : "—",
    earned: 0,
    spent: 0,
    net: 0,
  }));

  if (filled.length === 0) {
    return getLastNDays(slots).map((d) => ({
      label: d.shortLabel,
      earned: 0,
      spent: 0,
      net: 0,
    }));
  }

  return [...emptySlots, ...filled];
}

export function buildStatusSlices(transactions: Transaction[]): StatusSlice[] {
  const statuses: { status: TransactionStatus; label: string; color: string }[] = [
    { status: "completed", label: "Completed", color: "#0D1B3E" },
    { status: "pending", label: "Pending", color: "#737373" },
    { status: "disputed", label: "Disputed", color: "#a3a3a3" },
  ];

  return statuses.map(({ status, label, color }) => ({
    status,
    label,
    color,
    count: transactions.filter((t) => t.status === status).length,
  }));
}

export function sumWeekly(points: WeeklyFlowPoint[]) {
  return points.reduce(
    (acc, p) => ({
      earned: acc.earned + p.earned,
      spent: acc.spent + p.spent,
      net: acc.net + p.net,
    }),
    { earned: 0, spent: 0, net: 0 },
  );
}
