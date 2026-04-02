import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { AppRole } from "./auth.types";
import { getHomeRouteForRole, loadSession } from "./auth.utils";

export function GuestOnlyRoute() {
  const session = loadSession();

  if (!session) {
    return <Outlet />;
  }

  return <Navigate to={getHomeRouteForRole(session.user.role)} replace />;
}

export function ProtectedRoute({ allowedRoles }: { allowedRoles: AppRole[] }) {
  const session = loadSession();
  const location = useLocation();

  if (!session) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (!allowedRoles.includes(session.user.role)) {
    return <Navigate to={getHomeRouteForRole(session.user.role)} replace />;
  }

  return <Outlet />;
}
