import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { exchangeDate } from "../../../lib/dashboardAnalytics";
import type { ExchangeRequest } from "../../../types";
import { Avatar } from "../../ui/Avatar";

interface UpcomingRequestsRowProps {
  requests: ExchangeRequest[];
  userId: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting response",
  negotiating: "In negotiation",
  accepted: "Active barter",
};

export function UpcomingRequestsRow({ requests, userId }: UpcomingRequestsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const upcoming = requests
    .filter((r) => ["pending", "negotiating", "accepted"].includes(r.status))
    .slice(0, 8);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <div className="bg-white rounded-3xl border border-white shadow-card p-4 sm:p-6 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-navy">Upcoming exchanges</h2>
          <p className="text-xs text-muted mt-0.5">Pending and active barter requests</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/requests" className="text-xs font-semibold text-teal hover:underline whitespace-nowrap">
            View all
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted hover:bg-surface2 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted hover:bg-surface2 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">No upcoming exchanges right now</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none"
        >
          {upcoming.map((r) => {
            const isProvider = r.providerId === userId;
            const partnerName = isProvider ? r.requesterName : r.providerName;
            const partnerInitials = partnerName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const date = exchangeDate(r.updatedAt ?? r.createdAt);

            return (
              <div
                key={r.id}
                className="min-w-[min(240px,85vw)] max-w-[240px] snap-start bg-surface2 rounded-2xl p-4 border border-white flex flex-col gap-3 shrink-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={partnerInitials} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{partnerName}</p>
                    <p className="text-[11px] text-muted truncate">{r.skillTitle}</p>
                  </div>
                </div>
                <p className="text-xs text-muted line-clamp-2">{r.scopeDescription}</p>
                <div className="flex items-center justify-between mt-auto pt-1 gap-2">
                  <span className="text-[10px] font-medium text-teal-dark bg-teal/10 px-2 py-0.5 rounded-full truncate">
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted shrink-0">
                    <Clock size={10} />
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
