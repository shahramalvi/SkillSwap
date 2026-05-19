import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type ContainerSize = "default" | "narrow" | "wide";

const WIDTH: Record<ContainerSize, string> = {
  default: "max-w-[min(100%,88rem)]",
  narrow: "max-w-3xl",
  wide: "max-w-[min(100%,96rem)]",
};

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
}

/** Page-width shell — wider content, tighter side gutters. */
export function Container({ children, className, size = "default" }: ContainerProps) {
  return (
    <div className={cn(WIDTH[size], "mx-auto w-full px-4 sm:px-5 lg:px-6", className)}>
      {children}
    </div>
  );
}
