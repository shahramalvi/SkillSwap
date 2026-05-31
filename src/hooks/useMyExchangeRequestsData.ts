import { useEffect, useMemo, useState } from "react";
import { withDemoExchangeRequests } from "../lib/dashboardDemoData";
import { useAuthStore } from "../store/authStore";
import type { ExchangeRequest } from "../types";
import { useExchangeRequests } from "./useExchangeRequests";

export function useMyExchangeRequestsData() {
  const user = useAuthStore((s) => s.user);
  const { subscribeMyExchangeRequests } = useExchangeRequests();
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyExchangeRequests((r) => {
      setRequests(r);
      setLoading(false);
    });
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => {
      unsub?.();
      clearTimeout(timeout);
    };
  }, [subscribeMyExchangeRequests, user]);

  const { requests: displayRequests, isDemo } = useMemo(
    () => (user ? withDemoExchangeRequests(user, requests) : { requests: [], isDemo: false }),
    [user, requests],
  );

  return { user, loading, displayRequests, isDemo };
}
