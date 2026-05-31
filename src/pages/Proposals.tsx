import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoDataBanner } from "../components/features/DemoDataBanner";
import { ExchangeRequestCard } from "../components/features/ExchangeRequestCard";
import {
  AppAsidePanel,
  AppPage,
  AppPageSplit,
  AppPanel,
  AppStatRow,
  tabButtonClass,
} from "../components/layout/AppPage";
import { Skeleton } from "../components/ui/Skeleton";
import { useMyExchangeRequestsData } from "../hooks/useMyExchangeRequestsData";

type Tab = "all" | "pending" | "active" | "closed";

export function Proposals() {
  const { user, loading, displayRequests, isDemo } = useMyExchangeRequestsData();
  const [tab, setTab] = useState<Tab>("all");

  const proposals = useMemo(() => {
    if (!user) return [];
    return displayRequests.filter((r) => r.requesterId === user.uid);
  }, [displayRequests, user]);

  const stats = useMemo(
    () => ({
      total: proposals.length,
      pending: proposals.filter((r) => ["pending", "negotiating"].includes(r.status)).length,
      active: proposals.filter((r) => r.status === "accepted").length,
      closed: proposals.filter((r) =>
        ["completed", "rejected", "cancelled"].includes(r.status),
      ).length,
    }),
    [proposals],
  );

  const filtered = useMemo(() => {
    if (tab === "pending") {
      return proposals.filter((r) => ["pending", "negotiating"].includes(r.status));
    }
    if (tab === "active") {
      return proposals.filter((r) => r.status === "accepted");
    }
    if (tab === "closed") {
      return proposals.filter((r) =>
        ["completed", "rejected", "cancelled"].includes(r.status),
      );
    }
    return proposals;
  }, [proposals, tab]);

  if (!user) return null;

  return (
    <AppPage>
      {isDemo && (
        <DemoDataBanner message="Sample proposals you've sent — browse jobs and request a skill to create real ones." />
      )}

      <AppPageSplit
        aside={
          <>
            <AppAsidePanel title="Your proposals">
              <AppStatRow label="Awaiting response" value={stats.pending} highlight={stats.pending > 0} />
              <AppStatRow label="Active" value={stats.active} />
              <AppStatRow label="Closed" value={stats.closed} />
              <AppStatRow label="Total sent" value={stats.total} />
            </AppAsidePanel>
            <AppAsidePanel title="Next step">
              <p className="text-sm text-muted leading-relaxed">
                Find a skill on the jobs board and send a barter proposal to start a real exchange.
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-0.5 mt-3 text-sm font-semibold text-teal hover:underline"
              >
                Browse jobs <ChevronRight size={14} />
              </Link>
            </AppAsidePanel>
          </>
        }
        main={
          <>
            <AppPanel className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ["all", "All"],
                    ["pending", "Pending"],
                    ["active", "Active"],
                    ["closed", "Closed"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={tabButtonClass(tab === key)}
                  >
                    {label}
                  </button>
                ))}
                {stats.pending > 0 && (
                  <span className="ml-auto bg-teal/10 text-teal-dark px-2.5 py-1 rounded-full text-xs font-bold">
                    {stats.pending} awaiting response
                  </span>
                )}
              </div>
            </AppPanel>

            {loading && !isDemo ? (
              <Skeleton className="h-40 rounded-3xl" />
            ) : filtered.length === 0 ? (
              <AppPanel className="p-12 text-center text-muted text-sm">
                {proposals.length === 0
                  ? "You haven't sent any proposals yet. Find a skill and request a service to get started."
                  : "No proposals in this tab."}
              </AppPanel>
            ) : (
              <div className="space-y-4">
                {filtered.map((r) => (
                  <ExchangeRequestCard key={r.id} request={r} />
                ))}
              </div>
            )}
          </>
        }
      />
    </AppPage>
  );
}
