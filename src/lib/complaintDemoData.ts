import { Timestamp } from "firebase/firestore";
import type { Complaint } from "../types";

const DEMO_COMPLAINT_IDS = ["demo-complaint-1", "demo-complaint-2"] as const;

function ts(daysAgo: number): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return Timestamp.fromDate(d);
}

export function isDemoComplaint(id: string): boolean {
  return DEMO_COMPLAINT_IDS.includes(id as (typeof DEMO_COMPLAINT_IDS)[number]);
}

export function getDemoComplaints(userId: string): Complaint[] {
  return [
    {
      id: "demo-complaint-1",
      userId,
      ticketId: "CMP-D4E2F1",
      category: "exchange",
      subject: "Exchange scope disagreement",
      description:
        "Sample resolved complaint — the other member and I could not agree on deliverables after two counter-offers.",
      relatedTo: "Logo design ↔ React landing page exchange",
      email: "demo@skillswap.pk",
      status: "resolved",
      createdAt: ts(12),
      resolvedAt: ts(5),
    },
    {
      id: "demo-complaint-2",
      userId,
      ticketId: "CMP-A8B3C2",
      category: "technical",
      subject: "Could not upload resume",
      description:
        "Sample resolved complaint — PDF upload failed on mobile Safari; workaround was using desktop.",
      email: "demo@skillswap.pk",
      status: "resolved",
      createdAt: ts(20),
      resolvedAt: ts(18),
    },
  ];
}

export function withDemoComplaints(
  live: Complaint[],
  userId: string | undefined,
  includeDemo: boolean,
): Complaint[] {
  if (!includeDemo || !userId) return live;
  const demo = getDemoComplaints(userId);
  const liveIds = new Set(live.map((c) => c.id));
  const merged = [...live, ...demo.filter((d) => !liveIds.has(d.id))];
  return merged.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}
