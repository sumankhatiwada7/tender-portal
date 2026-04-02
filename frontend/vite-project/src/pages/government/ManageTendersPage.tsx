import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { deleteTender, fetchTenders, updateTender } from "../../features/dashboard/dashboard.api";
import {
  CardSurface,
  DashboardIcon,
  EmptyState,
  LoadingBlock,
  Modal,
  PaginationControls,
  StatusBadge,
  TableActionButton,
} from "../../features/dashboard/components/DashboardUi";
import TenderForm from "../../features/dashboard/components/TenderForm";
import type { GovernmentOutletContext, TenderItem, TenderMutationInput, TenderStatus } from "../../features/dashboard/dashboard.types";
import {
  filterTendersForGovernment,
  formatDate,
  getApiErrorMessage,
  matchesSearch,
} from "../../features/dashboard/dashboard.utils";

const pageSize = 6;

function ManageTendersPage() {
  const { session } = useOutletContext<GovernmentOutletContext>();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | TenderStatus>("all");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTender, setEditingTender] = useState<TenderItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadOwnedTenders() {
    setLoading(true);
    setError(null);

    try {
      const allTenders = await fetchTenders();
      setTenders(filterTendersForGovernment(allTenders, session.user.id));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load your tenders."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOwnedTenders();
  }, [session.user.id]);

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const matchesStatus = statusFilter === "all" ? true : tender.status === statusFilter;
      const query = deferredSearch.trim();
      const matchesQuery =
        query.length === 0
          ? true
          : [tender.title, tender.category, tender.location, tender.description].some((value) =>
              matchesSearch(value, query),
            );

      return matchesStatus && matchesQuery;
    });
  }, [deferredSearch, statusFilter, tenders]);

  const totalPages = Math.max(1, Math.ceil(filteredTenders.length / pageSize));
  const paginatedTenders = filteredTenders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, statusFilter]);

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

    const targetTender = tenders.find((tender) => tender.id === editId) ?? null;
    setEditingTender(targetTender);
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
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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
    <div className="space-y-8">
      <CardSurface className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Control panel</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Manage tender notices</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Filter active and closed tenders, search by keyword, and edit or delete notices without leaving the dashboard.
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

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="sr-only">Search tenders</span>
            <div className="flex items-center gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3">
              <DashboardIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search title, category, location, or description"
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </label>

          <label className="block">
            <span className="sr-only">Filter by status</span>
            <div className="flex items-center gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3">
              <DashboardIcon className="h-5 w-5 text-slate-400" name="filter" />
              <select
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | TenderStatus)}
              >
                <option value="all">All tenders</option>
                <option value="open">Active</option>
                <option value="closed">Closed</option>
                <option value="awarded">Awarded</option>
              </select>
            </div>
          </label>
        </div>
      </CardSurface>

      {filteredTenders.length === 0 ? (
        <EmptyState
          title="No tenders match your filters"
          description="Try changing the search text or status filter, or create a new tender notice to get started."
          icon="folder"
          action={
            <Link
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              to="/government/create"
            >
              Create a tender
            </Link>
          }
        />
      ) : (
        <CardSurface className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <th className="px-6 py-4">Tender</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedTenders.map((tender) => (
                  <tr key={tender.id}>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">{tender.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{tender.location}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{tender.category}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{formatDate(tender.deadline)}</td>
                    <td className="px-6 py-5">
                      <StatusBadge status={tender.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        <TableActionButton
                          icon="edit"
                          label="Edit"
                          onClick={() => setSearchParams(new URLSearchParams({ edit: tender.id }), { replace: true })}
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
          <div className="px-6 pb-6">
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </CardSurface>
      )}

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

export default ManageTendersPage;
