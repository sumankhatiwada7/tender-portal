import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { deleteTender, fetchBidsForTender, fetchTenders, updateTender } from "../../features/dashboard/dashboard.api";
import {
  CardSurface,
  DashboardIcon,
  EmptyState,
  LoadingBlock,
  Modal,
  PaginationControls,
  SectionHeader,
  StatusBadge,
  TableActionButton,
} from "../../features/dashboard/components/DashboardUi";
import TenderForm from "../../features/dashboard/components/TenderForm";
import type { GovernmentOutletContext, TenderItem, TenderMutationInput, TenderStatus } from "../../features/dashboard/dashboard.types";
import {
  filterTendersForGovernment,
  formatCurrency,
  formatDate,
  formatShortDate,
  getApiErrorMessage,
  matchesSearch,
} from "../../features/dashboard/dashboard.utils";

const pageSize = 7;

function ManageTendersPage() {
  const { session } = useOutletContext<GovernmentOutletContext>();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [bidCounts, setBidCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | TenderStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"deadline" | "created">("deadline");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTender, setEditingTender] = useState<TenderItem | null>(null);
  const [detailsTender, setDetailsTender] = useState<TenderItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  async function loadOwnedTenders() {
    setLoading(true);
    setError(null);

    try {
      const allTenders = await fetchTenders();
      const ownedTenders = filterTendersForGovernment(allTenders, session.user.id);
      setTenders(ownedTenders);

      const entries = await Promise.all(
        ownedTenders.map(async (tender) => [tender.id, (await fetchBidsForTender(tender.id)).length] as const),
      );
      setBidCounts(Object.fromEntries(entries));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load your tenders."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOwnedTenders();
  }, [session.user.id]);

  const categories = useMemo(() => Array.from(new Set(tenders.map((tender) => tender.category))).sort(), [tenders]);

  const filteredTenders = useMemo(() => {
    return [...tenders]
      .filter((tender) => {
        const matchesStatus = statusFilter === "all" ? true : tender.status === statusFilter;
        const matchesCategory = categoryFilter === "all" ? true : tender.category === categoryFilter;
        const query = deferredSearch.trim();
        const matchesQuery =
          query.length === 0
            ? true
            : [tender.id, tender.title, tender.category, tender.location, tender.description].some((value) =>
                matchesSearch(value, query),
              );

        return matchesStatus && matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        const left = new Date(sortBy === "created" ? a.createdAt ?? a.deadline : a.deadline).getTime();
        const right = new Date(sortBy === "created" ? b.createdAt ?? b.deadline : b.deadline).getTime();
        return left - right;
      });
  }, [categoryFilter, deferredSearch, sortBy, statusFilter, tenders]);

  const totalPages = Math.max(1, Math.ceil(filteredTenders.length / pageSize));
  const paginatedTenders = filteredTenders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, deferredSearch, sortBy, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId) {
      setEditingTender(null);
      return;
    }

    setEditingTender(tenders.find((tender) => tender.id === editId) ?? null);
  }, [searchParams, tenders]);

  async function handleUpdateTender(input: TenderMutationInput) {
    if (!editingTender) {
      return;
    }

    const updatedTender = await updateTender(editingTender.id, input);
    setTenders((current) => current.map((tender) => (tender.id === updatedTender.id ? updatedTender : tender)));
    showToast({
      tone: "success",
      title: "Tender updated",
      message: `${updatedTender.title} has been updated successfully.`,
    });
    closeEditModal();
  }

  async function handleStatusChange(tender: TenderItem, status: "open" | "closed") {
    setStatusUpdatingId(tender.id);

    try {
      const updatedTender = await updateTender(tender.id, {
        title: tender.title,
        description: tender.description,
        budget: tender.budget,
        deadline: tender.deadline,
        category: tender.category,
        location: tender.location,
        documents: [],
        status,
        eligibilityCriteria: tender.eligibilityCriteria,
        requiredDocuments: tender.requiredDocuments,
        tenderType: tender.tenderType,
        contactInformation: tender.contactInformation,
      });
      setTenders((current) => current.map((item) => (item.id === updatedTender.id ? updatedTender : item)));
      showToast({ tone: "success", title: "Status updated", message: `${tender.title} is now ${status === "open" ? "active" : "closed"}.` });
    } catch (statusError) {
      showToast({
        tone: "error",
        title: "Status update failed",
        message: getApiErrorMessage(statusError, "Unable to update tender status."),
      });
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDeleteTender() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteTender(deleteTarget.id);
      setTenders((current) => current.filter((tender) => tender.id !== deleteTarget.id));
      showToast({
        tone: "success",
        title: "Tender deleted",
        message: `${deleteTarget.title} was removed from your dashboard.`,
      });
      setDeleteTarget(null);
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

  function closeEditModal() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("edit");
    setSearchParams(nextParams, { replace: true });
    setEditingTender(null);
  }

  if (loading) {
    return <LoadingBlock label="Loading your tenders..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load tenders"
        description={error}
        icon="folder"
        action={
          <button
            className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
            onClick={() => void loadOwnedTenders()}
          >
            Retry
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <CardSurface className="p-6">
        <SectionHeader
          eyebrow="Tender management"
          title="Manage tender notices"
          description="Search, filter, sort, update status, inspect details, and maintain tender records from one workspace."
          action={
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-500"
              to="/government/create"
            >
              <DashboardIcon className="h-4 w-4" name="plus" />
              Create Tender
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_190px_190px_190px]">
          <label className="block">
            <span className="sr-only">Search tenders</span>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
              <DashboardIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                placeholder="Search ID, title, category, location, or description"
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </label>

          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | TenderStatus)}
          >
            <option value="all">All statuses</option>
            <option value="open">Active</option>
            <option value="closed">Closed</option>
            <option value="awarded">Under Review</option>
          </select>

          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as "deadline" | "created")}
          >
            <option value="deadline">Sort by deadline</option>
            <option value="created">Sort by created date</option>
          </select>
        </div>
      </CardSurface>

      {filteredTenders.length === 0 ? (
        <EmptyState
          title="No tenders match your filters"
          description="Try changing the search text, status, or category filter, or create a new tender notice to get started."
          icon="folder"
          action={
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              to="/government/create"
            >
              Create a tender
            </Link>
          }
        />
      ) : (
        <CardSurface className="overflow-hidden">
          <div className="overflow-x-auto dashboard-scrollbar">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-950">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4">Tender ID</th>
                  <th className="px-5 py-4">Tender Name</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Deadline</th>
                  <th className="px-5 py-4">Total Bids</th>
                  <th className="px-5 py-4">Created Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {paginatedTenders.map((tender) => (
                  <tr className="align-top transition hover:bg-slate-50 dark:hover:bg-slate-950" key={tender.id}>
                    <td className="px-5 py-5 text-xs font-semibold text-slate-500 dark:text-slate-400">{tender.id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-5">
                      <p className="font-semibold text-slate-900 dark:text-white">{tender.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tender.category} | {tender.location}</p>
                    </td>
                    <td className="px-5 py-5">
                      <div className="space-y-2">
                        <StatusBadge status={tender.status} />
                        {tender.status !== "awarded" ? (
                          <select
                            className="block rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            value={tender.status}
                            disabled={statusUpdatingId === tender.id}
                            onChange={(event) => void handleStatusChange(tender, event.target.value as "open" | "closed")}
                          >
                            <option value="open">Active</option>
                            <option value="closed">Closed</option>
                          </select>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">{formatDate(tender.deadline)}</td>
                    <td className="px-5 py-5 text-sm font-semibold text-slate-900 dark:text-white">{bidCounts[tender.id] ?? 0}</td>
                    <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">{formatShortDate(tender.createdAt)}</td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        <TableActionButton icon="eye" label="Details" tone="sky" onClick={() => setDetailsTender(tender)} />
                        <TableActionButton icon="edit" label="Edit" onClick={() => setSearchParams(new URLSearchParams({ edit: tender.id }), { replace: true })} />
                        <TableActionButton icon="trash" label="Delete" tone="rose" onClick={() => setDeleteTarget(tender)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 pb-6">
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </CardSurface>
      )}

      <Modal
        open={Boolean(detailsTender)}
        title={detailsTender?.title ?? "Tender details"}
        description="Review the complete tender record before changing status or editing details."
        onClose={() => setDetailsTender(null)}
      >
        {detailsTender ? (
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950"><span className="font-semibold text-slate-950 dark:text-white">Tender ID:</span> {detailsTender.id}</p>
            <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950"><span className="font-semibold text-slate-950 dark:text-white">Budget:</span> {formatCurrency(detailsTender.budget)}</p>
            <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950"><span className="font-semibold text-slate-950 dark:text-white">Deadline:</span> {formatDate(detailsTender.deadline)}</p>
            <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950"><span className="font-semibold text-slate-950 dark:text-white">Total bids:</span> {bidCounts[detailsTender.id] ?? 0}</p>
            <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950 md:col-span-2"><span className="font-semibold text-slate-950 dark:text-white">Description:</span> {detailsTender.description}</p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(editingTender)}
        title={editingTender ? `Edit ${editingTender.title}` : "Edit tender"}
        description="Update the tender details below. Changes will be reflected immediately."
        onClose={closeEditModal}
      >
        {editingTender ? (
          <TenderForm
            allowStatusChange
            initialTender={editingTender}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
            onSubmit={handleUpdateTender}
            onCancel={closeEditModal}
          />
        ) : null}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete tender"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.title}" from your tender list? This cannot be undone.`
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
            className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            type="button"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-wait disabled:bg-rose-400"
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

export default ManageTendersPage;
