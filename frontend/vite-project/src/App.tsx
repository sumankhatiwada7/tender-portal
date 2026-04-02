import { Navigate, Route, Routes } from "react-router-dom";
import { GuestOnlyRoute, ProtectedRoute } from "./features/auth/auth.guards";
import GovernmentDashboardShell from "./features/dashboard/components/GovernmentDashboardShell";
import LandingPage from "./pages/LandingPage";
import BidsPage from "./pages/government/BidsPage";
import CreateTenderPage from "./pages/government/CreateTenderPage";
import GovernmentDashboardPage from "./pages/government/GovernmentDashboardPage";
import ManageTendersPage from "./pages/government/ManageTendersPage";
import ProfilePage from "./pages/government/ProfilePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["government"]} />}>
        <Route path="/government" element={<GovernmentDashboardShell />}>
          <Route index element={<GovernmentDashboardPage />} />
          <Route path="create" element={<CreateTenderPage />} />
          <Route path="manage" element={<ManageTendersPage />} />
          <Route path="bids" element={<BidsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
