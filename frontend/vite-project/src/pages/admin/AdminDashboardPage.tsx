import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { fetchAllUsers, fetchPendingUsers } from "../../features/admin/admin.api";
import type { AdminOutletContext, AdminUser } from "../../features/admin/admin.types";
import {
  CardSurface,
  EmptyState,
  LoadingBlock,
  StatCard,
} from "../../features/dashboard/components/DashboardUi";

function AdminDashboardPage() {
  const { session } = useOutletContext<AdminOutletContext>();
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const [pending, users] = await Promise.all([fetchPendingUsers(), fetchAllUsers()]);
      setPendingUsers(pending);
      setAllUsers(users);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load admin dashboard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const approvedCount = allUsers.filter((user) => user.status === "approved").length;
    const rejectedCount = allUsers.filter((user) => user.status === "rejected").length;
    const businessCount = allUsers.filter((user) => user.role === "business").length;
    const governmentCount = allUsers.filter((user) => user.role === "government").length;

    return {
      approvedCount,
      rejectedCount,
      businessCount,
      governmentCount,
    };
  }, [allUsers]);

  if (loading) {
    return <LoadingBlock label="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Admin dashboard unavailable"
        description={error}
        icon="shield"
        action={
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
            onClick={() => void loadDashboard()}
          >
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <CardSurface className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Welcome</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Admin operator: {session.user.name}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Use dedicated pages for approvals and account status management.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-500"
            to="/admin/approvals"
          >
            Open approvals page
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
            to="/admin/users"
          >
            Open users page
          </Link>
        </div>
      </CardSurface>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard detail="Users waiting for account review." icon="clock" label="Pending Users" tone="amber" value={String(pendingUsers.length)} />
        <StatCard detail="Users currently allowed to log in." icon="shield" label="Approved Users" tone="emerald" value={String(stats.approvedCount)} />
        <StatCard detail="Government organizations registered." icon="building" label="Government Accounts" value={String(stats.governmentCount)} />
        <StatCard detail="Businesses participating in tenders." icon="briefcase" label="Business Accounts" tone="sky" value={String(stats.businessCount)} />
      </div>

        <CardSurface className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Operations notes</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Keep approvals timely and consistent</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Prioritize government accounts that need tender publishing rights and verify business profiles before granting access.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Quick signal</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Rejected users</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stats.rejectedCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Total user base</p>
                <p className="mt-2 text-2xl font-semibold text-white">{allUsers.length}</p>
              </div>
            </div>
          </div>
        </CardSurface>
    </div>
  );
}

export default AdminDashboardPage;
