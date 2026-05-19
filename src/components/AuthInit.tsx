import type { ReactNode } from "react";
import { useAuthInit } from "../hooks/useAuth";

export function AuthInit({ children }: { children: ReactNode }) {
  useAuthInit();
  return children;
}
