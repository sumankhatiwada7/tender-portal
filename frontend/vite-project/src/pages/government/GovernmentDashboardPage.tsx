import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useToast } from "../../components/ToastProvider";
import { deleteTender, fetchBidsForTender, fetchTenders } from "../../features/dashboard/dashboard.api";
import {
  CardSurface,
  DashboardIcon,
  EmptyState,
  LoadingBlock,
  Modal,
  SectionHeader,
  StatCard,
  StatusBadge,
  TableActionButton,
} from "../../features/dashboard/components/DashboardUi";
import type { BidItem, GovernmentOutletContext, TenderItem } from "../../features/dashboard/dashboard.types";
import { filterTendersForGovernment, formatDate, getApiErrorMessage } from "../../features/dashboard/dashboard.utils";

function monthKey(value?: string) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? "Now" : new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

function GovernmentDashboardPage() {
  const { session } = useOutletContext<GovernmentOutletContext>();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [bidsByTender, setBidsByTender] = useState<Record<string, BidItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const allTenders = await fetchTenders();
      const ownedTenders = filterTendersForGovernment(allTenders, session.user.id);
      setTenders(ownedTenders);
      const bidEntries = await Promise.all(
        ownedTenders.map(async (tender) => [tender.id, await fetchBidsForTender(tender.id)] as const),
      );
      setBidsByTender(Object.fromEntries(bidEntries));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load the dashboard right now."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [session.user.id]);

  async function handleDeleteTender() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTender(deleteTarget.id);
      showToast({ tone: "success", title: "Tender deleted", message: `${deleteTarget.title} was removed successfully.` });
      setDeleteTarget(null);
      await loadDashboard();
    } catch (deleteError) {
      showToast({ tone: "error", title: "Delete failed", message: getApiErrorMessage(deleteError, "Unable to delete this tender.") });
    } finally {
      setIsDeleting(false);
    }
  }

  const allBids = Object.values(bidsByTender).flat();
  const activeTenders = tenders.filter((tender) => tender.status === "open").length;
  const closedTenders = tenders.filter((tender) => tender.status !== "open").length;
  const pendingBids = allBids.filter((bid) => bid.status === "pending").length;
  const recentTenders = tenders.slice(0, 5);
  const monthlyTenderData = Object.values(
    tenders.reduce<Record<string, { month: string; tenders: number }>>((acc, tender) => {
      const key = monthKey(tender.createdAt ?? tender.deadline);
      acc[key] = acc[key] ?? { month: key, tenders: 0 };
      acc[key].tenders += 1;
      return acc;
    }, {}),
  );

  if (loading) {
    return <LoadingBlock label="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description={error}
        icon="spark"
        action={
          <button className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="button" onClick={() => void loadDashboard()}>
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard detail="Currently open." icon="spark" label="Active Tenders" value={String(activeTenders)} />
        <StatCard detail="Closed or awarded." icon="clock" label="Closed Tenders" tone="slate" value={String(closedTenders)} />
        <StatCard detail="All received bids." icon="gavel" label="Total Bids" tone="emerald" value={String(allBids.length)} />
        <StatCard detail="Need review." icon="chart" label="Pending Bids" tone="amber" value={String(pendingBids)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <CardSurface className="p-5">
          <SectionHeader eyebrow="Overview" title="Tender postings" description="A simple monthly view of published tenders." />
          <div className="mt-5 h-64">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={monthlyTenderData.length ? monthlyTenderData : [{ month: "Now", tenders: 0 }]}>
                <defs>
                  <linearGradient id="cleanTenderPostings" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis allowDecimals={false} tickLine={false} />
                <Tooltip />
                <Area dataKey="tenders" fill="url(#cleanTenderPostings)" stroke="#0284c7" strokeWidth={3} type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardSurface>

        <CardSurface className="p-5">
          <SectionHeader eyebrow="Quick actions" title="Common tasks" />
          <div className="mt-5 grid gap-3">
            <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500" to="/government/create">
              <DashboardIcon className="h-4 w-4" name="plus" />
              Create Tender
            </Link>
            <Link className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" to="/government/bids">
              View Bids
            </Link>
            <Link className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" to="/government/payment">
              Purchase Credits
            </Link>
          </div>
        </CardSurface>
      </div>

      <CardSurface className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800">
          <SectionHeader eyebrow="Recent activity" title="Recent tenders" description="Latest tender records from your office." />
        </div>

        {recentTenders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No tenders yet"
              description="Create your first tender to start receiving bids."
              icon="folder"
              action={
                <Link className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white" to="/government/create">
                  Create tender
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto dashboard-scrollbar">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-950">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4">Tender</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {recentTenders.map((tender) => (
                  <tr className="align-top" key={tender.id}>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900 dark:text-white">{tender.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tender.category}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">{formatDate(tender.deadline)}</td>
                    <td className="px-6 py-5"><StatusBadge status={tender.status} /></td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        <TableActionButton icon="eye" label="Bids" tone="sky" onClick={() => navigate(`/government/bids?tender=${tender.id}`)} />
                        <TableActionButton icon="edit" label="Edit" onClick={() => navigate(`/government/manage?edit=${tender.id}`)} />
                        <TableActionButton icon="trash" label="Delete" tone="rose" onClick={() => setDeleteTarget(tender)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardSurface>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete tender"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"?` : undefined}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
            Cancel
          </button>
          <button className="rounded-lg bg-rose-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:bg-rose-400" type="button" onClick={() => void handleDeleteTender()} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete tender"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default GovernmentDashboardPage;
