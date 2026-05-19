import type { Transaction } from "../types";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export interface DebtEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  netTokens: number;
}

export function groupTransactionsByUser(
  transactions: Transaction[],
  currentUserId: string,
): DebtEntry[] {
  const map = new Map<string, DebtEntry>();

  for (const tx of transactions) {
    if (tx.status !== "pending") continue;

    const isSender = tx.senderId === currentUserId;
    const otherId = isSender ? tx.receiverId : tx.senderId;
    const otherName = isSender ? tx.receiverName : tx.senderName;
    const delta = isSender ? -tx.tokens : tx.tokens;

    const existing = map.get(otherId);
    if (existing) {
      existing.netTokens += delta;
    } else {
      map.set(otherId, {
        userId: otherId,
        userName: otherName,
        userAvatar: getInitials(otherName),
        netTokens: delta,
      });
    }
  }

  return Array.from(map.values()).filter((e) => e.netTokens !== 0);
}
