import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTenders } from "../../features/dashboard/dashboard.api";
import type { TenderItem } from "../../features/dashboard/dashboard.types";
import { fetchAdminOverview, fetchAdminPayments, fetchAllUsers, fetchPendingUsers } from "../../features/admin/admin.api";
import type { AdminOverview, AdminPayment, AdminUser } from "../../features/admin/admin.types";
import { DashboardIcon } from "../../features/dashboard/components/DashboardUi";
import {
  AdminCard,
  AreaChart,
  BarChart,
  DonutChart,
  EmptyPanel,
  MetricCard,
  SectionHeader,
  StatusPill,
  TableSkeleton,
} from "../../features/admin/components/AdminUi";

const emptyOverview: AdminOverview = {
  totalTenders: 0,
  activeBids: 0,
  approvedCompanies: 0,
  revenue: 0,
};

const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function getLastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: shortMonths[date.getMonth()],
    };
  });
}

function groupByMonth<TItem>(items: TItem[], getDate: (item: TItem) => string | undefined, getValue: (item: TItem) => number = () => 1) {
  const months = getLastSixMonths();
  return months.map((month) => ({
    label: month.label,
    value: items.reduce((total, item) => {
      const dateValue = getDate(item);
      if (!dateValue) return total;
      const date = new Date(dateValue);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      return key === month.key ? total + getValue(item) : total;
    }, 0),
  }));
}

function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const [overviewData, pending, users, paymentRows, tenderRows] = await Promise.all([
        fetchAdminOverview(),
        fetchPendingUsers(),
        fetchAllUsers(),
        fetchAdminPayments(),
        fetchTenders(),
      ]);

      setOverview(overviewData);
      setPendingUsers(pending);
      setAllUsers(users);
      setPayments(paymentRows);
      setTenders(tenderRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const analytics = useMemo(() => {
    const paidPayments = payments.filter((payment) => payment.status === "paid");
    const tenderActivity = groupByMonth(tenders, (tender) => tender.deadline);
    const bidAnalytics = groupByMonth(payments.filter((payment) => payment.type === "bid"), (payment) => payment.purchaseDate, (payment) => payment.quantity);
    const revenueAnalytics = groupByMonth(paidPayments, (payment) => payment.purchaseDate, (payment) => payment.amount);
    const paid = payments.filter((payment) => payment.status === "paid").length;
    const pending = payments.filter((payment) => payment.status === "pending").length;
    const failed = payments.filter((payment) => payment.status === "failed").length;

    return {
      tenderActivity,
      bidAnalytics,
      revenueAnalytics,
      paid,
      pending,
      failed,
    };
  }, [payments, tenders]);

  const recentActivities = useMemo(() => {
    const paymentActivities = payments.slice(0, 3).map((payment) => ({
      id: `payment-${payment.id}`,
      title: `${payment.companyName} purchased ${payment.creditPackage}`,
      meta: `${currency(payment.amount)} via ${payment.paymentMethod}`,
      date: payment.purchaseDate,
      icon: "cash" as const,
    }));

    const approvalActivities = pendingUsers.slice(0, 3).map((user) => ({
      id: `approval-${user.id}`,
      title: `${user.name} is waiting for approval`,
      meta: `${user.role} account`,
      date: user.createdAt,
      icon: "shield" as const,
    }));

    return [...paymentActivities, ...approvalActivities]
      .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
      .slice(0, 5);
  }, [payments, pendingUsers]);

  const recentTenders = tenders.slice(0, 6);
  const approvedBusinesses = allUsers.filter((user) => user.role === "business" && user.status === "approved").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TableSkeleton columns={1} rows={4} />
        </div>
        <TableSkeleton columns={4} rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyPanel
        title="Dashboard unavailable"
        description={error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard detail="All tender records in the portal" icon="grid" label="Total Tenders" value={String(overview.totalTenders)} />
        <MetricCard detail="Bids currently awaiting decision" icon="gavel" label="Active Bids" tone="amber" value={String(overview.activeBids)} />
        <MetricCard detail={`${approvedBusinesses} approved business accounts`} icon="building" label="Approved Companies" tone="emerald" value={String(overview.approvedCompanies)} />
        <MetricCard detail="Completed credit purchases" icon="cash" label="Revenue / Payments" tone="slate" value={currency(overview.revenue)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <AdminCard className="p-5">
          <SectionHeader
            eyebrow="Tender activity"
            title="Tender activity graph"
            description="Tender volume across the current six-month operating window."
          />
          <div className="mt-5">
            <AreaChart data={analytics.tenderActivity} />
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <SectionHeader eyebrow="Payments" title="Payment analytics" description="Status split for platform purchases." />
          <div className="mt-8">
            <DonutChart paid={analytics.paid} pending={analytics.pending} failed={analytics.failed} />
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard className="p-5">
          <SectionHeader eyebrow="Bids" title="Bid submission analytics" description="Bid credit purchases indicate bidder demand." />
          <div className="mt-5">
            <BarChart data={analytics.bidAnalytics} />
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <SectionHeader eyebrow="Revenue" title="Monthly revenue graph" description="Completed payment value by purchase month." />
          <div className="mt-5">
            <AreaChart data={analytics.revenueAnalytics} stroke="#0f766e" />
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <AdminCard className="p-5">
          <SectionHeader eyebrow="Activity" title="Recent activities" />
          <div className="mt-5 space-y-3">
            {recentActivities.length === 0 ? (
              <EmptyPanel title="No recent activity" description="New approvals and payments will appear here." />
            ) : (
              recentActivities.map((activity) => (
                <div className="flex gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50" key={activity.id}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                    <DashboardIcon className="h-4 w-4" name={activity.icon} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{activity.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{activity.meta} · {formatDate(activity.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        <AdminCard className="overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <SectionHeader
              eyebrow="Applications"
              title="Recent tender applications"
              action={
                <Link className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800" to="/admin/approvals">
                  Review queue
                </Link>
              }
            />
          </div>

          {recentTenders.length === 0 ? (
            <div className="p-5">
              <EmptyPanel title="No tenders yet" description="Tender applications will appear after government users publish them." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-5 py-3">Tender</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Deadline</th>
                    <th className="px-5 py-3">Budget</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTenders.map((tender) => (
                    <tr className="transition hover:bg-slate-50" key={tender.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{tender.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{tender.location}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{tender.category}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(tender.deadline)}</td>
                      <td className="px-5 py-4 font-medium text-slate-900">NPR {tender.budget.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={tender.status === "open" ? "approved" : tender.status === "closed" ? "pending" : "paid"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>

      <AdminCard className="p-5">
        <SectionHeader eyebrow="Shortcuts" title="Quick actions" description="Common admin tasks without leaving the workspace." />
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            { to: "/admin/approvals", label: "Review approvals", icon: "shield" as const },
            { to: "/admin/users", label: "Manage users", icon: "user" as const },
            { to: "/admin/payments", label: "Open payment history", icon: "cash" as const },
          ].map((item) => (
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700 hover:shadow-sm"
              key={item.to}
              to={item.to}
            >
              <DashboardIcon className="h-4 w-4" name={item.icon} />
              {item.label}
            </Link>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

export default AdminDashboardPage;
