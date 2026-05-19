import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  suffix?: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, gradient, suffix = "", delay = 0 }: StatCardProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const steps = 35;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplay(Math.round((value * step) / steps));
      if (step >= steps) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3, boxShadow: "0 0 0 1.5px rgba(255,255,255,0.35), 0 12px 32px rgba(0,0,0,0.18)" }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl p-6 text-on-hero cursor-default ${gradient}`}
    >
      {/* Decorative shine */}
      <div className="absolute inset-0 bg-card-shine pointer-events-none" />
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-on-hero-muted text-xs font-semibold uppercase tracking-widest mb-2">{label}</p>
          <p className="text-4xl font-extrabold tabular-nums">
            {display}{suffix}
          </p>
        </div>
        <div className="bg-white/20 rounded-xl p-2.5">
          <Icon size={22} className="text-on-hero" />
        </div>
      </div>
    </motion.div>
  );
}
