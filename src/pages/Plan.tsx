import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Star, Zap, ChevronRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { AppAsidePanel, AppPage, AppPageSplit } from "../components/layout/AppPage";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import { PAYMENT_PLANS, type PlanId } from "../lib/plans";
import { TRIAL_DAYS } from "../types";
import { cn } from "../lib/utils";

const PLAN_ICONS: Record<PlanId, typeof Zap> = {
  starter: Sparkles,
  pro: Zap,
  premium: Crown,
};

export function Plan() {
  const { user } = useAuth();
  const { info, activatePlan } = useSubscription();
  const navigate = useNavigate();
  const [subscribingPlan, setSubscribingPlan] = useState<PlanId | null>(null);

  const handleSubscribe = async (planId: PlanId) => {
    setSubscribingPlan(planId);
    try {
      const plan = PAYMENT_PLANS.find((p) => p.id === planId)!;
      await activatePlan(planId);
      toast.success(`${plan.name} plan activated!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error((err as Error).message || "Failed to activate plan");
    } finally {
      setSubscribingPlan(null);
    }
  };

  if (!user || !info) return null;

  const isActive = info.status === "active";
  const isExpired = info.status === "expired";
  const currentPlanId = info.planId;

  return (
    <AppPage>
      <AppPageSplit
        aside={
          <>
            <AppAsidePanel title="Free trial">
              <p className="text-sm text-muted leading-relaxed">
                Every new member gets {TRIAL_DAYS} days free to explore barter proposals, post
                skills, and connect with the Karachi community — no card required.
              </p>
            </AppAsidePanel>
            <AppAsidePanel title="How billing works">
              <ul className="space-y-2 text-sm text-muted leading-relaxed">
                <li>All plans bill monthly in PKR.</li>
                <li>Upgrade or switch plans anytime.</li>
                <li>Payment is simulated for this demo.</li>
              </ul>
            </AppAsidePanel>
            {!isExpired && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-0.5 text-sm font-semibold text-teal hover:underline px-1"
              >
                Continue to dashboard <ChevronRight size={14} />
              </Link>
            )}
          </>
        }
        main={
          <>
            <div>
              <div className="inline-flex items-center gap-2 bg-teal/10 text-teal-dark text-xs font-semibold px-4 py-2 rounded-full mb-3">
                <Sparkles size={14} />
                {TRIAL_DAYS}-day free trial on signup
              </div>
              <p className="text-sm text-muted max-w-3xl">
                {isExpired
                  ? "Your trial has ended. Pick a plan to keep bartering with the Karachi community."
                  : isActive
                    ? `You're on the ${info.planName} plan. Switch plans below or manage your subscription.`
                    : `You're on a free trial with ${info.daysRemaining} days remaining. Subscribe early to lock in your plan.`}
              </p>
            </div>

            {info.hasAccess && !isActive && (
              <div className="rounded-3xl border border-teal/20 shadow-card p-5 bg-teal/5">
                <p className="font-bold text-navy">Trial in progress</p>
                <p className="text-sm text-muted mt-1">{info.label}</p>
              </div>
            )}

            {isActive && (
              <div className="bg-white rounded-3xl border border-teal/30 shadow-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-navy flex items-center justify-center shrink-0">
                  <Crown size={22} className="text-gold" />
                </div>
                <div>
                  <p className="font-bold text-navy">{info.planName} — Active</p>
                  <p className="text-sm text-muted">{info.label}</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {PAYMENT_PLANS.map((plan, index) => {
                const Icon = PLAN_ICONS[plan.id];
                const isCurrentPlan = isActive && currentPlanId === plan.id;
                const isLoading = subscribingPlan === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={cn(
                      "bg-white rounded-3xl border-2 shadow-card overflow-hidden flex flex-col",
                      plan.highlighted ? "border-teal ring-2 ring-teal/10" : "border-white",
                      isCurrentPlan && "border-teal",
                    )}
                  >
                    <div
                      className={cn(
                        "p-6",
                        plan.highlighted ? "bg-navy" : "bg-surface2 border-b border-border/50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {plan.highlighted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gold mb-2">
                              <Star size={10} fill="currentColor" /> Most popular
                            </span>
                          )}
                          {isCurrentPlan && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-teal mb-2 ml-0">
                              Current plan
                            </span>
                          )}
                          <p
                            className={cn(
                              "text-xs font-bold uppercase tracking-widest mb-1",
                              plan.highlighted ? "text-on-hero-muted" : "text-muted",
                            )}
                          >
                            {plan.name}
                          </p>
                          <h2
                            className={cn(
                              "text-xl font-bold",
                              plan.highlighted ? "text-on-hero" : "text-navy",
                            )}
                          >
                            {plan.tagline}
                          </h2>
                        </div>
                        <Icon
                          size={24}
                          className={plan.highlighted ? "text-gold shrink-0" : "text-navy shrink-0"}
                        />
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-baseline gap-1 mb-5">
                        <span className="text-3xl font-extrabold text-navy">
                          Rs. {plan.pricePKR.toLocaleString()}
                        </span>
                        <span className="text-muted text-sm">/ month</span>
                      </div>

                      <ul className="space-y-2.5 mb-6 flex-1">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-sm text-navy">
                            <span className="w-5 h-5 rounded-full bg-teal/15 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={12} className="text-teal-dark" />
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {isCurrentPlan ? (
                        <Link to="/dashboard">
                          <Button variant="secondary" fullWidth size="lg">
                            Back to dashboard
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant={plan.highlighted ? "primary" : "secondary"}
                          fullWidth
                          size="lg"
                          disabled={isLoading || subscribingPlan !== null}
                          onClick={() => handleSubscribe(plan.id)}
                        >
                          {isLoading
                            ? "Activating..."
                            : isActive
                              ? `Switch to ${plan.name}`
                              : isExpired
                                ? `Subscribe — ${plan.name}`
                                : `Get ${plan.name}`}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-xs text-muted">
              Payment simulation for demo — no card required. All prices in PKR, billed monthly.
            </p>
          </>
        }
      />
    </AppPage>
  );
}
