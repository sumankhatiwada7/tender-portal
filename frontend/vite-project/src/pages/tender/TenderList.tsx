import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAll } from "../../api/tender.api";
import type { Tender, TenderStatus } from "../../api/types";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { Input } from "../../components/ui/Input";

type Tab = "all" | TenderStatus;

type SortKey = "latest" | "budget" | "deadline";

export default function TenderList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<SortKey>("latest");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getAll();
        if (mounted) setTenders(data);
      } catch (err) {
        if (mounted) setError((err as Error).message || "Unable to load tenders");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => ["all", ...new Set(tenders.map((tender) => tender.category))], [tenders]);

  const filtered = useMemo(() => {
    let list = [...tenders];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }

    if (category !== "all") {
      list = list.filter((item) => item.category === category);
    }

    if (tab !== "all") {
      list = list.filter((item) => item.status === tab);
    }

    if (sort === "latest") {
      list.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
    }

    if (sort === "budget") {
      list.sort((a, b) => b.budget - a.budget);
    }

    if (sort === "deadline") {
      list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }

    return list;
  }, [tenders, query, category, tab, sort]);

  const openCount = tenders.filter((item) => item.status === "open").length;

  return (
    <main className="min-h-screen bg-bg">
      <header className="bg-green-dark px-4 py-10 text-white md:px-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-green-accent">Government procurement</p>
        <h1 className="mt-3 font-syne text-[clamp(1.7rem,2.8vw,2.5rem)] font-extrabold tracking-tight">Active Tenders</h1>
        <p className="mt-2 text-sm text-white/80">Browse {openCount} open opportunities across Nepal.</p>
      </header>

      <section className="flex flex-col gap-3 border-b border-gray-100 bg-white px-4 py-4 md:flex-row md:px-12">
        <div className="flex-1">
          <Input placeholder="Search tenders" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <select
          className="h-11 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-green-main"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All categories" : item}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-lg border-[1.5px] border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-green-main"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
        >
          <option value="latest">Latest</option>
          <option value="budget">Budget High-Low</option>
          <option value="deadline">Deadline</option>
        </select>
      </section>

      <section className="border-b border-gray-100 bg-white px-4 md:px-12">
        <div className="flex gap-6 overflow-x-auto">
          {(["all", "open", "awarded", "closed"] as Tab[]).map((status) => (
            <button
              key={status}
              onClick={() => setTab(status)}
              className={`shrink-0 border-b-2 py-3 text-sm font-medium ${tab === status ? "border-green-main text-green-main" : "border-transparent text-gray-400"}`}
            >
              {status[0].toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 py-7 md:px-12">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

        {loading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <EmptyState title="No tenders found" subtitle="Try adjusting your filters or search query." />
        ) : null}

        {!loading &&
          filtered.map((tender) => (
            <article
              key={tender.id}
              onClick={() => navigate(`/tenders/${tender.id}`)}
              className="grid cursor-pointer gap-5 rounded-xl border-[1.5px] border-gray-200 bg-white p-6 transition-colors hover:border-green-main md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <div className="flex items-center gap-3">
                  <Badge variant={tender.status}>{tender.status}</Badge>
                  <span className="text-sm text-gray-500">{tender.location}</span>
                </div>
                <h3 className="mt-3 font-syne text-lg font-bold tracking-tight text-gray-900">{tender.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{tender.category}</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{tender.location}</span>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs text-gray-400">Budget</p>
                <p className="font-syne text-xl font-extrabold text-green-dark">NPR {tender.budget.toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-500">Deadline: {new Date(tender.deadline).toLocaleDateString()}</p>
                <p className="mt-1 text-xs text-gray-500">Bids: {0}</p>
              </div>
            </article>
          ))}
      </section>
    </main>
  );
}
