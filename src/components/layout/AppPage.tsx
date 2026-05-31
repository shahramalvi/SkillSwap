import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { PageWrapper } from "./PageWrapper";

interface AppPageProps {
  children: ReactNode;
  className?: string;
  showBack?: boolean;
  backTo?: string;
}

export function AppPage({
  children,
  className,
  showBack = false,
  backTo,
}: AppPageProps) {
  return (
    <PageWrapper className={cn("min-h-full", className)} showBack={showBack} backTo={backTo}>
      <div className="space-y-6 w-full">{children}</div>
    </PageWrapper>
  );
}

interface AppPageSplitProps {
  main: ReactNode;
  aside: ReactNode;
  className?: string;
  asidePosition?: "left" | "right";
}

export function AppPageSplit({
  main,
  aside,
  className,
  asidePosition = "right",
}: AppPageSplitProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6 lg:gap-8 min-w-0",
        asidePosition === "left"
          ? "md:grid-cols-[min(100%,280px)_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]"
          : "md:grid-cols-[minmax(0,1fr)_min(100%,280px)] lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]",
        className,
      )}
    >
      {asidePosition === "left" ? (
        <>
          <aside className="space-y-4 md:sticky md:top-[5.5rem] md:self-start order-2 md:order-1 min-w-0">
            {aside}
          </aside>
          <div className="space-y-4 sm:space-y-6 min-w-0 order-1 md:order-2">{main}</div>
        </>
      ) : (
        <>
          <div className="space-y-4 sm:space-y-6 min-w-0">{main}</div>
          <aside className="space-y-4 md:sticky md:top-[5.5rem] md:self-start min-w-0">{aside}</aside>
        </>
      )}
    </div>
  );
}

export function AppAsidePanel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AppPanel className={cn("p-5", className)}>
      {title && <h3 className="text-sm font-bold text-navy mb-3">{title}</h3>}
      {children}
    </AppPanel>
  );
}

export function AppStatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className={cn("text-sm font-bold tabular-nums", highlight ? "text-teal-dark" : "text-navy")}>
        {value}
      </span>
    </div>
  );
}

export function AppPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-3xl border border-white shadow-card", className)}>
      {children}
    </div>
  );
}

export function AppSectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-navy">{title}</h2>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function tabButtonClass(active: boolean) {
  return cn(
    "px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap",
    active
      ? "bg-navy text-on-hero shadow-sm"
      : "bg-surface2 text-muted hover:text-navy hover:bg-white",
  );
}
