import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { deleteTender, fetchBidsForTender, fetchTenders } from "../../features/dashboard/dashboard.api";
import {
  CardSurface,
  DashboardIcon,
  EmptyState,
  LoadingBlock,
  Modal,
  StatCard,
  StatusBadge,
  TableActionButton,
} from "../../features/dashboard/components/DashboardUi";
import type { GovernmentOutletContext, TenderItem } from "../../features/dashboard/dashboard.types";
import { filterTendersForGovernment, formatDate, getApiErrorMessage } from "../../features/dashboard/dashboard.utils";

function GovernmentDashboardPage() {
  const { session } = useOutletContext<GovernmentOutletContext>();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [bidCounts, setBidCounts] = useState<Record<string, number>>({});
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
        ownedTenders.map(async (tender) => [tender.id, (await fetchBidsForTender(tender.id)).length] as const),
      );

      setBidCounts(Object.fromEntries(bidEntries));
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
      showToast({
        tone: "success",
        title: "Tender deleted",
        message: `${deleteTarget.title} was removed successfully.`,
      });
      setDeleteTarget(null);
      await loadDashboard();
    } catch (deleteError) {
      showToast({
        tone: "error",
        title: "Delete failed",
        message: getApiErrorMessage(deleteError, "Unable to delete this tender."),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const totalBids = Object.values(bidCounts).reduce((sum, count) => sum + count, 0);
  const activeTenders = tenders.filter((tender) => tender.status === "open").length;
  const closedTenders = tenders.filter((tender) => tender.status !== "open").length;
  const recentTenders = tenders.slice(0, 5);

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
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard detail="All tenders created by your office." icon="folder" label="Total Tenders" value={String(tenders.length)} />
        <StatCard detail="Currently visible to businesses." icon="spark" label="Active Tenders" tone="sky" value={String(activeTenders)} />
        <StatCard detail="Closed or already awarded." icon="clock" label="Closed Tenders" tone="slate" value={String(closedTenders)} />
        <StatCard detail="Incoming proposals across your tenders." icon="gavel" label="Total Bids Received" tone="emerald" value={String(totalBids)} />
      </div>

      <CardSurface className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Overview</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Recent tenders</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review the latest notices, jump into bid review, or manage changes.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-500"
            to="/government/create"
          >
            <DashboardIcon className="h-4 w-4" name="plus" />
            Create Tender
          </Link>
        </div>

        {recentTenders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No tenders yet"
              description="Create your first tender to start receiving bids from businesses."
              icon="folder"
              action={
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  to="/government/create"
                >
                  Publish a tender
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentTenders.map((tender) => (
                  <tr className="align-top" key={tender.id}>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">{tender.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {tender.category} • {tender.location}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{formatDate(tender.deadline)}</td>
                    <td className="px-6 py-5">
                      <StatusBadge status={tender.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        <TableActionButton
                          icon="eye"
                          label="View"
                          tone="sky"
                          onClick={() => navigate(`/government/bids?tender=${tender.id}`)}
                        />
                        <TableActionButton
                          icon="edit"
                          label="Edit"
                          onClick={() => navigate(`/government/manage?edit=${tender.id}`)}
                        />
                        <TableActionButton
                          icon="trash"
                          label="Delete"
                          tone="rose"
                          onClick={() => setDeleteTarget(tender)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardSurface>

      <CardSurface className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Focus areas</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Keep procurement moving with fewer blind spots</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use the government dashboard to publish new tenders, close inactive opportunities, and review bids before award decisions are made.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950" to="/government/manage">
              Manage all tenders
            </Link>
            <Link className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800" to="/government/bids">
              Review bids
            </Link>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">At a glance</p>
          <div className="mt-5 space-y-4">
            {[
              ["Open tenders", String(activeTenders)],
              ["Awaiting bid review", String(totalBids)],
              ["Recent notices", String(recentTenders.length)],
            ].map(([label, value]) => (
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3" key={label}>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </CardSurface>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete tender"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : undefined
        }
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            type="button"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-wait disabled:bg-rose-400"
            type="button"
            onClick={() => void handleDeleteTender()}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete tender"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default GovernmentDashboardPage;
