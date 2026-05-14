import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../components/ToastProvider";
import { approveUser, fetchAllUsers, rejectUser } from "../../features/admin/admin.api";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "../../features/admin/admin.types";
import {
  AdminCard,
  EmptyPanel,
  FilterSelect,
  SearchInput,
  SectionHeader,
  StatusPill,
  TableSkeleton,
} from "../../features/admin/components/AdminUi";
import { Modal, PaginationControls, TableActionButton } from "../../features/dashboard/components/DashboardUi";
import { matchesSearch } from "../../features/dashboard/dashboard.utils";

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUserStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);
  const pageSize = 9;

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      setUsers(await fetchAllUsers());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchQuery, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        searchQuery.trim().length === 0 ||
        matchesSearch(user.name, searchQuery) ||
        matchesSearch(user.email, searchQuery);
      const roleMatch = roleFilter === "all" || user.role === roleFilter;
      const statusMatch = statusFilter === "all" || user.status === statusFilter;

      return searchMatch && roleMatch && statusMatch;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function handleAccountState(user: AdminUser, action: "activate" | "deactivate") {
    setActionUserId(user.id);

    try {
      if (action === "activate") {
        await approveUser(user.id);
      } else {
        await rejectUser(user.id);
      }

      showToast({
        tone: "success",
        title: action === "activate" ? "User activated" : "User deactivated",
        message: `${user.name} is now ${action === "activate" ? "approved" : "rejected"}.`,
      });
      await loadUsers();
    } catch (actionError) {
      showToast({
        tone: "error",
        title: "Update failed",
        message: actionError instanceof Error ? actionError.message : "Unable to update this user.",
      });
    } finally {
      setActionUserId(null);
    }
  }

  if (loading) {
    return <TableSkeleton columns={6} rows={9} />;
  }

  if (error) {
    return <EmptyPanel title="User management unavailable" description={error} />;
  }

  return (
    <div className="space-y-6">
      <AdminCard className="p-5">
        <SectionHeader
          eyebrow="Users"
          title="User management"
          description="Search, filter, review, and manage platform access for every user account."
        />
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search users" />
          <FilterSelect
            label="Company type"
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { label: "All types", value: "all" },
              { label: "Business", value: "business" },
              { label: "Government", value: "government" },
              { label: "Admin", value: "admin" },
            ]}
          />
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All statuses", value: "all" },
              { label: "Approved", value: "approved" },
              { label: "Pending", value: "pending" },
              { label: "Rejected", value: "rejected" },
            ]}
          />
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-5">
            <EmptyPanel title="No users found" description="Try changing the search or filters." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3">Documents</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((user) => {
                    const isBusy = actionUserId === user.id;
                    const protectedUser = user.role === "admin";

                    return (
                      <tr className="transition hover:bg-slate-50" key={user.id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-950">{user.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-5 py-4 capitalize text-slate-600">{user.role}</td>
                        <td className="px-5 py-4">
                          <StatusPill status={user.status} />
                        </td>
                        <td className="px-5 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-4 text-slate-600">{user.verificationDocs.length}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <TableActionButton icon="eye" label="Details" onClick={() => setDetailsUser(user)} />
                            {!protectedUser && user.status !== "approved" ? (
                              <TableActionButton
                                icon="check"
                                label="Activate"
                                tone="emerald"
                                disabled={isBusy}
                                onClick={() => void handleAccountState(user, "activate")}
                              />
                            ) : null}
                            {!protectedUser && user.status === "approved" ? (
                              <TableActionButton
                                icon="x"
                                label="Deactivate"
                                tone="rose"
                                disabled={isBusy}
                                onClick={() => void handleAccountState(user, "deactivate")}
                              />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-5">
              <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </AdminCard>

      <Modal
        open={Boolean(detailsUser)}
        title={detailsUser ? detailsUser.name : "User details"}
        description={detailsUser ? `${detailsUser.email} · ${detailsUser.role}` : undefined}
        onClose={() => setDetailsUser(null)}
      >
        {detailsUser ? (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-900">Status:</span> {detailsUser.status}</p>
              <p><span className="font-semibold text-slate-900">Joined:</span> {formatDate(detailsUser.createdAt)}</p>
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
                <p className="mt-2 text-slate-500">No verification documents uploaded.</p>
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

export default AdminUsersPage;
