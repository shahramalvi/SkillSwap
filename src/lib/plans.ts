export type PlanId = "starter" | "pro" | "premium";

export interface PaymentPlan {
  id: PlanId;
  name: string;
  tagline: string;
  pricePKR: number;
  billingMonths: number;
  features: string[];
  highlighted?: boolean;
}

export const DEFAULT_PLAN_ID: PlanId = "pro";

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Get started with barter basics",
    pricePKR: 499,
    billingMonths: 1,
    features: [
      "Up to 3 skill listings",
      "Send & receive proposals",
      "Basic profile & resume",
      "Karachi community access",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Full access for active swappers",
    pricePKR: 999,
    billingMonths: 1,
    highlighted: true,
    features: [
      "Unlimited skill listings",
      "Priority proposal visibility",
      "Portfolio project links",
      "Negotiate & complete exchanges",
      "Full Karachi community",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Stand out and grow faster",
    pricePKR: 1999,
    billingMonths: 1,
    features: [
      "Everything in Pro",
      "Featured profile badge",
      "Dashboard analytics & insights",
      "Early access to new features",
      "Priority support",
    ],
  },
];

export function getPlan(planId: PlanId): PaymentPlan {
  const plan = PAYMENT_PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  return plan;
}

export function getPlanName(planId: PlanId | undefined): string {
  if (!planId) return getPlan(DEFAULT_PLAN_ID).name;
  try {
    return getPlan(planId).name;
  } catch {
    return getPlan(DEFAULT_PLAN_ID).name;
  }
}
