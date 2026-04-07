import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LandingNavbar from "./components/landing/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { useAuthStore } from "./store/auth.store";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import TenderList from "./pages/tender/TenderList";
import TenderDetail from "./pages/tender/TenderDetail";
import MyBids from "./pages/bid/MyBids";
import Landing from "./pages/Landing";
import GovernmentDashboardShell from "./features/dashboard/components/GovernmentDashboardShell";
import AdminDashboardShell from "./features/admin/components/AdminDashboardShell";
import GovernmentDashboardPage from "./pages/government/GovernmentDashboardPage";
import CreateTenderPage from "./pages/government/CreateTenderPage";
import ManageTendersPage from "./pages/government/ManageTendersPage";
import BidsPage from "./pages/government/BidsPage";
import ProfilePage from "./pages/government/ProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminApprovalsPage from "./pages/admin/AdminApprovalsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

function DashboardRoute() {
  const role = useAuthStore((state) => state.user?.role?.[0]);

  if (role === "government") return <Navigate to="/government" replace />;
  if (role === "business") return <Navigate to="/tenders" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/" || location.pathname.startsWith("/government") || location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar ? <LandingNavbar /> : null}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tenders" element={<TenderList />} />
        <Route path="/tenders/:id" element={<TenderDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRoute />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["government"]} />}>
          <Route path="/government" element={<GovernmentDashboardShell />}>
            <Route index element={<GovernmentDashboardPage />} />
            <Route path="create" element={<CreateTenderPage />} />
            <Route path="manage" element={<ManageTendersPage />} />
            <Route path="bids" element={<BidsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="/tenders/create" element={<Navigate to="/government/create" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["business"]} />}>
          <Route path="/my-bids" element={<MyBids />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboardShell />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="approvals" element={<AdminApprovalsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
