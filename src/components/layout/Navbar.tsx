import { motion } from "framer-motion";
import { Inbox, LayoutDashboard, Search, PlusCircle, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { TokenBadge } from "../features/TokenBadge";
import { Avatar } from "../ui/Avatar";
import { Logo } from "../ui/Logo";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/requests", label: "Requests", icon: Inbox },
    { to: "/search", label: "Search", icon: Search },
    { to: "/post-skill", label: "Post skill", icon: PlusCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-5 lg:px-6 h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
          <Logo variant="dark" className="h-9" />
          <div className="hidden sm:block leading-tight">
            <span className="font-extrabold text-navy text-base block">SkillSwap</span>
            <span className="text-[10px] text-karachi-gray tracking-[0.15em] uppercase">Karachi</span>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-navy text-on-hero"
                      : "text-muted hover:bg-teal-light hover:text-teal"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}

            <TokenBadge
              balance={user.tokenBalance}
              className="ml-2 hidden sm:inline-flex px-3 py-2 rounded-xl text-sm font-medium text-muted bg-transparent border-0 hover:bg-teal-light hover:text-teal"
            />

            <Link to="/profile/me" className="ml-1">
              <Avatar initials={user.avatar} size="sm" ring />
            </Link>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleLogout}
              className="ml-1 p-2 text-muted hover:text-rose hover:bg-rose-light rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-muted hover:text-navy transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-navy-gradient text-on-hero text-sm font-semibold px-5 py-2.5 rounded-xl shadow-none hover:opacity-90 transition-opacity"
            >
              Join free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
