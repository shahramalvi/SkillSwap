import { cn } from "../../lib/utils";

type BadgeVariant = "teal" | "navy" | "gold" | "purple" | "rose" | "muted" | "danger";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  teal:   "bg-teal/15 text-teal-dark border-teal/25",
  navy:   "bg-navy/10 text-navy border-navy/15",
  gold:   "bg-gold-light text-amber-700 border-gold/30",
  purple: "bg-purple-light text-purple border-purple/25",
  rose:   "bg-rose-light text-rose border-rose/25",
  muted:  "bg-slate-100 text-muted border-slate-200",
  danger: "bg-rose-light text-rose border-rose/25",
};

export function Badge({ children, variant = "teal", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
