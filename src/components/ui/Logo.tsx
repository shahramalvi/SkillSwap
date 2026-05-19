import { cn } from "../../lib/utils";

/** `light` = l2 on navy/hero backgrounds. `dark` = l1 on white backgrounds. */
export type LogoVariant = "light" | "dark";

const SRC: Record<LogoVariant, string> = {
  light: "/logo-l2.png?v=3",
  dark: "/logo-l1.png?v=3",
};

interface LogoProps {
  variant: LogoVariant;
  alt?: string;
  className?: string;
}

export function Logo({ variant, alt = "SkillSwap", className }: LogoProps) {
  return (
    <img
      src={SRC[variant]}
      alt={alt}
      className={cn(
        "w-auto object-contain bg-transparent",
        variant === "light" && "mix-blend-screen",
        className,
      )}
      style={{ background: "transparent" }}
    />
  );
}
