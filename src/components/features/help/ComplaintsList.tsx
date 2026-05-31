import { useState } from "react";
import { isDemoComplaint } from "../../../lib/complaintDemoData";
import type { Complaint } from "../../../types";
import { COMPLAINT_CATEGORIES } from "../../../types";
import { cn } from "../../../lib/utils";
import { AppPanel, AppSectionTitle, tabButtonClass } from "../../layout/AppPage";
import { Skeleton } from "../../ui/Skeleton";

type Tab = "pending" | "resolved";

interface ComplaintsListProps {
  pending: Complaint[];
  resolved: Complaint[];
  loading: boolean;
}

function categoryLabel(id: Complaint["category"]) {
  return COMPLAINT_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const isDemo = isDemoComplaint(complaint.id);
  const date = complaint.createdAt?.toDate?.() ?? new Date();

  return (
    <div className="rounded-2xl border border-border/60 bg-surface2/50 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-teal-dark tabular-nums">{complaint.ticketId}</p>
          <p className="text-sm font-bold text-navy mt-0.5 truncate">{complaint.subject}</p>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full shrink-0",
            complaint.status === "pending"
              ? "bg-gold-light text-navy"
              : "bg-teal/15 text-teal-dark",
          )}
        >
          {complaint.status}
        </span>
      </div>
      <p className="text-xs text-muted line-clamp-2">{complaint.description}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        <span>{categoryLabel(complaint.category)}</span>
        <span>{formatRelative(date)} ago</span>
        {isDemo && <span className="text-teal-dark font-semibold">Sample</span>}
      </div>
    </div>
  );
}

export function ComplaintsList({ pending, resolved, loading }: ComplaintsListProps) {
  const [tab, setTab] = useState<Tab>("pending");

  const list = tab === "pending" ? pending : resolved;

  return (
    <AppPanel className="p-5">
      <AppSectionTitle title="Your complaints" description="Track pending and resolved tickets" />

      <div className="flex flex-wrap gap-2 mt-4 mb-4">
        <button
          type="button"
          onClick={() => setTab("pending")}
          className={tabButtonClass(tab === "pending")}
        >
          Pending {pending.length > 0 && `(${pending.length})`}
        </button>
        <button
          type="button"
          onClick={() => setTab("resolved")}
          className={tabButtonClass(tab === "resolved")}
        >
          Resolved {resolved.length > 0 && `(${resolved.length})`}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">
          {tab === "pending"
            ? "No pending complaints. Use the complaint bot to file one."
            : "No resolved complaints yet."}
        </p>
      ) : (
        <div className="space-y-3 max-h-[min(520px,55vh)] overflow-y-auto pr-1">
          {list.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
    </AppPanel>
  );
}
