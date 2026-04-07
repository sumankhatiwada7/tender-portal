import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getForTender } from "../../api/bid.api";
import { getAll } from "../../api/tender.api";
import type { Bid, Tender } from "../../api/types";
import PageHeader from "../../components/layout/PageHeader";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { useAuthStore } from "../../store/auth.store";

export default function GovernmentDashboard() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const all = await getAll();
        if (!mounted) return;
        const mine = all.filter((item) => item.createdBy === user?.id);
        setTenders(mine);

        const firstOpen = mine.find((item) => item.status === "open");
        if (firstOpen) {
          const bids = await getForTender(firstOpen.id);
          if (mounted) setRecentBids(bids.slice(0, 5));
        }
      } catch (err) {
        if (mounted) setError((err as Error).message || "Unable to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const stats = useMemo(() => {
    const total = tenders.length;
    const open = tenders.filter((item) => item.status === "open").length;
    const awarded = tenders.filter((item) => item.status === "awarded").length;
    return { total, open, awarded, bids: recentBids.length };
  }, [tenders, recentBids]);

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        eyebrow="Government Dashboard"
        title={`Welcome back, ${user?.name ?? "Office"}`}
        subtitle="Manage your tenders and review incoming bids"
      />

      <section className="grid grid-cols-4 gap-4 px-12 py-6">
        {[
          ["Total Tenders", stats.total, "text-gray-900"],
          ["Open Tenders", stats.open, "text-green-main"],
          ["Awarded Tenders", stats.awarded, "text-amber-600"],
          ["Total Bids Received", stats.bids, "text-gray-900"],
        ].map((item) => (
          <article key={item[0]} className="rounded-xl border-[1.5px] border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{item[0]}</p>
            <p className={`mt-2 font-syne text-3xl font-extrabold ${item[2]}`}>{item[1]}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-[1fr_360px] gap-6 px-12 py-4">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-syne text-2xl font-extrabold tracking-tight text-gray-900">Your tenders</h2>
            <Link className="rounded-lg bg-green-main px-4 py-2 text-sm font-semibold text-white" to="/tenders/create">
              Create new tender
            </Link>
          </div>

          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}
          {loading ? <Skeleton className="h-36" /> : null}

          {!loading && tenders.length === 0 ? (
            <EmptyState title="No tenders yet" subtitle="Create your first tender to start receiving bids." />
          ) : null}

          <div className="space-y-3">
            {tenders.map((tender) => (
              <article key={tender.id} className="grid grid-cols-[1fr_auto] items-center gap-5 rounded-xl border-[1.5px] border-gray-200 bg-white p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={tender.status}>{tender.status}</Badge>
                    <span className="text-xs text-gray-500">{tender.location}</span>
                  </div>
                  <h3 className="mt-2 font-syne text-lg font-bold tracking-tight text-gray-900">{tender.title}</h3>
                </div>
                <Link to={`/tenders/${tender.id}`} className="text-sm font-semibold text-green-main">
                  View bids →
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <article className="rounded-xl border-[1.5px] border-gray-200 bg-white p-6">
            <h3 className="font-syne text-xl font-extrabold tracking-tight text-gray-900">Recent bids</h3>
            <div className="mt-4 space-y-3">
              {recentBids.length === 0 ? <p className="text-sm text-gray-500">No recent bids.</p> : null}
              {recentBids.map((bid) => (
                <div key={bid.id} className="rounded-lg bg-bg p-3 text-sm">
                  <p className="font-medium text-gray-800">{bid.businessName ?? "Business"}</p>
                  <p className="text-gray-500">NPR {Number(bid.amount).toLocaleString()}</p>
                  <div className="mt-2">
                    <Badge variant={bid.status}>{bid.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border-[1.5px] border-gray-200 bg-white p-6">
            <h3 className="font-syne text-xl font-extrabold tracking-tight text-gray-900">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <Link to="/tenders/create" className="block rounded-lg bg-green-main px-4 py-3 text-center text-sm font-semibold text-white">
                Create Tender
              </Link>
              <Link to="/tenders" className="block rounded-lg border-[1.5px] border-green-main px-4 py-3 text-center text-sm font-medium text-green-main">
                View all bids
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
