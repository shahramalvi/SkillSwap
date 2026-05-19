import { motion } from "framer-motion";
import { useMemo } from "react";
import type { ActivitySlot, StatusSlice, WeeklyFlowPoint } from "../../lib/dashboardAnalytics";

const CHART_HEIGHT = 140;
const MIN_BAR_PX = 4;

function formatAxis(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

/* ── Y-axis grid + labels ── */
function ChartGrid({
  maxValue,
  minValue = 0,
  lines = 4,
}: {
  maxValue: number;
  minValue?: number;
  lines?: number;
}) {
  const range = Math.max(maxValue - minValue, 1);
  const ticks = Array.from({ length: lines + 1 }, (_, i) =>
    Math.round(maxValue - (range * i) / lines),
  );

  return (
    <>
      {ticks.map((tick, i) => (
        <motion.div
          key={tick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="absolute left-0 right-0 border-t border-slate-100"
          style={{ bottom: `${(i / lines) * 100}%` }}
        >
          <span className="absolute -left-1 -top-2.5 -translate-x-full text-[10px] text-muted tabular-nums pr-1">
            {formatAxis(tick)}
          </span>
        </motion.div>
      ))}
    </>
  );
}

/** Grouped bar chart — last 7 days, always shows all days at zero when empty. */
export function WeeklyFlowChart({ data }: { data: WeeklyFlowPoint[] }) {
  const maxVal = useMemo(
    () => Math.max(1, ...data.flatMap((d) => [d.earned, d.spent])),
    [data],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative pl-8"
      style={{ height: CHART_HEIGHT }}
    >
      <ChartGrid maxValue={maxVal} lines={4} />
      <motion.div
        className="absolute inset-0 flex items-end gap-1 sm:gap-2 pl-0"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {data.map((day) => {
          const earnedH = Math.max((day.earned / maxVal) * 100, day.earned > 0 ? 8 : 0);
          const spentH = Math.max((day.spent / maxVal) * 100, day.spent > 0 ? 8 : 0);
          const earnedPx = day.earned === 0 ? MIN_BAR_PX : undefined;
          const spentPx = day.spent === 0 ? MIN_BAR_PX : undefined;

          return (
            <motion.div
              key={day.key}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              className="flex-1 flex flex-col items-center gap-1 min-w-0"
            >
              <motion.div
                className="w-full flex items-end justify-center gap-0.5 sm:gap-1"
                style={{ height: CHART_HEIGHT - 24 }}
                title={`${day.label}: +${day.earned} / -${day.spent}`}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: earnedPx ?? `${earnedH}%` }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="w-[42%] max-w-5 rounded-t-md bg-teal opacity-90"
                  style={earnedPx ? { height: earnedPx } : undefined}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: spentPx ?? `${spentH}%` }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                  className="w-[42%] max-w-5 rounded-t-md bg-rose opacity-90"
                  style={spentPx ? { height: spentPx } : undefined}
                />
              </motion.div>
              <span className="text-[10px] text-muted truncate w-full text-center">{day.shortLabel}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

/** Net token trend — SVG line over 7 days; flat at zero when no data. */
export function NetTrendChart({ data }: { data: WeeklyFlowPoint[] }) {
  const width = 100;
  const height = 56;
  const padding = { top: 8, right: 4, bottom: 8, left: 4 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const { path, areaPath, points } = useMemo(() => {
    const nets = data.map((d) => d.net);
    const maxAbs = Math.max(1, ...nets.map(Math.abs));
    const minY = -maxAbs;
    const maxY = maxAbs;
    const range = maxY - minY;

    const coords = nets.map((net, i) => {
      const x = padding.left + (i / Math.max(data.length - 1, 1)) * innerW;
      const y = padding.top + innerH - ((net - minY) / range) * innerH;
      return { x, y, net };
    });

    const line = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
    const zeroY = padding.top + innerH - ((0 - minY) / range) * innerH;
    const area = `${line} L ${coords[coords.length - 1]?.x ?? padding.left} ${zeroY} L ${coords[0]?.x ?? padding.left} ${zeroY} Z`;

    return { path: line, areaPath: area, points: coords, zeroY };
  }, [data, innerH, innerW]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-14"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1={padding.left}
        y1={points.length ? padding.top + innerH / 2 : height / 2}
        x2={width - padding.right}
        y2={points.length ? padding.top + innerH / 2 : height / 2}
        stroke="#e2e8f0"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <path d={areaPath} fill="url(#netGradient)" opacity={0.35} />
      <path d={path} fill="none" stroke="#0D1B3E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D1B3E" />
          <stop offset="100%" stopColor="#0D1B3E" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Fixed 8-slot earned vs spent bars — zero-height slots still visible. */
export function ActivityBarChart({ slots }: { slots: ActivitySlot[] }) {
  const maxVal = useMemo(
    () => Math.max(1, ...slots.flatMap((s) => [s.earned, s.spent])),
    [slots],
  );

  return (
    <div className="relative pl-8" style={{ height: CHART_HEIGHT }}>
      <ChartGrid maxValue={maxVal} lines={3} />
      <div className="absolute inset-0 flex items-end gap-1.5">
        {slots.map((slot, i) => {
          const earnedH = Math.max((slot.earned / maxVal) * 100, slot.earned > 0 ? 10 : 0);
          const spentH = Math.max((slot.spent / maxVal) * 100, slot.spent > 0 ? 10 : 0);

          return (
            <motion.div
              key={`${slot.label}-${i}`}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="flex-1 flex flex-col items-center gap-1 origin-bottom min-w-0"
              style={{ height: CHART_HEIGHT - 20 }}
            >
              <motion.div
                className="w-full flex items-end justify-center gap-px flex-1"
                title={slot.net !== 0 ? `${slot.net > 0 ? "+" : ""}${slot.net} tokens` : "No activity"}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: slot.earned === 0 ? MIN_BAR_PX : `${earnedH}%` }}
                  className="w-1/2 rounded-t-sm bg-teal/80"
                  style={slot.earned === 0 ? { height: MIN_BAR_PX } : undefined}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: slot.spent === 0 ? MIN_BAR_PX : `${spentH}%` }}
                  className="w-1/2 rounded-t-sm bg-rose/80"
                  style={slot.spent === 0 ? { height: MIN_BAR_PX } : undefined}
                />
              </motion.div>
              <span className="text-[9px] text-muted truncate w-full text-center">{slot.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/** Donut — always renders full ring; empty data = neutral ring with zero counts. */
export function TransactionStatusDonut({ slices }: { slices: StatusSlice[] }) {
  const total = slices.reduce((s, x) => s + x.count, 0);
  const size = 120;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments =
    total === 0
      ? [{ color: "#e2e8f0", length: circumference, offset: 0 }]
      : slices
          .filter((s) => s.count > 0)
          .map((slice) => {
            const length = (slice.count / total) * circumference;
            const seg = { ...slice, length, offset };
            offset += length;
            return seg;
          });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-5"
    >
      <motion.div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        animate={{ rotate: total === 0 ? 0 : 360 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((seg, i) => (
            <circle
              key={"status" in seg ? seg.status : i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={"color" in seg ? seg.color : "#e2e8f0"}
              strokeWidth={stroke}
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={-("offset" in seg ? seg.offset : 0)}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-navy tabular-nums">{total}</span>
          <span className="text-[10px] text-muted uppercase tracking-wide">Total</span>
        </div>
      </motion.div>
      <ul className="flex-1 space-y-2 min-w-0">
        {slices.map((slice) => (
          <li key={slice.status} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-muted truncate">{slice.label}</span>
            </span>
            <span className="font-bold text-navy tabular-nums shrink-0">{slice.count}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
