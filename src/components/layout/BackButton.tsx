import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

const FALLBACK: Record<string, string> = {
  "/login": "/",
  "/register": "/",
  "/dashboard": "/",
  "/search": "/dashboard",
  "/requests": "/dashboard",
  "/post-skill": "/dashboard",
  "/profile/me": "/dashboard",
};

function defaultBackTarget(pathname: string): string {
  if (pathname.startsWith("/profile/") && pathname !== "/profile/me") {
    return "/search";
  }
  return FALLBACK[pathname] ?? "/dashboard";
}

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export function BackButton({ to, label = "Back", className }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (to) {
      navigate(to);
      return;
    }
    if (location.key !== "default") {
      navigate(-1);
      return;
    }
    navigate(defaultBackTarget(location.pathname));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold",
        "bg-white/95 border border-border text-navy shadow-card",
        "hover:bg-white hover:border-teal/40 transition-all",
        className,
      )}
    >
      <ArrowLeft size={16} aria-hidden />
      {label}
    </button>
  );
}
