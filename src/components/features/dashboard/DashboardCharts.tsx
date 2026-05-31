import { PieChart } from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildCategorySlices,
  buildRecentWeeksFlow,
  buildMonthlyFlow,
  buildStatusSlices,
  buildWeeklyFlow,
  sumFlow,
  type FlowPoint,
} from "../../../lib/dashboardAnalytics";
import {
  DEMO_CATEGORY_SLICES,
  demoFlowForRange,
  hasFlowData,
} from "../../../lib/dashboardChartDefaults";
import type { ExchangeRequest, Skill } from "../../../types";
import { cn } from "../../../lib/utils";
import { ActivityBarChart, DonutChart, GaugeRing } from "./ChartPrimitives";

type Range = "week" | "month" | "year";

interface DashboardChartsProps {
  requests: ExchangeRequest[];
  skills: Skill[];
  useDemoCharts?: boolean;
}

export function DashboardCharts({ requests, skills, useDemoCharts = false }: DashboardChartsProps) {
  const [range, setRange] = useState<Range>("month");

  const liveFlow: FlowPoint[] = useMemo(() => {
    if (range === "week") return buildWeeklyFlow(requests);
    if (range === "month") return buildRecentWeeksFlow(requests, 4);
    return buildMonthlyFlow(requests);
  }, [requests, range]);

  const flowData = useMemo(() => {
    if (useDemoCharts || !hasFlowData(liveFlow)) {
      return demoFlowForRange(range);
    }
    return liveFlow;
  }, [liveFlow, range, useDemoCharts]);

  const statusSlices = useMemo(() => buildStatusSlices(requests), [requests]);
  const categorySlices = useMemo(() => buildCategorySlices(skills), [skills]);

  const distribution = useMemo(() => {
    if (useDemoCharts || (categorySlices.length === 0 && statusSlices.length === 0)) {
      return categorySlices.length > 0 ? categorySlices : DEMO_CATEGORY_SLICES;
    }
    return categorySlices.length > 0 ? categorySlices : statusSlices;
  }, [categorySlices, statusSlices, useDemoCharts]);

  const distributionTitle =
    categorySlices.length > 0 || useDemoCharts ? "Skills by category" : "Requests by status";

  const totals = sumFlow(flowData);
  const maxBar = Math.max(...flowData.map((d) => d.total), 1);
  const showingDemo = useDemoCharts || !hasFlowData(liveFlow);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5 min-w-0">
      <div className="md:col-span-3 bg-white rounded-3xl border border-white shadow-card p-4 sm:p-6 min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-base font-bold text-navy">Exchange activity</h2>
            <p className="text-xs text-muted mt-0.5">
              {totals.total} requests · {totals.completed} completed
              {showingDemo && (
                <span className="ml-2 text-teal-dark font-medium">· sample chart</span>
              )}
            </p>
          </div>
          <div className="flex bg-surface2 rounded-2xl p-1 gap-0.5">
            {(["week", "month", "year"] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all",
                  range === r
                    ? "bg-white text-navy shadow-sm"
                    : "text-muted hover:text-navy",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <ActivityBarChart data={flowData} maxValue={maxBar} />

        <div className="flex items-center gap-5 mt-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#eef1f8] border border-border" />
            Total
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#A8D5BA]" />
            Completed
          </span>
        </div>
      </div>

      <div className="md:col-span-2 bg-white rounded-3xl border border-white shadow-card p-4 sm:p-6 flex flex-col min-w-0">
        <h2 className="text-base font-bold text-navy mb-1">{distributionTitle}</h2>
        <p className="text-xs text-muted mb-4">
          Breakdown of your listings & requests
          {showingDemo && (
            <span className="ml-1 text-teal-dark font-medium">· sample</span>
          )}
        </p>

        <div className="relative min-h-[180px] flex items-center justify-center py-2">
          <DonutChart slices={distribution.length > 0 ? distribution : DEMO_CATEGORY_SLICES} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-2xl bg-teal-light flex items-center justify-center text-teal-dark">
              <PieChart size={20} strokeWidth={2} />
            </div>
          </div>
        </div>

        <ul className="space-y-2.5 mt-2">
          {(distribution.length > 0 ? distribution : DEMO_CATEGORY_SLICES).map((slice) => {
            const all = distribution.length > 0 ? distribution : DEMO_CATEGORY_SLICES;
            const total = all.reduce((s, d) => s + d.value, 0);
            const pct = total ? Math.round((slice.value / total) * 100) : 0;
            return (
              <li key={slice.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  {slice.name}
                </span>
                <span className="font-semibold text-navy tabular-nums">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export { GaugeRing };
