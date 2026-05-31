import { doc, updateDoc } from "firebase/firestore";
import { useCallback } from "react";
import { db } from "../lib/firebase";
import { getPlan } from "../lib/plans";
import {
  getSubscriptionInfo,
  subscriptionEndsAtFromNow,
  userHasAccess,
} from "../lib/subscription";
import { useAuthStore } from "../store/authStore";
import type { PlanId } from "../lib/plans";

export function useSubscription() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const info = user ? getSubscriptionInfo(user) : null;

  const activatePlan = useCallback(
    async (planId: PlanId) => {
      if (!user) throw new Error("Not authenticated");

      const plan = getPlan(planId);
      const subscriptionEndsAt = subscriptionEndsAtFromNow(plan.billingMonths);
      await updateDoc(doc(db, "users", user.uid), {
        subscriptionStatus: "active",
        subscriptionPlan: planId,
        subscriptionEndsAt,
      });

      const updated = {
        ...user,
        subscriptionStatus: "active" as const,
        subscriptionPlan: planId,
        subscriptionEndsAt,
      };
      setUser(updated);
      return updated;
    },
    [user, setUser],
  );

  return {
    info,
    hasAccess: user ? userHasAccess(user) : false,
    activatePlan,
  };
}
