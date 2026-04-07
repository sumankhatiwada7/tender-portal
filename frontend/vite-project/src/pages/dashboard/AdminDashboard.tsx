import { useEffect, useMemo, useState } from "react";
import { approveUser, getAllUsers, getPendingUsers, rejectUser } from "../../api/admin.api";
import { getAll } from "../../api/tender.api";
import type { ApiUser, Tender } from "../../api/types";
import PageHeader from "../../components/layout/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingUsers, setPendingUsers] = useState<ApiUser[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [pending, allUsers, allTenders] = await Promise.all([getPendingUsers(), getAllUsers(), getAll()]);
        if (!mounted) return;
        setPendingUsers(pending);
        setUsers(allUsers);
        setTenders(allTenders);
      } catch (err) {
        if (mounted) setError((err as Error).message || "Unable to load admin data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q));
  }, [users, search]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessing(id + action);
    try {
      if (action === "approve") await approveUser(id);
      else await rejectUser(id);
      setPendingUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      setError((err as Error).message || "Action failed");
    } finally {
      setProcessing("");
    }
  }

  const totalBids = 0;

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        eyebrow="Admin Panel"
        title="Platform Overview"
        subtitle="Review registrations and monitor platform activity"
      />

      <section className="grid grid-cols-4 gap-4 px-12 py-6">
        {[
          ["Total Users", users.length, "text-gray-900"],
          ["Pending Approvals", pendingUsers.length, "text-amber-600"],
          ["Total Tenders", tenders.length, "text-green-main"],
          ["Total Bids", totalBids, "text-gray-900"],
        ].map((item) => (
          <article key={item[0]} className="rounded-xl border-[1.5px] border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{item[0]}</p>
            <p className={`mt-2 font-syne text-3xl font-extrabold ${item[2]}`}>{item[1]}</p>
          </article>
        ))}
      </section>

      <section className="px-12 py-4" id="pending-list">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-syne text-2xl font-extrabold tracking-tight text-gray-900">Pending registrations</h2>
          <span className="rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-green-main">{pendingUsers.length}</span>
        </div>

        {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

        {loading ? <Skeleton className="h-40" /> : null}

        {!loading && pendingUsers.length === 0 ? (
          <EmptyState title="All registrations reviewed" subtitle="No pending user approvals right now." icon={<span className="text-2xl">✓</span>} />
        ) : null}

        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <article key={user.id} className="rounded-xl border-[1.5px] border-gray-200 bg-white p-6 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light font-semibold text-green-main">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Badge variant="pending">{Array.isArray(user.role) ? user.role[0] : user.role}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                {Array.isArray(user.role) ? user.role[0] === "business" : user.role === "business" ? (
                  <>
                    <p>Registration No.: {user.businessInfo?.registrationNumber ?? "-"}</p>
                    <p>PAN No.: {user.businessInfo?.panNumber ?? "-"}</p>
                  </>
                ) : (
                  <>
                    <p>Office Address: {user.governmentInfo?.officeAddress ?? "-"}</p>
                    <p>Representative: {user.governmentInfo?.representative ?? "-"}</p>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(user.verificationDocs ?? []).map((doc) => (
                  <a
                    key={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    href={doc.url}
                    className="rounded-full bg-bg px-3 py-1 text-xs text-gray-600"
                  >
                    {doc.originalname} · View
                  </a>
                ))}
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <Button
                  variant="danger"
                  className="px-4 py-2"
                  disabled={processing === user.id + "reject"}
                  onClick={() => handleAction(user.id, "reject")}
                >
                  {processing === user.id + "reject" ? "..." : "Reject"}
                </Button>
                <Button className="px-4 py-2" disabled={processing === user.id + "approve"} onClick={() => handleAction(user.id, "approve")}>
                  {processing === user.id + "approve" ? "..." : "Approve"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-12 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-syne text-2xl font-extrabold tracking-tight text-gray-900">All users</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border-[1.5px] border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-green-main"
            placeholder="Search users"
          />
        </div>

        <div className="overflow-hidden rounded-xl border-[1.5px] border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-bg">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const role = Array.isArray(user.role) ? user.role[0] : user.role;
                const status = user.status as "pending" | "approved" | "rejected";
                return (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">{role}</td>
                    <td className="px-4 py-3">
                      <Badge variant={status}>{status}</Badge>
                    </td>
                    <td className="px-4 py-3">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3">
                      {(user.verificationDocs ?? [])[0]?.url ? (
                        <a className="text-green-main" href={user.verificationDocs?.[0].url} target="_blank" rel="noreferrer">
                          View documents
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
