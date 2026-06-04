import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";
import { Sparkline } from "./ChartPrimitives";

interface MetricCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  trend?: { pct: number; up: boolean };
  sparkline?: number[];
  accent?: "blue" | "green" | "orange" | "navy";
  delay?: number;
}

const ACCENT = {
  blue: { stroke: "#5b8def", fill: "#5b8def", bg: "bg-teal/10" },
  green: { stroke: "#7bc99a", fill: "#A8D5BA", bg: "bg-emerald-50" },
  orange: { stroke: "#e8a855", fill: "#F5C896", bg: "bg-amber-50" },
  navy: { stroke: "#0D1B3E", fill: "#4a6fa5", bg: "bg-navy/5" },
};

export function MetricCard({
  label,
  value,
  suffix = "",
  trend,
  sparkline = [],
  accent = "blue",
  delay = 0,
}: MetricCardProps) {
  const [display, setDisplay] = useState(0);
  const numeric = typeof value === "number";
  const colors = ACCENT[accent];

  useEffect(() => {
    if (!numeric) return;
    const steps = 30;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplay(Math.round(((value as number) * step) / steps));
      if (step >= steps) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [value, numeric]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-white rounded-3xl border border-white shadow-card p-5 flex flex-col gap-3 min-h-[140px] min-w-0 max-w-full overflow-hidden"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="text-3xl font-bold text-navy tabular-nums mt-1">
            {numeric ? display : value}
            {suffix && <span className="text-lg font-semibold text-muted ml-0.5">{suffix}</span>}
          </p>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full shrink-0",
              trend.up ? "text-emerald-600 bg-emerald-50" : "text-rose bg-rose-light",
            )}
          >
            {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.pct}%
          </div>
        )}
      </div>

      {sparkline.length > 0 && (
        <div className={cn("h-12 -mx-1 rounded-xl overflow-hidden px-1", colors.bg)}>
          <Sparkline data={sparkline} stroke={colors.stroke} fill={colors.fill} />
        </div>
      )}
    </motion.div>
  );
}
