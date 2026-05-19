import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

const FALLBACK: Record<string, string> = {
  "/login": "/",
  "/register": "/",
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
        "text-sm font-semibold text-teal hover:text-navy hover:underline transition-colors cursor-pointer",
        className,
      )}
    >
      {label}
    </button>
  );
}
