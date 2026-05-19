import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface TokenBadgeProps {
  balance: number;
  className?: string;
}

export function TokenBadge({ balance, className }: TokenBadgeProps) {
  const [display, setDisplay] = useState(balance);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const prev = display;
    if (prev === balance) return;
    setFlash(true);
    const steps = 20;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplay(Math.round(prev + ((balance - prev) * step) / steps));
      if (step >= steps) { clearInterval(interval); setFlash(false); }
    }, 30);
    return () => clearInterval(interval);
  }, [balance]);

  return (
    <motion.span
      animate={flash ? { scale: [1, 1.12, 1] } : {}}
      transition={{ duration: 0.35 }}
      className={cn(
        "inline-flex items-center gap-1.5 font-bold text-teal bg-teal/10 border border-teal/25 rounded-full px-3 py-1 text-sm",
        className,
      )}
    >
      <Coins size={14} />
      {display}
    </motion.span>
  );
}
