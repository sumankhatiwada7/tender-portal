import { useEffect, useState } from "react";
import { useToast } from "../../components/ToastProvider";
import { approveUser, fetchPendingUsers, rejectUser } from "../../features/admin/admin.api";
import type { AdminUser } from "../../features/admin/admin.types";
import { CardSurface, EmptyState, LoadingBlock, Modal, TableActionButton } from "../../features/dashboard/components/DashboardUi";

function AdminApprovalsPage() {
  const { showToast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ user: AdminUser; action: "approve" | "reject" } | null>(null);

  async function loadPendingUsers() {
    setLoading(true);
    setError(null);

    try {
      const users = await fetchPendingUsers();
      setPendingUsers(users);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load pending users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPendingUsers();
  }, []);

  async function handleApprove(user: AdminUser) {
    setActionUserId(user.id);

    try {
      await approveUser(user.id);
      showToast({
        tone: "success",
        title: "User approved",
        message: `${user.name} can now access the platform.`,
      });
      await loadPendingUsers();
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
        title: "User rejected",
        message: `${user.name} has been marked as rejected.`,
      });
      await loadPendingUsers();
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

  if (loading) {
    return <LoadingBlock label="Loading pending approvals..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Approvals unavailable"
        description={error}
        icon="shield"
        action={
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
            onClick={() => void loadPendingUsers()}
          >
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <CardSurface className="overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Approvals queue</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Accept or reject pending users</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Only pending users appear in this list.</p>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No pending users"
              description="All users are already reviewed."
              icon="check"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Verification docs</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pendingUsers.map((user) => {
                  const isBusy = actionUserId === user.id;

                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-5 font-semibold text-slate-900">{user.name}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-5 text-sm capitalize text-slate-700">{user.role}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {user.verificationDocs.length === 0 ? (
                          <span className="text-slate-400">No documents</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {user.verificationDocs.map((document) => (
                              <a
                                className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
                                href={document.url}
                                key={`${user.id}-${document.url}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {document.originalname}
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <TableActionButton
                            label="Approve"
                            icon="check"
                            tone="emerald"
                            onClick={() => setPendingAction({ user, action: "approve" })}
                            disabled={isBusy}
                          />
                          <TableActionButton
                            label="Reject"
                            icon="x"
                            tone="rose"
                            onClick={() => setPendingAction({ user, action: "reject" })}
                            disabled={isBusy}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardSurface>

      <Modal
        open={Boolean(pendingAction)}
        title={pendingAction?.action === "approve" ? "Approve user" : "Reject user"}
        description={
          pendingAction
            ? `${pendingAction.action === "approve" ? "Approve" : "Reject"} ${pendingAction.user.name} (${pendingAction.user.email})?`
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
            {pendingAction?.action === "approve" ? "Confirm approval" : "Confirm rejection"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminApprovalsPage;
