import { useEffect, useMemo, useState } from "react";
import { ExchangeRequestCard } from "../components/features/ExchangeRequestCard";
import { Container } from "../components/layout/Container";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Skeleton } from "../components/ui/Skeleton";
import { useExchangeRequests } from "../hooks/useExchangeRequests";
import { useAuthStore } from "../store/authStore";
import type { ExchangeRequest } from "../types";
import { cn } from "../lib/utils";

type Tab = "incoming" | "outgoing" | "active";

export function Requests() {
  const user = useAuthStore((s) => s.user);
  const { subscribeMyExchangeRequests } = useExchangeRequests();
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("incoming");

  useEffect(() => {
    const unsub = subscribeMyExchangeRequests((r) => {
      setRequests(r);
      setLoading(false);
    });
    return () => unsub?.();
  }, [subscribeMyExchangeRequests]);

  const filtered = useMemo(() => {
    if (!user) return [];
    if (tab === "incoming") {
      return requests.filter(
        (r) =>
          r.providerId === user.uid &&
          ["pending", "negotiating"].includes(r.status),
      );
    }
    if (tab === "outgoing") {
      return requests.filter(
        (r) =>
          r.requesterId === user.uid &&
          ["pending", "negotiating"].includes(r.status),
      );
    }
    return requests.filter((r) =>
      ["accepted", "negotiating"].includes(r.status),
    );
  }, [requests, tab, user]);

  const incomingCount = requests.filter(
    (r) =>
      user &&
      r.providerId === user.uid &&
      ["pending", "negotiating"].includes(r.status),
  ).length;

  return (
    <PageWrapper className="min-h-screen bg-canvas pb-20">
      <div className="bg-hero-gradient pt-24 pb-10 dot-pattern mb-6">
        <Container size="narrow" className="relative z-10">
          <h1 className="text-3xl font-extrabold text-on-hero">Requests</h1>
          <p className="text-on-hero-muted text-sm mt-1">
            Negotiate, accept barter or token offers
            {incomingCount > 0 && (
              <span className="ml-2 bg-teal/20 text-on-hero px-2 py-0.5 rounded-full text-xs font-bold">
                {incomingCount} need response
              </span>
            )}
          </p>
        </Container>
      </div>

      <Container size="narrow">
        <div className="flex gap-2 mb-6">
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
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                tab === key
                  ? "bg-navy text-on-hero"
                  : "bg-white border border-border text-muted hover:text-navy",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted text-sm">
            No requests in this tab.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => (
              <ExchangeRequestCard key={r.id} request={r} />
            ))}
          </div>
        )}
      </Container>
    </PageWrapper>
  );
}
