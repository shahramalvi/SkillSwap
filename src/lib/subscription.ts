import { Timestamp } from "firebase/firestore";
import { DEFAULT_PLAN_ID, getPlanName } from "./plans";
import { TRIAL_DAYS, type PlanId, type SubscriptionStatus, type User } from "../types";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  hasAccess: boolean;
  daysRemaining: number;
  label: string;
  endsAt: Date | null;
  planId?: PlanId;
  planName?: string;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function trialEndsAtFromSignup(signup = new Date()): Timestamp {
  return Timestamp.fromDate(addDays(signup, TRIAL_DAYS));
}

export function subscriptionEndsAtFromNow(billingMonths: number): Timestamp {
  return Timestamp.fromDate(addMonths(new Date(), billingMonths));
}

export function normalizeUser(raw: Record<string, unknown> & { uid: string }): User {
  const createdAt =
    raw.createdAt instanceof Timestamp ? raw.createdAt : Timestamp.now();
  const signupDate = createdAt.toDate();

  const trialEndsAt =
    raw.trialEndsAt instanceof Timestamp
      ? raw.trialEndsAt
      : trialEndsAtFromSignup(signupDate);

  return {
    uid: raw.uid,
    name: (raw.name as string) ?? "User",
    email: (raw.email as string) ?? "",
    avatar: (raw.avatar as string) ?? "U",
    bio: (raw.bio as string) ?? "",
    createdAt,
    subscriptionStatus: (raw.subscriptionStatus as SubscriptionStatus) ?? "trial",
    subscriptionPlan: raw.subscriptionPlan as PlanId | undefined,
    trialEndsAt,
    subscriptionEndsAt:
      raw.subscriptionEndsAt instanceof Timestamp ? raw.subscriptionEndsAt : undefined,
    resumeUrl: raw.resumeUrl as string | undefined,
    resumeStoragePath: raw.resumeStoragePath as string | undefined,
    resumeFileName: raw.resumeFileName as string | undefined,
    resumeUpdatedAt:
      raw.resumeUpdatedAt instanceof Timestamp ? raw.resumeUpdatedAt : undefined,
  };
}

export function getSubscriptionInfo(user: User, now = new Date()): SubscriptionInfo {
  const msPerDay = 86400000;

  if (user.subscriptionStatus === "active" && user.subscriptionEndsAt) {
    const endsAt = user.subscriptionEndsAt.toDate();
    const daysRemaining = Math.max(
      0,
      Math.ceil((endsAt.getTime() - now.getTime()) / msPerDay),
    );
    if (endsAt.getTime() > now.getTime()) {
      const planName = getPlanName(user.subscriptionPlan);
      return {
        status: "active",
        hasAccess: true,
        daysRemaining,
        label: `${planName} · ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`,
        endsAt,
        planId: user.subscriptionPlan ?? DEFAULT_PLAN_ID,
        planName,
      };
    }
    return {
      status: "expired",
      hasAccess: false,
      daysRemaining: 0,
      label: "Plan expired",
      endsAt,
    };
  }

  const trialEnd = user.trialEndsAt.toDate();
  const trialDaysRemaining = Math.max(
    0,
    Math.ceil((trialEnd.getTime() - now.getTime()) / msPerDay),
  );

  if (trialEnd.getTime() > now.getTime()) {
    return {
      status: "trial",
      hasAccess: true,
      daysRemaining: trialDaysRemaining,
      label: `${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} left in trial`,
      endsAt: trialEnd,
    };
  }

  return {
    status: "expired",
    hasAccess: false,
    daysRemaining: 0,
    label: "Trial ended",
    endsAt: trialEnd,
  };
}

export function userHasAccess(user: User): boolean {
  return getSubscriptionInfo(user).hasAccess;
}
