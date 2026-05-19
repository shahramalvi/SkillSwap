import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setTokenBalance: (tokenBalance: number) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setTokenBalance: (tokenBalance) =>
    set((state) =>
      state.user ? { user: { ...state.user, tokenBalance } } : state,
    ),
  reset: () => set({ user: null, loading: false }),
}));
