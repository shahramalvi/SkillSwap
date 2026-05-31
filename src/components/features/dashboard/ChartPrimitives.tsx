import { useId, useMemo, useState } from "react";
import type { FlowPoint } from "../../../lib/dashboardAnalytics";

interface SparklineProps {
  data: number[];
  stroke: string;
  fill: string;
  className?: string;
}

export function Sparkline({ data, stroke, fill, className }: SparklineProps) {
  const gradId = useId();
  const safeData = data.length > 0 ? data : [0, 0, 0, 0, 0];
  const path = useMemo(() => buildAreaPath(safeData), [safeData]);

  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className={className ?? "block h-12 w-full min-h-[48px]"}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={0.5} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <path d={`${path} L 100,40 L 0,40 Z`} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

interface BarChartProps {
  data: FlowPoint[];
  maxValue?: number;
}

export function ActivityBarChart({ data, maxValue }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(maxValue ?? 0, ...data.map((d) => d.total), 1);

  return (
    <div className="relative w-full min-h-[240px]">
      <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-[240px] px-1 pt-8">
        {data.map((point, i) => {
          const totalPct = (point.total / max) * 100;
          const isHovered = hovered === i;

          return (
            <div
              key={`${point.label}-${i}`}
              className="flex-1 flex flex-col items-center gap-2 min-w-0 h-full"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="relative flex-1 w-full flex items-end justify-center min-h-[180px]">
                {isHovered && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 bg-white rounded-xl shadow-soft border border-border px-2.5 py-1.5 text-[10px] whitespace-nowrap pointer-events-none">
                    <p className="font-semibold text-navy">{point.label}</p>
                    <p className="text-muted">Total: {point.total}</p>
                    <p className="text-muted">Done: {point.completed}</p>
                  </div>
                )}
                <div
                  className="relative w-full max-w-[32px] rounded-xl bg-[#eef1f8] border border-[#e2e8f4]"
                  style={{ height: `${Math.max(totalPct, point.total > 0 ? 8 : 4)}%` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-xl bg-[#A8D5BA]"
                    style={{
                      height: `${point.total > 0 ? Math.max((point.completed / point.total) * 100, point.completed > 0 ? 12 : 0) : 0}%`,
                      minHeight: point.completed > 0 ? 6 : 0,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-muted font-medium truncate w-full text-center shrink-0">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
}

export function DonutChart({ slices }: DonutChartProps) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  let cursor = 0;
  const gradientStops = slices
    .map((slice) => {
      const pct = (slice.value / total) * 100;
      const start = cursor;
      cursor += pct;
      return `${slice.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <div className="relative w-[180px] h-[180px] shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(${gradientStops})` }}
      />
      <div className="absolute inset-[28%] rounded-full bg-white shadow-inner" />
    </div>
  );
}

export function GaugeRing({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const arcPortion = 0.72;
  const visibleLength = circumference * arcPortion;
  const filledLength = visibleLength * (clamped / 100);

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full block">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#eef1f8"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${visibleLength} ${circumference}`}
          transform="rotate(130 32 32)"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#A8D5BA"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filledLength} ${circumference}`}
          transform="rotate(130 32 32)"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy">
        {clamped}%
      </span>
    </div>
  );
}

function buildAreaPath(data: number[]): string {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100;
    const y = 36 - (v / max) * 30;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}`;
}
