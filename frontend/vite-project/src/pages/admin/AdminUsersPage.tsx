import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useToast } from "../../components/ToastProvider";
import { approveUser, createManagedUser, fetchAllUsers, rejectUser } from "../../features/admin/admin.api";
import type { AdminCreateUserPayload, AdminFieldErrors, AdminUser, AdminUserRole, AdminUserStatus } from "../../features/admin/admin.types";
import {
  CardSurface,
  EmptyState,
  LoadingBlock,
  Modal,
  PaginationControls,
  TableActionButton,
} from "../../features/dashboard/components/DashboardUi";
import { matchesSearch } from "../../features/dashboard/dashboard.utils";

function AdminUsersPage() {
  const { showToast } = useToast();
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUserStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<{ user: AdminUser; action: "approve" | "reject" } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<AdminCreateUserPayload>({
    name: "",
    email: "",
    password: "",
    role: "business",
  });
  const [createFormErrors, setCreateFormErrors] = useState<AdminFieldErrors>({});

  const pageSize = 10;

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      const users = await fetchAllUsers();
      setAllUsers(users);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleApprove(user: AdminUser) {
    setActionUserId(user.id);

    try {
      await approveUser(user.id);
      showToast({
        tone: "success",
        title: "Status updated",
        message: `${user.name} is now accepted.`,
      });
      await loadUsers();
    } catch (approveError) {
      showToast({
        tone: "error",
        title: "Approve failed",
        message: approveError instanceof Error ? approveError.message : "Unable to approve this user.",
      });
    } finally {
      setActionUserId(null);
    }
  }

  async function handleReject(user: AdminUser) {
    setActionUserId(user.id);

    try {
      await rejectUser(user.id);
      showToast({
        tone: "success",
        title: "Status updated",
        message: `${user.name} is now rejected.`,
      });
      await loadUsers();
    } catch (rejectError) {
      showToast({
        tone: "error",
        title: "Reject failed",
        message: rejectError instanceof Error ? rejectError.message : "Unable to reject this user.",
      });
    } finally {
      setActionUserId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const textMatch =
        searchQuery.trim().length === 0 ||
        matchesSearch(user.name, searchQuery) ||
        matchesSearch(user.email, searchQuery);
      const roleMatch = roleFilter === "all" || user.role === roleFilter;
      const statusMatch = statusFilter === "all" || user.status === statusFilter;

      return textMatch && roleMatch && statusMatch;
    });
  }, [allUsers, roleFilter, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [currentPage, filteredUsers]);

  async function handleConfirmAction() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.action === "approve") {
      await handleApprove(pendingAction.user);
    } else {
      await handleReject(pendingAction.user);
    }

    setPendingAction(null);
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateFormErrors({});

    const payload: AdminCreateUserPayload = {
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      role: createForm.role,
    };

    if (!payload.name || !payload.email || !payload.password) {
      setCreateFormErrors({
        name: payload.name ? undefined : "Name is required",
        email: payload.email ? undefined : "Email is required",
        password: payload.password ? undefined : "Password is required",
      });
      showToast({
        tone: "error",
        title: "Missing details",
        message: "Name, email, and password are required.",
      });
      return;
    }

    setIsCreating(true);
    try {
      const createdUser = await createManagedUser(payload);
      showToast({
        tone: "success",
        title: "Account created",
        message: `${createdUser.name} (${createdUser.role}) is ready to use.`,
      });
      setCreateForm({ name: "", email: "", password: "", role: "business" });
      setCreateFormErrors({});
      await loadUsers();
    } catch (createError) {
      const errorWithFields = createError as Error & { fieldErrors?: AdminFieldErrors };
      if (errorWithFields.fieldErrors) {
        setCreateFormErrors(errorWithFields.fieldErrors);
      }
      showToast({
        tone: "error",
        title: "Create failed",
        message: createError instanceof Error ? createError.message : "Unable to create this account.",
      });
    } finally {
      setIsCreating(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading users..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="User directory unavailable"
        description={error}
        icon="user"
        action={
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
            onClick={() => void loadUsers()}
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
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Create account</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Add a business or government user</h2>
          <p className="mt-2 text-sm text-slate-500">New accounts created here are accepted immediately.</p>
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void handleCreateUser(event)}>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Name</span>
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400"
              type="text"
              value={createForm.name}
              onChange={(event) => {
                const nextValue = event.target.value;
                setCreateForm((current) => ({ ...current, name: nextValue }));
                if (createFormErrors.name) {
                  setCreateFormErrors((current) => ({ ...current, name: undefined }));
                }
              }}
              placeholder="Organization name"
              required
            />
            {createFormErrors.name ? <span className="text-xs text-rose-600">{createFormErrors.name}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Email</span>
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400"
              type="email"
              value={createForm.email}
              onChange={(event) => {
                const nextValue = event.target.value;
                setCreateForm((current) => ({ ...current, email: nextValue }));
                if (createFormErrors.email) {
                  setCreateFormErrors((current) => ({ ...current, email: undefined }));
                }
              }}
              placeholder="contact@organization.com"
              required
            />
            {createFormErrors.email ? <span className="text-xs text-rose-600">{createFormErrors.email}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Password</span>
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400"
              type="password"
              value={createForm.password}
              onChange={(event) => {
                const nextValue = event.target.value;
                setCreateForm((current) => ({ ...current, password: nextValue }));
                if (createFormErrors.password) {
                  setCreateFormErrors((current) => ({ ...current, password: undefined }));
                }
              }}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
            {createFormErrors.password ? <span className="text-xs text-rose-600">{createFormErrors.password}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Role</span>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400"
              value={createForm.role}
              onChange={(event) => {
                const nextValue = event.target.value as "business" | "government";
                setCreateForm((current) => ({ ...current, role: nextValue }));
                if (createFormErrors.role) {
                  setCreateFormErrors((current) => ({ ...current, role: undefined }));
                }
              }}
            >
              <option value="business">Business</option>
              <option value="government">Government</option>
            </select>
            {createFormErrors.role ? <span className="text-xs text-rose-600">{createFormErrors.role}</span> : null}
          </label>

          <div className="md:col-span-2">
            <button
              className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
      </CardSurface>

      <CardSurface className="p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[220px] flex-1 flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Search users</span>
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400"
              type="text"
              value={searchQuery}
              placeholder="Search by name or email"
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <label className="flex min-w-[170px] flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Role</span>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as "all" | AdminUserRole)}
            >
              <option value="all">All roles</option>
              <option value="government">Government</option>
              <option value="business">Business</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="flex min-w-[170px] flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Status</span>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | AdminUserStatus)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>
      </CardSurface>

      <CardSurface className="overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">User directory</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">All users and account status</h2>
          <p className="mt-2 text-sm text-slate-500">Showing {paginatedUsers.length} of {filteredUsers.length} matching users.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedUsers.map((user) => {
                const isBusy = actionUserId === user.id;
                const canChange = user.role !== "admin";

                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-slate-700">{user.role}</td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
                          user.status === "accepted" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "",
                          user.status === "rejected" ? "bg-rose-50 text-rose-700 ring-rose-200" : "",
                          user.status === "pending" ? "bg-amber-50 text-amber-700 ring-amber-200" : "",
                        ].join(" ")}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!canChange ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Protected</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user.status !== "accepted" ? (
                            <TableActionButton
                              label="Set accepted"
                              icon="check"
                              tone="emerald"
                              onClick={() => setPendingAction({ user, action: "approve" })}
                              disabled={isBusy}
                            />
                          ) : null}
                          {user.status !== "rejected" ? (
                            <TableActionButton
                              label="Set rejected"
                              icon="x"
                              tone="rose"
                              onClick={() => setPendingAction({ user, action: "reject" })}
                              disabled={isBusy}
                            />
                          ) : null}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 pb-6">
          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </CardSurface>

      <Modal
        open={Boolean(pendingAction)}
        title={pendingAction?.action === "approve" ? "Set status to accepted" : "Set status to rejected"}
        description={
          pendingAction
            ? `Change ${pendingAction.user.name} (${pendingAction.user.email}) to ${pendingAction.action === "approve" ? "accepted" : "rejected"}?`
            : undefined
        }
        onClose={() => {
          if (!actionUserId) {
            setPendingAction(null);
          }
        }}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            type="button"
            onClick={() => setPendingAction(null)}
            disabled={Boolean(actionUserId)}
          >
            Cancel
          </button>
          <button
            className={[
              "rounded-full px-5 py-3 text-sm font-semibold text-white transition",
              pendingAction?.action === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500",
            ].join(" ")}
            type="button"
            onClick={() => void handleConfirmAction()}
            disabled={Boolean(actionUserId)}
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminUsersPage;
