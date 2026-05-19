import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-navy-gradient text-on-hero shadow-none hover:opacity-90 active:scale-[0.98]",
  secondary:
    "bg-teal-gradient text-on-hero shadow-none hover:opacity-90 active:scale-[0.98]",
  ghost:
    "bg-white border border-border text-navy shadow-none hover:border-teal hover:text-teal hover:bg-teal-light active:scale-[0.98]",
  danger:
    "bg-rose-gradient text-on-hero shadow-none hover:opacity-90 active:scale-[0.98]",
  gold:
    "bg-gold-gradient text-navy shadow-none hover:opacity-90 active:scale-[0.98]",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "font-semibold transition-all duration-200",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
