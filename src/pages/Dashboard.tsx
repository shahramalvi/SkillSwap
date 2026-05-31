import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Inbox,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardCharts, GaugeRing } from "../components/features/dashboard/DashboardCharts";
import { MetricCard } from "../components/features/dashboard/MetricCard";
import { UpcomingRequestsRow } from "../components/features/dashboard/UpcomingRequestsRow";
import { ExchangeRequestCard } from "../components/features/ExchangeRequestCard";
import { AppPage } from "../components/layout/AppPage";
import { Skeleton } from "../components/ui/Skeleton";
import { useExchangeRequests } from "../hooks/useExchangeRequests";
import { useSkills } from "../hooks/useSkills";
import { useSubscription } from "../hooks/useSubscription";
import {
  buildSparkline,
  computeTrend,
  countInRange,
  successRate,
} from "../lib/dashboardAnalytics";
import { withDashboardDemoData } from "../lib/dashboardDemoData";
import { DEMO_SPARKLINE } from "../lib/dashboardChartDefaults";
import { useAuthStore } from "../store/authStore";
import type { ExchangeRequest, Skill } from "../types";

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { info } = useSubscription();
  const { subscribeMyExchangeRequests } = useExchangeRequests();
  const { subscribeUserSkills } = useSkills();
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
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

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserSkills(user.uid, setSkills);
    return unsub;
  }, [subscribeUserSkills, user]);

  const { requests: displayRequests, skills: displaySkills, isDemo } = useMemo(
    () => (user ? withDashboardDemoData(user, requests, skills) : { requests: [], skills: [], isDemo: false }),
    [user, requests, skills],
  );

  const metrics = useMemo(() => {
    if (!user) {
      return {
        active: 0,
        newProposals: 0,
        completed: 0,
        rate: 0,
        activeTrend: { pct: 0, up: true },
        newTrend: { pct: 0, up: true },
        completedTrend: { pct: 0, up: true },
        rateTrend: { pct: 0, up: true },
        activeSpark: [] as number[],
        newSpark: [] as number[],
        completedSpark: [] as number[],
        insight: "",
      };
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const active = displayRequests.filter((r) => r.status === "accepted").length;
    const newProposals = displayRequests.filter((r) =>
      ["pending", "negotiating"].includes(r.status),
    ).length;
    const completed = displayRequests.filter((r) => r.status === "completed").length;
    const rate = successRate(displayRequests);

    const activeThisMonth = countInRange(
      displayRequests,
      monthStart,
      now,
      (r) => r.status === "accepted",
    );
    const activeLastMonth = countInRange(
      displayRequests,
      prevMonthStart,
      prevMonthEnd,
      (r) => r.status === "accepted",
    );

    const newThisMonth = countInRange(displayRequests, monthStart, now, (r) =>
      ["pending", "negotiating"].includes(r.status),
    );
    const newLastMonth = countInRange(displayRequests, prevMonthStart, prevMonthEnd, (r) =>
      ["pending", "negotiating"].includes(r.status),
    );

    const doneThisMonth = countInRange(
      displayRequests,
      monthStart,
      now,
      (r) => r.status === "completed",
    );
    const doneLastMonth = countInRange(
      displayRequests,
      prevMonthStart,
      prevMonthEnd,
      (r) => r.status === "completed",
    );

    const completedRequests = displayRequests.filter((r) => r.status === "completed");
    const completedThisMonth = completedRequests.filter(
      (r) => r.updatedAt.toDate() >= monthStart,
    ).length;
    const completedLastMonth = completedRequests.filter((r) => {
      const d = r.updatedAt.toDate();
      return d >= prevMonthStart && d <= prevMonthEnd;
    }).length;

    const rejectedThisMonth = countInRange(
      displayRequests,
      monthStart,
      now,
      (r) => r.status === "rejected",
    );
    const rateThisMonth =
      completedThisMonth + rejectedThisMonth > 0
        ? Math.round((completedThisMonth / (completedThisMonth + rejectedThisMonth)) * 100)
        : rate;
    const rateLastMonth =
      completedLastMonth > 0
        ? Math.round(
            (completedLastMonth /
              (completedLastMonth +
                countInRange(displayRequests, prevMonthStart, prevMonthEnd, (r) => r.status === "rejected"))) *
              100,
          )
        : rate;

    const completedTrend = computeTrend(doneThisMonth, doneLastMonth);
    let insight = "Start browsing jobs to send your first skill exchange proposal.";
    if (doneThisMonth > doneLastMonth && doneLastMonth > 0) {
      insight = `Your completed barters are climbing — up ${completedTrend.pct}% vs last month!`;
    } else if (newProposals > 0) {
      insight = `You have ${newProposals} open proposal${newProposals === 1 ? "" : "s"} waiting for action.`;
    } else if (active > 0) {
      insight = `${active} active barter${active === 1 ? "" : "s"} in progress — keep the momentum going!`;
    }

    return {
      active,
      newProposals,
      completed,
      rate,
      activeTrend: computeTrend(activeThisMonth, activeLastMonth),
      newTrend: computeTrend(newThisMonth, newLastMonth),
      completedTrend,
      rateTrend: computeTrend(rateThisMonth, rateLastMonth),
      activeSpark: (() => {
        const s = buildSparkline(
          displayRequests.filter((r) => r.status === "accepted"),
          14,
        );
        return s.some((v) => v > 0) ? s : DEMO_SPARKLINE;
      })(),
      newSpark: (() => {
        const s = buildSparkline(
          displayRequests.filter((r) => ["pending", "negotiating"].includes(r.status)),
          14,
        );
        return s.some((v) => v > 0) ? s : DEMO_SPARKLINE;
      })(),
      completedSpark: (() => {
        const s = buildSparkline(
          displayRequests.filter((r) => r.status === "completed"),
          14,
        );
        return s.some((v) => v > 0) ? s : DEMO_SPARKLINE;
      })(),
      insight,
    };
  }, [displayRequests, user]);

  const recentRequests = displayRequests.slice(0, 4);

  if (!user) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppPage className="min-w-0 overflow-x-clip">
      <div className="space-y-6 min-w-0">
        {info?.status === "trial" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-teal/15 to-teal-light rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-teal/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-teal" />
              </div>
              <div>
                <p className="font-bold text-navy">Free trial active</p>
                <p className="text-sm text-muted mt-0.5">
                  {info.daysRemaining} days left — subscribe to keep bartering after trial ends.
                </p>
              </div>
            </div>
            <Link
              to="/plan"
              className="shrink-0 inline-flex items-center gap-2 bg-navy text-on-hero text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-navy-light transition-colors"
            >
              View plans <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted font-medium">{greeting}</p>
            <h2 className="text-xl font-bold text-navy mt-0.5">
              Here&apos;s your exchange overview
            </h2>
            {isDemo && (
              <p className="text-xs text-teal-dark mt-1.5 font-medium">
                Showing sample data — your real stats appear once you start exchanging
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/post-skill"
              className="inline-flex items-center gap-2 bg-navy text-on-hero text-sm font-semibold px-4 py-2.5 rounded-2xl hover:bg-navy-light transition-colors"
            >
              <Plus size={16} /> Post skill
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-white text-navy text-sm font-semibold px-4 py-2.5 rounded-2xl border border-border hover:bg-surface2 transition-colors"
            >
              <Briefcase size={16} /> Browse jobs
            </Link>
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 bg-white text-navy text-sm font-semibold px-4 py-2.5 rounded-2xl border border-border hover:bg-surface2 transition-colors"
            >
              <Inbox size={16} /> Requests
            </Link>
          </div>
        </div>

        {loading && !isDemo ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[140px] rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              label="Active barters"
              value={metrics.active}
              trend={metrics.activeTrend}
              sparkline={metrics.activeSpark}
              accent="green"
              delay={0}
            />
            <MetricCard
              label="Open proposals"
              value={metrics.newProposals}
              trend={metrics.newTrend}
              sparkline={metrics.newSpark}
              accent="blue"
              delay={0.05}
            />
            <MetricCard
              label="Completed"
              value={metrics.completed}
              trend={metrics.completedTrend}
              sparkline={metrics.completedSpark}
              accent="orange"
              delay={0.1}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl border border-white shadow-card p-5 flex items-center justify-between min-h-[140px]"
            >
              <div>
                <p className="text-xs font-medium text-muted">Success rate</p>
                <p className="text-3xl font-bold text-navy tabular-nums mt-1">
                  {metrics.rate}
                  <span className="text-lg font-semibold text-muted">%</span>
                </p>
                <p
                  className={`text-xs font-semibold mt-2 inline-flex items-center gap-1 ${
                    metrics.rateTrend.up ? "text-emerald-600" : "text-rose"
                  }`}
                >
                  <TrendingUp size={12} />
                  {metrics.rateTrend.pct}% vs last month
                </p>
              </div>
              <GaugeRing value={metrics.rate || (isDemo ? 78 : 0)} />
            </motion.div>
          </div>
        )}

        <DashboardCharts
          requests={displayRequests}
          skills={displaySkills}
          useDemoCharts={isDemo}
        />

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 min-w-0">
          <div className="lg:col-span-2">
            <UpcomingRequestsRow requests={displayRequests} userId={user.uid} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-teal/20 to-teal-light rounded-3xl p-6 flex flex-col justify-center border border-teal/15"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center mb-4">
              <TrendingUp size={20} className="text-teal-dark" />
            </div>
            <p className="text-sm font-semibold text-navy leading-relaxed">{metrics.insight}</p>
            <Link
              to="/jobs"
              className="mt-4 text-xs font-bold text-teal-dark hover:underline inline-flex items-center gap-1"
            >
              Explore opportunities <ArrowRight size={12} />
            </Link>
          </motion.div>
        </div>

        <div className="bg-white rounded-3xl border border-white shadow-card p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5 min-w-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-navy">Recent activity</h2>
              <p className="text-xs text-muted mt-0.5">Latest exchange requests</p>
            </div>
            <Link to="/requests" className="inline-flex items-center gap-0.5 text-xs font-semibold text-teal hover:underline shrink-0 whitespace-nowrap">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="text-center py-12">
              <Inbox size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted">No activity yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Browse jobs and send your first proposal
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 bg-navy text-on-hero text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-navy-light transition-colors"
              >
                <Briefcase size={16} /> Browse jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3 min-w-0">
              {recentRequests.map((r) => (
                <div key={r.id} className="min-w-0">
                  <ExchangeRequestCard request={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppPage>
  );
}
