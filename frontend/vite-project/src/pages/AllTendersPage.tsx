import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchPublicTenders, sortOpenFirst } from "../features/tenders/publicTenders.api";
import type { TenderItem, TenderStatus } from "../features/dashboard/dashboard.types";
import { formatCurrency, formatDate, matchesSearch } from "../features/dashboard/dashboard.utils";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

type StatusFilter = "all" | TenderStatus;

const pageSize = 9;

function getStatusTone(status: TenderStatus) {
  if (status === "open") {
    return "bg-green-light text-green-main border-green-main/30";
  }

  if (status === "awarded") {
    return "bg-amber-50 text-amber-700 border-amber-300";
  }

  return "bg-slate-100 text-slate-700 border-slate-300";
}

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
    <>
      <Navbar />
      <main className="min-h-screen bg-bg px-4 py-10 text-text sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="rounded-lg border-[1.5px] border-border bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-main">TENDER MARKETPLACE</p>
              <h1 className="font-syne mt-2 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">All Tender Opportunities</h1>
              <p className="mt-3 text-base leading-7 text-muted">
                Explore all published tenders and narrow results by keyword, status, category, and location.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-green-main px-5 py-3 text-sm font-semibold text-green-main transition-colors duration-150 hover:bg-green-light"
              to="/"
            >
              Back to landing
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">Search</span>
              <input
                className="w-full rounded-lg border-[1.5px] border-border bg-white px-4 py-3 text-sm text-text outline-none focus:border-green-main focus:ring-2 focus:ring-green-main"
                type="text"
                placeholder="Search title, description, category"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">Status</span>
              <select
                className="w-full rounded-lg border-[1.5px] border-border bg-white px-4 py-3 text-sm text-text outline-none focus:border-green-main focus:ring-2 focus:ring-green-main"
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
              <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">Category</span>
              <select
                className="w-full rounded-lg border-[1.5px] border-border bg-white px-4 py-3 text-sm text-text outline-none focus:border-green-main focus:ring-2 focus:ring-green-main"
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
              <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">Location</span>
              <select
                className="w-full rounded-lg border-[1.5px] border-border bg-white px-4 py-3 text-sm text-text outline-none focus:border-green-main focus:ring-2 focus:ring-green-main"
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
          <section className="rounded-lg border-[1.5px] border-border bg-white p-8 text-center text-muted">Loading tenders...</section>
        ) : error ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-lg font-semibold text-rose-700">Unable to load tenders</p>
            <p className="mt-2 text-sm text-rose-600">{error}</p>
          </section>
        ) : filteredTenders.length === 0 ? (
          <section className="rounded-lg border-[1.5px] border-border bg-white p-8 text-center text-muted">
            No tenders match your current filters.
          </section>
        ) : (
          <>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {paginatedTenders.map((tender) => (
                <article key={tender.id} className="h-full rounded-lg border-[1.5px] border-border bg-white p-6 transition-colors duration-150 hover:border-green-main">
                  <div className="flex items-center justify-between gap-4">
                    <span className={["inline-flex rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-widest", getStatusTone(tender.status)].join(" ")}>
                      {tender.status}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted">{tender.category}</span>
                  </div>

                  <h2 className="font-syne mt-4 text-2xl font-extrabold tracking-tight text-text">{tender.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted line-clamp-3">{tender.description}</p>

                  <div className="mt-5 grid gap-3 rounded-lg bg-green-light/40 p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted">Budget</span>
                      <span className="font-semibold text-text">{formatCurrency(tender.budget)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted">Deadline</span>
                      <span className="font-semibold text-text">{formatDate(tender.deadline)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted">Location</span>
                      <span className="font-semibold text-text">{tender.location}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Link
                      className="inline-flex items-center justify-center rounded-lg border border-green-main bg-green-main px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-green-dark"
                      to={`/tenders/${tender.id}`}
                    >
                      Details
                    </Link>
                  </div>
                </article>
              ))}
            </section>

            <div className="flex items-center justify-between rounded-lg border-[1.5px] border-border bg-white px-4 py-3 sm:px-5">
              <p className="text-sm text-muted">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredTenders.length)} of {filteredTenders.length} tenders
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                >
                  Previous
                </button>
                <button
                  className="rounded-lg border border-green-main bg-green-main px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-green-main/40"
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
      <Footer />
    </>
  );
}

export default AllTendersPage;
