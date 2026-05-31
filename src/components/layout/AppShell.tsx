import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Crown,
  FileText,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  User,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSubscription } from "../../hooks/useSubscription";
import { cn } from "../../lib/utils";
import { Avatar } from "../ui/Avatar";
import { Logo } from "../ui/Logo";
import { NotificationBell } from "../features/notifications/NotificationBell";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/proposals", label: "Proposals", icon: FileText },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/help", label: "Help", icon: HelpCircle },
  { to: "/post-skill", label: "Post skill", icon: PlusCircle },
  { to: "/profile/me", label: "Profile", icon: User },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate("/");
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-white shadow-card text-navy shrink-0"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </motion.button>

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
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <NotificationBell />
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

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-8 md:pb-12 min-w-0">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-[60] w-[min(100vw-3rem,280px)] bg-navy flex flex-col shadow-[4px_0_32px_rgba(13,27,62,0.25)] pb-[env(safe-area-inset-bottom,0px)]"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <Logo variant="light" className="h-8 w-8 object-contain" />
                  <span className="font-bold text-on-hero text-sm">SkillSwap</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-on-hero-muted hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                  const active = navActive(location.pathname, to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
                        active
                          ? "bg-white/15 text-white"
                          : "text-on-hero-muted hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-3 py-4 border-t border-white/10 space-y-1">
                <Link
                  to="/plan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-gold hover:bg-white/10 transition-colors"
                >
                  <Crown size={18} />
                  {info?.status === "active" ? "Subscription" : "View plans"}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-on-hero-muted hover:bg-rose/20 hover:text-rose-light transition-colors"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
