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
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 280);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="bg-white rounded-3xl border border-white shadow-card p-4 sm:p-6 min-w-0 max-w-full">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-navy">Upcoming exchanges</h2>
          <p className="text-xs text-muted mt-0.5">Pending and active barter requests</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link to="/requests" className="text-xs font-semibold text-teal hover:underline whitespace-nowrap px-1">
            View all
          </Link>
          {upcoming.length > 0 && (
            <>
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
            </>
          )}
        </div>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">No upcoming exchanges right now</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto overscroll-x-contain pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x snap-mandatory scrollbar-none scroll-smooth [scroll-padding-inline:1rem]"
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
              <Link
                key={r.id}
                to={`/chat/${r.id}`}
                className="flex-[0_0_85%] sm:flex-[0_0_240px] max-w-[280px] snap-start bg-surface2 rounded-2xl p-4 border border-border hover:border-teal/40 flex flex-col gap-3 shrink-0 min-h-[168px] min-w-0 overflow-hidden transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar initials={partnerInitials} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy truncate">{partnerName}</p>
                    <p className="text-[11px] text-muted truncate">{r.skillTitle}</p>
                  </div>
                </div>
                <p className="text-xs text-muted line-clamp-2 break-words flex-1">{r.scopeDescription}</p>
                <div className="flex items-center justify-between gap-2 mt-auto pt-1 min-w-0">
                  <span className="text-[10px] font-medium text-teal-dark bg-teal/10 px-2 py-0.5 rounded-full truncate min-w-0 max-w-[58%]">
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted shrink-0 whitespace-nowrap">
                    <Clock size={10} className="shrink-0" />
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
