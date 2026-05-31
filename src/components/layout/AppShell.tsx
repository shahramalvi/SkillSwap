import { motion } from "framer-motion";
import {
  Briefcase,
  Crown,
  FileText,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PlusCircle,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSubscription } from "../../hooks/useSubscription";
import { cn } from "../../lib/utils";
import { Avatar } from "../ui/Avatar";
import { Logo } from "../ui/Logo";
import { NotificationBell } from "../features/notifications/NotificationBell";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { to: "/jobs", label: "Jobs", shortLabel: "Jobs", icon: Briefcase },
  { to: "/proposals", label: "Proposals", shortLabel: "Sent", icon: FileText },
  { to: "/requests", label: "Requests", shortLabel: "Inbox", icon: Inbox },
  { to: "/messages", label: "Messages", shortLabel: "Chat", icon: MessageSquare },
  { to: "/help", label: "Help", shortLabel: "Help", icon: HelpCircle },
  { to: "/post-skill", label: "Post skill", shortLabel: "Post", icon: PlusCircle },
  { to: "/profile/me", label: "Profile", shortLabel: "Profile", icon: User },
] as const;

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/jobs": "Browse jobs",
  "/proposals": "Proposals",
  "/requests": "Requests",
  "/messages": "Messages",
  "/help": "Help center",
  "/post-skill": "Post a skill",
  "/profile/me": "My profile",
  "/plan": "Subscription",
};

function pageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/chat/")) return "Chat";
  if (pathname.startsWith("/profile/")) return "Member profile";
  return "SkillSwap";
}

function navActive(pathname: string, to: string): boolean {
  if (to === "/profile/me") return pathname.startsWith("/profile");
  if (to === "/messages") return pathname.startsWith("/messages") || pathname.startsWith("/chat/");
  return pathname === to;
}

export function AppShell({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const { info } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  const title = pageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-[#eef1f8] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-[72px] bg-navy flex-col items-center py-6 gap-2 shadow-soft">
        <Link to="/dashboard" className="mb-4">
          <Logo variant="light" className="h-8 w-8 object-contain" />
        </Link>

        <nav className="flex flex-col items-center gap-2 flex-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = navActive(location.pathname, to);
            return (
              <Link
                key={to}
                to={to}
                title={label}
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                  active
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-on-hero-muted hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-2 mt-auto">
          <Link
            to="/plan"
            title="Plan"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-gold hover:bg-white/10 transition-all"
          >
            <Crown size={20} />
          </Link>
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-on-hero-muted hover:bg-rose/20 hover:text-rose-light transition-all"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </aside>

      <div className="flex-1 md:ml-[72px] min-h-screen flex flex-col min-w-0 w-full">
        <header className="sticky top-0 z-30 bg-[#eef1f8]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 border-b border-white/60">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-navy tracking-tight truncate">
              {title}
            </h1>
            {info && (
              <p className="text-xs text-muted mt-0.5 truncate">
                {info.status === "trial"
                  ? `${info.daysRemaining ?? 0} days left on trial`
                  : info.label}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <NotificationBell />
            <Link
              to="/plan"
              title="Plan"
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gold bg-white border border-white shadow-card"
            >
              <Crown size={18} />
            </Link>
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted bg-white border border-white shadow-card hover:text-rose"
            >
              <LogOut size={16} />
            </motion.button>
            <Link
              to="/profile/me"
              className="flex items-center gap-2 sm:gap-3 bg-white rounded-2xl pl-1.5 sm:pl-2 pr-2 sm:pr-4 py-1.5 sm:py-2 shadow-card border border-white hover:border-border transition-colors max-w-[min(100%,200px)] sm:max-w-none"
            >
              <Avatar initials={user.avatar} size="sm" />
              <div className="hidden sm:block text-left leading-tight min-w-0">
                <p className="text-sm font-semibold text-navy truncate">{user.name}</p>
                <p className="text-[11px] text-muted truncate max-w-[140px]">{user.email}</p>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-12 min-w-0">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy border-t border-white/10 shadow-[0_-4px_24px_rgba(13,27,62,0.15)] pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch h-16 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map(({ to, icon: Icon, label, shortLabel }) => {
            const active = navActive(location.pathname, to);
            return (
              <Link
                key={to}
                to={to}
                title={label}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-[4.25rem] max-w-[5.5rem] px-1 py-2 transition-colors",
                  active ? "text-white" : "text-on-hero-muted",
                )}
              >
                <span
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    active && "bg-white/15",
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
                </span>
                <span className="text-[10px] font-semibold truncate w-full text-center leading-tight">
                  {shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
