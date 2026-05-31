import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthInit } from "../hooks/useAuth";
import { ensureBarterOffersLoaded } from "../lib/barterOffersStore";

export function AuthInit({ children }: { children: ReactNode }) {
  useAuthInit();

  useEffect(() => {
    void ensureBarterOffersLoaded();
  }, []);

  return children;
}
