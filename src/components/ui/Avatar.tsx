import { cn } from "../../lib/utils";

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  neon?: boolean;
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

const gradients = [
  "from-teal to-teal-dark",
  "from-navy to-navy-light",
  "from-purple to-violet-600",
  "from-gold to-amber-600",
  "from-rose to-pink-600",
];

function getGradient(initials: string) {
  const idx = (initials.charCodeAt(0) || 0) % gradients.length;
  return gradients[idx];
}

export function Avatar({ initials, size = "md", ring, neon, className }: AvatarProps) {
  const showRing = ring ?? neon;
  const gradient = getGradient(initials);

  return (
    <div
      className={cn(
        `rounded-full bg-gradient-to-br ${gradient} text-on-hero font-bold flex items-center justify-center shrink-0`,
        sizes[size],
        showRing && "ring-2 ring-teal ring-offset-2",
        className,
      )}
    >
      {initials}
    </div>
  );
}
