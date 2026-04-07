import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBids } from "../../api/bid.api";
import { getAll } from "../../api/tender.api";
import type { Bid, Tender } from "../../api/types";
import PageHeader from "../../components/layout/PageHeader";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { useAuthStore } from "../../store/auth.store";

export default function BusinessDashboard() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [opportunities, setOpportunities] = useState<Tender[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [myBids, allTenders] = await Promise.all([getMyBids(), getAll()]);
        if (!mounted) return;
        setBids(myBids);
        setOpportunities(allTenders.filter((item) => item.status === "open").slice(0, 3));
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
  }, []);

  const stats = useMemo(() => {
    return {
      total: bids.length,
      pending: bids.filter((item) => item.status === "pending").length,
      accepted: bids.filter((item) => item.status === "accepted").length,
      rejected: bids.filter((item) => item.status === "rejected").length,
    };
  }, [bids]);

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        eyebrow="Business Dashboard"
        title={`Welcome back, ${user?.name ?? "Business"}`}
        subtitle="Track your bids and find new opportunities"
      />

      <section className="grid grid-cols-4 gap-4 px-12 py-6">
        {[
          ["Total Bids Submitted", stats.total, "text-gray-900"],
          ["Pending Bids", stats.pending, "text-amber-600"],
          ["Accepted Bids", stats.accepted, "text-green-main"],
          ["Rejected Bids", stats.rejected, "text-red-500"],
        ].map((item) => (
          <article key={item[0]} className="rounded-xl border-[1.5px] border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{item[0]}</p>
            <p className={`mt-2 font-syne text-3xl font-extrabold ${item[2]}`}>{item[1]}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-[1fr_340px] gap-6 px-12 py-4">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-syne text-2xl font-extrabold tracking-tight text-gray-900">My bids</h2>
            <Link to="/my-bids" className="text-sm font-semibold text-green-main">View all</Link>
          </div>

          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}
          {loading ? <Skeleton className="h-36" /> : null}

          {!loading && bids.length === 0 ? (
            <EmptyState title="No bids yet" subtitle="Browse tenders to submit your first bid." />
          ) : null}

          <div className="space-y-3">
            {bids.slice(0, 5).map((bid) => (
              <Link key={bid.id} to={`/tenders/${bid.tenderId}`} className="block rounded-xl border-[1.5px] border-gray-200 bg-white p-5">
                <h3 className="font-syne text-lg font-bold tracking-tight text-gray-900">Tender #{bid.tenderId.slice(0, 6)}</h3>
                <p className="mt-1 text-sm text-gray-500">NPR {Number(bid.amount).toLocaleString()}</p>
                <div className="mt-2">
                  <Badge variant={bid.status}>{bid.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <article className="h-fit rounded-xl border-[1.5px] border-gray-200 bg-white p-6">
          <h3 className="font-syne text-xl font-extrabold tracking-tight text-gray-900">New opportunities</h3>
          <div className="mt-4 space-y-3">
            {opportunities.map((tender) => (
              <div key={tender.id} className="rounded-lg bg-bg p-3">
                <p className="font-medium text-gray-800">{tender.title}</p>
                <p className="text-sm text-gray-500">Budget: NPR {tender.budget.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Deadline: {new Date(tender.deadline).toLocaleDateString()}</p>
                <Link to={`/tenders/${tender.id}`} className="mt-2 inline-block text-sm font-semibold text-green-main">
                  View tender →
                </Link>
              </div>
            ))}
          </div>
          <Link to="/tenders" className="mt-4 block rounded-lg border-[1.5px] border-green-main px-4 py-3 text-center text-sm font-medium text-green-main">
            Browse all tenders →
          </Link>
        </article>
      </section>
    </main>
  );
}
