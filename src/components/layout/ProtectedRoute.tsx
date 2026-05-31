import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSubscription } from "../../hooks/useSubscription";
import { PageSkeleton } from "../ui/Skeleton";

const ACCESS_EXEMPT_PATHS = ["/plan"];

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { hasAccess } = useSubscription();
  const location = useLocation();

  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;

  const exempt = ACCESS_EXEMPT_PATHS.some((path) => location.pathname.startsWith(path));
  if (!hasAccess && !exempt) {
    return <Navigate to="/plan" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
