import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../components/ToastProvider";
import { approveUser, fetchAllUsers, rejectUser } from "../../features/admin/admin.api";
import type { AdminUser, AdminUserStatus } from "../../features/admin/admin.types";
import {
  AdminCard,
  EmptyPanel,
  FilterSelect,
  SearchInput,
  SectionHeader,
  StatusPill,
  TableSkeleton,
} from "../../features/admin/components/AdminUi";
import { Modal, TableActionButton } from "../../features/dashboard/components/DashboardUi";
import { matchesSearch } from "../../features/dashboard/dashboard.utils";

function AdminApprovalsPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUserStatus>("pending");
  const [roleFilter, setRoleFilter] = useState<"all" | "business" | "government">("all");
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      setUsers((await fetchAllUsers()).filter((user) => user.role !== "admin"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load approvals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        searchQuery.trim().length === 0 ||
        matchesSearch(user.name, searchQuery) ||
        matchesSearch(user.email, searchQuery);
      const statusMatch = statusFilter === "all" || user.status === statusFilter;
      const roleMatch = roleFilter === "all" || user.role === roleFilter;

      return searchMatch && statusMatch && roleMatch;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  async function handleStatus(user: AdminUser, action: "approve" | "reject") {
    setActionUserId(user.id);

    try {
      if (action === "approve") {
        await approveUser(user.id);
      } else {
        await rejectUser(user.id);
      }

      showToast({
        tone: "success",
        title: action === "approve" ? "Company approved" : "Company rejected",
        message: `${user.name} has been ${action === "approve" ? "approved" : "rejected"}.`,
      });
      await loadUsers();
    } catch (statusError) {
      showToast({
        tone: "error",
        title: "Status update failed",
        message: statusError instanceof Error ? statusError.message : "Unable to update this company.",
      });
    } finally {
      setActionUserId(null);
    }
  }

  if (loading) {
    return <TableSkeleton columns={6} rows={8} />;
  }

  if (error) {
    return <EmptyPanel title="Approvals unavailable" description={error} />;
  }

  return (
    <div className="space-y-6">
      <AdminCard className="p-5">
        <SectionHeader
          eyebrow="Approvals"
          title="Company approval queue"
          description="Review business and government company profiles before they gain platform access."
        />
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search companies" />
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
              { label: "All statuses", value: "all" },
            ]}
          />
          <FilterSelect
            label="Company type"
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { label: "All types", value: "all" },
              { label: "Business", value: "business" },
              { label: "Government", value: "government" },
            ]}
          />
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden">
        {visibleUsers.length === 0 ? (
          <div className="p-5">
            <EmptyPanel title="No approvals found" description="Try another status, company type, or search term." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Documents</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleUsers.map((user) => {
                  const isBusy = actionUserId === user.id;

                  return (
                    <tr className="transition hover:bg-slate-50" key={user.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{user.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-5 py-4 capitalize text-slate-600">{user.role}</td>
                      <td className="px-5 py-4 text-slate-600">{user.verificationDocs.length} file(s)</td>
                      <td className="px-5 py-4">
                        <StatusPill status={user.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <TableActionButton icon="eye" label="Details" onClick={() => setDetailsUser(user)} />
                          {user.status !== "approved" ? (
                            <TableActionButton icon="check" label="Approve" tone="emerald" disabled={isBusy} onClick={() => void handleStatus(user, "approve")} />
                          ) : null}
                          {user.status !== "rejected" ? (
                            <TableActionButton icon="x" label="Reject" tone="rose" disabled={isBusy} onClick={() => void handleStatus(user, "reject")} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <Modal
        open={Boolean(detailsUser)}
        title={detailsUser ? detailsUser.name : "Company details"}
        description={detailsUser ? `${detailsUser.email} · ${detailsUser.role}` : undefined}
        onClose={() => setDetailsUser(null)}
      >
        {detailsUser ? (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-900">Status:</span> {detailsUser.status}</p>
              <p><span className="font-semibold text-slate-900">Type:</span> {detailsUser.role}</p>
              {detailsUser.role === "business" ? (
                <>
                  <p><span className="font-semibold text-slate-900">Registration:</span> {detailsUser.businessInfo?.registrationNumber || "N/A"}</p>
                  <p><span className="font-semibold text-slate-900">PAN/VAT:</span> {detailsUser.businessInfo?.panNumber || "N/A"}</p>
                </>
              ) : null}
              {detailsUser.role === "government" ? (
                <>
                  <p><span className="font-semibold text-slate-900">Office:</span> {detailsUser.governmentInfo?.officeAddress || "N/A"}</p>
                  <p><span className="font-semibold text-slate-900">Representative:</span> {detailsUser.governmentInfo?.representative || "N/A"}</p>
                </>
              ) : null}
            </div>

            <div>
              <p className="font-semibold text-slate-950">Verification documents</p>
              {detailsUser.verificationDocs.length === 0 ? (
                <p className="mt-2 text-slate-500">No documents uploaded.</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {detailsUser.verificationDocs.map((document) => (
                    <a
                      className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                      href={document.url}
                      key={document.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {document.originalname}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default AdminApprovalsPage;
