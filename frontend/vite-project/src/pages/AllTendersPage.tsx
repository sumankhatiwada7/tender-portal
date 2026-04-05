import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchPublicTenders, sortOpenFirst } from "../features/tenders/publicTenders.api";
import type { TenderItem, TenderStatus } from "../features/dashboard/dashboard.types";
import { formatCurrency, formatDate, getTenderStatusTone, matchesSearch } from "../features/dashboard/dashboard.utils";

type StatusFilter = "all" | TenderStatus;

const pageSize = 9;

function AllTendersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenders, setTenders] = useState<TenderItem[]>([]);

  const initialSearch = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>((searchParams.get("status") as StatusFilter) || "all");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") ?? "all");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") ?? "all");
  const [currentPage, setCurrentPage] = useState(1);

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    async function loadTenders() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicTenders();
        setTenders(sortOpenFirst(data));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load tenders.");
      } finally {
        setLoading(false);
      }
    }

    void loadTenders();
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();

    if (search.trim()) next.set("q", search.trim());
    if (statusFilter !== "all") next.set("status", statusFilter);
    if (categoryFilter !== "all") next.set("category", categoryFilter);
    if (locationFilter !== "all") next.set("location", locationFilter);

    setSearchParams(next, { replace: true });
  }, [search, statusFilter, categoryFilter, locationFilter, setSearchParams]);

  const categories = useMemo(() => {
    return Array.from(new Set(tenders.map((tender) => tender.category).filter(Boolean))).sort();
  }, [tenders]);

  const locations = useMemo(() => {
    return Array.from(new Set(tenders.map((tender) => tender.location).filter(Boolean))).sort();
  }, [tenders]);

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const matchesQuery =
        deferredSearch.trim().length === 0
          ? true
          : [tender.title, tender.description, tender.category, tender.location].some((value) =>
              matchesSearch(value, deferredSearch),
            );
      const matchesStatus = statusFilter === "all" ? true : tender.status === statusFilter;
      const matchesCategory = categoryFilter === "all" ? true : tender.category === categoryFilter;
      const matchesLocation = locationFilter === "all" ? true : tender.location === locationFilter;

      return matchesQuery && matchesStatus && matchesCategory && matchesLocation;
    });
  }, [categoryFilter, deferredSearch, locationFilter, statusFilter, tenders]);

  const totalPages = Math.max(1, Math.ceil(filteredTenders.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, statusFilter, categoryFilter, locationFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTenders = filteredTenders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6fbff_0%,#eef4ff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-4xl border border-slate-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Tender marketplace</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">All tender opportunities</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Explore all published tenders and narrow results by keyword, status, category, and location.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
              to="/"
            >
              Back to landing
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300"
                type="text"
                placeholder="Search title, description, category"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="awarded">Awarded</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Category</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Location</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300"
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
              >
                <option value="all">All locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {loading ? (
          <section className="rounded-4xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading tenders...</section>
        ) : error ? (
          <section className="rounded-4xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-lg font-semibold text-rose-700">Unable to load tenders</p>
            <p className="mt-2 text-sm text-rose-600">{error}</p>
          </section>
        ) : filteredTenders.length === 0 ? (
          <section className="rounded-4xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            No tenders match your current filters.
          </section>
        ) : (
          <>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paginatedTenders.map((tender) => (
                <article key={tender.id} className="h-full rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className={["inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ring-1", getTenderStatusTone(tender.status)].join(" ")}>
                      {tender.status}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{tender.category}</span>
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-slate-950">{tender.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600 line-clamp-3">{tender.description}</p>

                  <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Budget</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(tender.budget)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Deadline</span>
                      <span className="font-semibold text-slate-900">{formatDate(tender.deadline)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Location</span>
                      <span className="font-semibold text-slate-900">{tender.location}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Link
                      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      to={`/tenders/${tender.id}`}
                    >
                      Details
                    </Link>
                  </div>
                </article>
              ))}
            </section>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5">
              <p className="text-sm text-slate-600">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredTenders.length)} of {filteredTenders.length} tenders
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                >
                  Previous
                </button>
                <button
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default AllTendersPage;
