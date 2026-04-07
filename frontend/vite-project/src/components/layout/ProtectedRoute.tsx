import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    const hasRole = allowedRoles.some((role) => user?.role?.includes(role));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
