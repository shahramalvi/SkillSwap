import { motion } from "framer-motion";
import {
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Plus,
  Search,
  TrendingUp,
  BarChart3,
  Clock,
  Inbox,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ActivityBarChart,
  NetTrendChart,
  TransactionStatusDonut,
  WeeklyFlowChart,
} from "../components/features/DashboardCharts";
import { StatCard } from "../components/features/StatCard";
import { TxFeedItem } from "../components/features/TxFeedItem";
import { Container } from "../components/layout/Container";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import {
  buildActivitySlots,
  buildStatusSlices,
  buildWeeklyFlow,
  sumWeekly,
} from "../lib/dashboardAnalytics";
import { useTransactions } from "../hooks/useTransactions";
import { useAuthStore } from "../store/authStore";
import type { Transaction } from "../types";
import { groupTransactionsByUser } from "../lib/utils";

function SkillCategoryBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <motion.div className="flex items-center gap-3">
      <span className="text-xs text-muted w-16 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full min-w-0"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-navy w-4 shrink-0 tabular-nums">{count}</span>
    </motion.div>
  );
}

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { subscribeMyTransactions, completeTransaction } = useTransactions();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeMyTransactions((txs) => {
      setTransactions(txs);
      setLoading(false);
    });
    return () => unsub?.();
  }, [subscribeMyTransactions]);

  const stats = useMemo(() => {
    const pending = transactions.filter((t) => t.status === "pending");
    const completed = transactions.filter((t) => t.status === "completed");
    const owedToYou = pending
      .filter((t) => t.receiverId === user?.uid)
      .reduce((sum, t) => sum + t.tokens, 0);
    const youOwe = pending
      .filter((t) => t.senderId === user?.uid)
      .reduce((sum, t) => sum + t.tokens, 0);
    const totalEarned = completed
      .filter((t) => t.receiverId === user?.uid)
      .reduce((sum, t) => sum + t.tokens, 0);
    return { owedToYou, youOwe, totalEarned, totalTx: transactions.length };
  }, [transactions, user?.uid]);

  const debtLedger = useMemo(
    () => (user ? groupTransactionsByUser(transactions, user.uid) : []),
    [transactions, user],
  );

  const recentTx = transactions.slice(0, 8);

  const weeklyFlow = useMemo(
    () => (user ? buildWeeklyFlow(transactions, user.uid, 7) : []),
    [transactions, user],
  );

  const activitySlots = useMemo(
    () => (user ? buildActivitySlots(transactions, user.uid, 8) : []),
    [transactions, user],
  );

  const statusSlices = useMemo(() => buildStatusSlices(transactions), [transactions]);

  const weekTotals = useMemo(() => sumWeekly(weeklyFlow), [weeklyFlow]);

  const handleComplete = async (txId: string) => {
    try {
      await completeTransaction(txId);
    } catch {
      /* handled in hook */
    }
  };

  if (!user) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageWrapper className="min-h-screen bg-canvas pb-20">
      <div className="bg-hero-gradient pt-24 pb-12 dot-pattern">
        <Container className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <motion.div className="flex items-center gap-4">
              <Avatar initials={user.avatar} size="lg" ring />
              <motion.div>
                <p className="text-on-hero-muted text-sm font-medium">{greeting},</p>
                <h1 className="text-3xl font-extrabold text-on-hero">{user.name}</h1>
                <p className="text-teal/70 text-xs mt-0.5">{user.email}</p>
              </motion.div>
            </motion.div>

            <motion.div className="flex flex-wrap gap-3">
              <div
                className="flex items-center gap-2 glass text-on-hero font-semibold px-5 py-3 rounded-2xl"
                aria-label={`Token balance: ${user.tokenBalance}`}
              >
                <Coins size={18} className="text-gold shrink-0" />
                <span>{user.tokenBalance} balance</span>
              </div>
              <Link to="/post-skill">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className="flex items-center gap-2 bg-teal text-navy font-semibold px-5 py-3 rounded-2xl hover:bg-teal-dark transition-colors"
                >
                  <Plus size={18} /> Post skill
                </motion.button>
              </Link>
              <Link to="/requests">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className="flex items-center gap-2 glass text-on-hero font-semibold px-5 py-3 rounded-2xl hover:bg-teal/20 transition-colors"
                >
                  <Inbox size={18} /> Requests
                </motion.button>
              </Link>
              <Link to="/search">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className="flex items-center gap-2 glass text-on-hero font-semibold px-5 py-3 rounded-2xl hover:bg-teal/20 transition-colors"
                >
                  <Search size={18} /> Find skills
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </div>

      <Container className="mt-8">
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Your balance" value={user.tokenBalance} icon={Coins} gradient="bg-teal-gradient" delay={0} />
          <StatCard label="Owed to you" value={stats.owedToYou} icon={ArrowDownLeft} gradient="bg-purple-gradient" delay={0.07} />
          <StatCard label="You owe" value={stats.youOwe} icon={ArrowUpRight} gradient="bg-rose-gradient" delay={0.14} />
          <StatCard label="Total earned" value={stats.totalEarned} icon={TrendingUp} gradient="bg-gold-gradient" delay={0.21} />
        </motion.div>

        <motion.div className="grid lg:grid-cols-3 gap-6 items-start">
          <motion.div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ boxShadow: "0 0 0 1.5px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)" }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-6"
            >
              <motion.div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <motion.div>
                  <h2 className="text-base font-bold text-navy flex items-center gap-2">
                    <BarChart3 size={18} className="text-teal" />
                    Weekly token flow
                  </h2>
                  <p className="text-xs text-muted mt-0.5">Earned vs spent — last 7 days</p>
                </motion.div>
                <motion.div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal inline-block" />
                    Earned
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose inline-block" />
                    Spent
                  </span>
                </motion.div>
              </motion.div>

              {loading ? (
                <Skeleton className="h-[140px]" />
              ) : (
                <>
                  <WeeklyFlowChart data={weeklyFlow} />
                  <motion.div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Net trend</p>
                    <NetTrendChart data={weeklyFlow} />
                  </motion.div>
                  <motion.div className="mt-4 grid grid-cols-3 gap-3">
                    <motion.div className="rounded-xl bg-teal/5 border border-teal/15 px-3 py-2 text-center">
                      <p className="text-lg font-extrabold text-teal tabular-nums">+{weekTotals.earned}</p>
                      <p className="text-[10px] text-muted uppercase tracking-wide">Earned</p>
                    </motion.div>
                    <motion.div className="rounded-xl bg-rose-light border border-rose/15 px-3 py-2 text-center">
                      <p className="text-lg font-extrabold text-rose tabular-nums">-{weekTotals.spent}</p>
                      <p className="text-[10px] text-muted uppercase tracking-wide">Spent</p>
                    </motion.div>
                    <motion.div className="rounded-xl bg-slate-50 border border-border px-3 py-2 text-center">
                      <p className={`text-lg font-extrabold tabular-nums ${weekTotals.net >= 0 ? "text-teal" : "text-rose"}`}>
                        {weekTotals.net >= 0 ? "+" : ""}
                        {weekTotals.net}
                      </p>
                      <p className="text-[10px] text-muted uppercase tracking-wide">Net</p>
                    </motion.div>
                  </motion.div>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ boxShadow: "0 0 0 1.5px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)" }}
              transition={{ delay: 0.28 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-6"
            >
              <motion.div className="flex items-center justify-between mb-4">
                <motion.div>
                  <h2 className="text-base font-bold text-navy">Recent activity</h2>
                  <p className="text-xs text-muted mt-0.5">8 slots — shows zero when empty</p>
                </motion.div>
                <motion.div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal inline-block" />
                    In
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose inline-block" />
                    Out
                  </span>
                </motion.div>
              </motion.div>
              {loading ? <Skeleton className="h-[140px]" /> : <ActivityBarChart slots={activitySlots} />}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ boxShadow: "0 0 0 1.5px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)" }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-6"
            >
              <motion.div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-navy">Recent Transactions</h2>
                <Link to="/profile/me" className="text-xs font-semibold text-teal hover:underline">
                  View all →
                </Link>
              </motion.div>

              {loading ? (
                <motion.div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </motion.div>
              ) : recentTx.length === 0 ? (
                <motion.div className="text-center py-10">
                  <Clock size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted">No transactions yet</p>
                  <p className="text-xs text-slate-400 mt-1">Request a skill to get started</p>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                  className="space-y-2"
                >
                  {recentTx.map((tx) => (
                    <TxFeedItem key={tx.id} transaction={tx} onComplete={handleComplete} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <motion.div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ boxShadow: "0 0 0 1.5px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)" }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-6"
            >
              <h2 className="text-base font-bold text-navy mb-4">Pending Balances</h2>
              {loading ? (
                <motion.div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </motion.div>
              ) : debtLedger.length === 0 ? (
                <motion.div className="text-center py-8">
                  <Zap size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-muted">All settled up!</p>
                </motion.div>
              ) : (
                <motion.div className="space-y-3">
                  {debtLedger.map((entry) => (
                    <Link key={entry.userId} to={`/profile/${entry.userId}`}>
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <Avatar initials={entry.userAvatar} size="sm" />
                        <motion.div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-navy truncate">{entry.userName}</p>
                          <p className={`text-xs font-bold ${entry.netTokens > 0 ? "text-teal" : "text-rose"}`}>
                            {entry.netTokens > 0 ? "+" : ""}
                            {entry.netTokens} tokens
                          </p>
                        </motion.div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            entry.netTokens > 0 ? "bg-teal/10 text-teal" : "bg-rose-light text-rose"
                          }`}
                        >
                          {entry.netTokens > 0 ? "owes you" : "you owe"}
                        </span>
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ boxShadow: "0 0 0 1.5px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)" }}
              transition={{ delay: 0.38 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-6"
            >
              <h2 className="text-base font-bold text-navy mb-1">Transaction mix</h2>
              <p className="text-xs text-muted mb-4">By status</p>
              {loading ? <Skeleton className="h-28" /> : <TransactionStatusDonut slices={statusSlices} />}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ boxShadow: "0 0 0 1.5px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)" }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-6"
            >
              <h2 className="text-base font-bold text-navy mb-4">Activity breakdown</h2>
              <motion.div className="space-y-3">
                <SkillCategoryBar label="Completed" count={transactions.filter((t) => t.status === "completed").length} max={Math.max(transactions.length, 1)} color="#0D1B3E" />
                <SkillCategoryBar label="Pending" count={transactions.filter((t) => t.status === "pending").length} max={Math.max(transactions.length, 1)} color="#737373" />
                <SkillCategoryBar label="Received" count={transactions.filter((t) => t.receiverId === user.uid).length} max={Math.max(transactions.length, 1)} color="#525252" />
                <SkillCategoryBar label="Sent" count={transactions.filter((t) => t.senderId === user.uid).length} max={Math.max(transactions.length, 1)} color="#a3a3a3" />
              </motion.div>
              <motion.div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3">
                <motion.div className="text-center">
                  <p className="text-2xl font-extrabold text-navy">{stats.totalTx}</p>
                  <p className="text-xs text-muted mt-0.5">Total trades</p>
                </motion.div>
                <motion.div className="text-center">
                  <p className="text-2xl font-extrabold text-teal">{stats.totalEarned}</p>
                  <p className="text-xs text-muted mt-0.5">Tokens earned</p>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ boxShadow: "0 0 0 1.5px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.1)" }}
              transition={{ delay: 0.45 }}
              className="bg-navy-gradient rounded-2xl p-5 dot-pattern"
            >
              <motion.div className="relative z-10">
                <p className="text-on-hero-muted text-xs font-semibold uppercase tracking-widest mb-1">Tip</p>
                <p className="text-on-hero font-bold text-sm leading-relaxed">
                  Post your skills to attract requests and earn more tokens!
                </p>
                <Link to="/post-skill">
                  <button
                    type="button"
                    className="mt-4 w-full bg-teal text-navy text-sm font-semibold py-2.5 rounded-xl hover:bg-teal-dark transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Post a skill now
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </PageWrapper>
  );
}
