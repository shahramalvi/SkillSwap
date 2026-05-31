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

type Tab = "incoming" | "outgoing" | "active";

export function Requests() {
  const { user, loading, displayRequests, isDemo } = useMyExchangeRequestsData();
  const [tab, setTab] = useState<Tab>("incoming");

  const stats = useMemo(() => {
    if (!user) {
      return { incoming: 0, outgoing: 0, active: 0, total: 0 };
    }
    const incoming = displayRequests.filter(
      (r) =>
        r.providerId === user.uid && ["pending", "negotiating"].includes(r.status),
    ).length;
    const outgoing = displayRequests.filter(
      (r) =>
        r.requesterId === user.uid && ["pending", "negotiating"].includes(r.status),
    ).length;
    const active = displayRequests.filter((r) =>
      ["accepted", "negotiating"].includes(r.status),
    ).length;
    return { incoming, outgoing, active, total: displayRequests.length };
  }, [displayRequests, user]);

  const filtered = useMemo(() => {
    if (!user) return [];
    if (tab === "incoming") {
      return displayRequests.filter(
        (r) =>
          r.providerId === user.uid &&
          ["pending", "negotiating"].includes(r.status),
      );
    }
    if (tab === "outgoing") {
      return displayRequests.filter(
        (r) =>
          r.requesterId === user.uid &&
          ["pending", "negotiating"].includes(r.status),
      );
    }
    return displayRequests.filter((r) =>
      ["accepted", "negotiating"].includes(r.status),
    );
  }, [displayRequests, tab, user]);

  if (!user) return null;

  return (
    <AppPage>
      {isDemo && (
        <DemoDataBanner message="Sample requests — respond to real ones once members send you proposals." />
      )}

      <AppPageSplit
        aside={
          <>
            <AppAsidePanel title="Overview">
              <AppStatRow label="Need response" value={stats.incoming} highlight={stats.incoming > 0} />
              <AppStatRow label="Sent (pending)" value={stats.outgoing} />
              <AppStatRow label="Active exchanges" value={stats.active} />
              <AppStatRow label="Total requests" value={stats.total} />
            </AppAsidePanel>
            <AppAsidePanel title="Quick links">
              <div className="space-y-2 text-sm">
                <Link to="/proposals" className="inline-flex items-center gap-0.5 font-semibold text-teal hover:underline">
                  View your proposals <ChevronRight size={14} />
                </Link>
                <Link to="/jobs" className="inline-flex items-center gap-0.5 font-semibold text-muted hover:text-navy">
                  Browse jobs <ChevronRight size={14} />
                </Link>
              </div>
            </AppAsidePanel>
          </>
        }
        main={
          <>
            <AppPanel className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ["incoming", "Incoming"],
                    ["outgoing", "Sent"],
                    ["active", "Active"],
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
                {stats.incoming > 0 && (
                  <span className="ml-auto bg-teal/10 text-teal-dark px-2.5 py-1 rounded-full text-xs font-bold">
                    {stats.incoming} need response
                  </span>
                )}
              </div>
            </AppPanel>

            {loading && !isDemo ? (
              <Skeleton className="h-40 rounded-3xl" />
            ) : filtered.length === 0 ? (
              <AppPanel className="p-12 text-center text-muted text-sm">
                No requests in this tab.
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
