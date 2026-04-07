import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBids } from "../../api/bid.api";
import type { Bid, BidStatus } from "../../api/types";
import PageHeader from "../../components/layout/PageHeader";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

type Filter = "all" | BidStatus;

export default function MyBids() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getMyBids();
        if (mounted) setBids(data);
      } catch (err) {
        if (mounted) setError((err as Error).message || "Unable to load bids");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return bids;
    return bids.filter((item) => item.status === filter);
  }, [bids, filter]);

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader eyebrow="My bids" title="Your bid history" />

      <section className="border-b border-gray-100 bg-white px-12">
        <div className="flex gap-8">
          {(["all", "pending", "accepted", "rejected"] as Filter[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`border-b-2 py-3 text-sm font-medium ${filter === item ? "border-green-main text-green-main" : "border-transparent text-gray-400"}`}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-12 py-6">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

        {loading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <EmptyState title="No bids in this tab" subtitle="Try another status filter to see your activity." />
        ) : null}

        {!loading &&
          filtered.map((bid) => {
            const edge =
              bid.status === "accepted"
                ? "border-l-4 border-green-main"
                : bid.status === "rejected"
                  ? "border-l-4 border-red-300"
                  : "border-l-4 border-amber-300";

            return (
              <article
                key={bid.id}
                className={`grid cursor-pointer grid-cols-[1.2fr_1fr_auto] items-center gap-4 rounded-xl border-[1.5px] border-gray-200 bg-white p-6 ${edge}`}
                onClick={() => navigate(`/tenders/${bid.tenderId}`)}
              >
                <div>
                  <h3 className="font-syne text-lg font-bold tracking-tight text-gray-900">Tender #{bid.tenderId.slice(0, 6)}</h3>
                  <p className="mt-1 text-sm text-gray-500">Submitted bid</p>
                </div>
                <p className="truncate text-sm text-gray-500">{bid.proposal}</p>
                <div className="text-right">
                  <p className="font-syne text-xl font-extrabold text-green-dark">NPR {Number(bid.amount).toLocaleString()}</p>
                  <div className="mt-2">
                    <Badge variant={bid.status}>{bid.status}</Badge>
                  </div>
                </div>
              </article>
            );
          })}
      </section>
    </main>
  );
}
