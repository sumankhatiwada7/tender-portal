import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../features/auth/auth.config";

type TenderStatus = "open" | "awarded" | "closed";

type TenderApiItem = {
  _id?: string;
  id?: string;
  title?: string;
  budget?: number;
  deadline?: string;
  status?: TenderStatus;
  bidCount?: number;
  category?: string;
  createdBy?: { name?: string } | string;
};

type TenderResponse = {
  success?: boolean;
  tenders?: TenderApiItem[];
};

const OPEN_TENDERS_ENDPOINT = `${API_BASE_URL}/api/v1/tender?status=open&limit=5`;

function formatBudget(value: number) {
  if (value >= 10000000) {
    return `NPR ${(value / 10000000).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `NPR ${Math.round(value / 100000)}L`;
  }

  return `NPR ${value.toLocaleString("en-US")}`;
}

function formatDeadline(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function PublicTenders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenders, setTenders] = useState<TenderApiItem[]>([]);

  useEffect(() => {
    async function loadTenders() {
      setLoading(true);
      try {
        const response = await axios.get<TenderResponse>(OPEN_TENDERS_ENDPOINT);
        setTenders((response.data.tenders ?? []).slice(0, 5));
      } catch {
        setTenders([]);
      } finally {
        setLoading(false);
      }
    }

    void loadTenders();
  }, []);

  const rows = useMemo(() => {
    const base = tenders.map((item) => {
      const officeName = typeof item.createdBy === "string" ? item.createdBy : item.createdBy?.name;

      return {
        id: item._id ?? item.id ?? `${item.title}-${item.deadline}`,
        title: item.title ?? "Untitled tender",
        budget: typeof item.budget === "number" ? item.budget : 0,
        deadline: item.deadline ?? "",
        status: item.status ?? "open",
        bidCount: typeof item.bidCount === "number" ? item.bidCount : 0,
        office: officeName ?? "Government Office",
        category: item.category ?? "General Procurement",
      };
    });

    return base.slice(0, 5);
  }, [tenders]);

  return (
    <section className="bg-bg py-20" id="tenders">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-green-main">PUBLIC TENDERS</p>
            <h2 className="font-syne mt-3 text-4xl font-extrabold tracking-tight text-text">Live opportunities for verified businesses</h2>
          </div>
          <button className="text-sm font-semibold text-green-main hover:underline" type="button" onClick={() => navigate("/tenders")}>
            View all &rarr;
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div className="animate-pulse rounded-lg border-[1.5px] border-border bg-white p-5" key={index}>
                  <div className="h-4 w-1/4 rounded bg-green-light" />
                  <div className="mt-3 h-5 w-2/3 rounded bg-green-light" />
                  <div className="mt-3 h-4 w-full rounded bg-green-light" />
                </div>
              ))
            : rows.map((row) => (
                <button
                  className="w-full rounded-lg border-[1.5px] border-border bg-white p-5 text-left transition-colors duration-150 hover:border-green-main"
                  key={row.id}
                  type="button"
                  onClick={() => navigate("/tenders")}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            row.status === "awarded"
                              ? "rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
                              : "rounded-md bg-green-light px-2 py-1 text-xs font-semibold uppercase tracking-wide text-green-main"
                          }
                        >
                          {row.status}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-widest text-muted">{row.office}</span>
                      </div>

                      <h3 className="mt-3 font-syne text-2xl font-extrabold tracking-tight text-text">{row.title}</h3>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md border border-green-light bg-green-light px-2 py-1 text-green-main">{row.category}</span>
                        <span className="rounded-md border border-border px-2 py-1 text-muted">Procurement</span>
                      </div>
                    </div>

                    <div className="grid min-w-[220px] grid-cols-3 gap-3 text-right text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted">Budget</p>
                        <p className="mt-1 font-semibold text-text">{formatBudget(row.budget)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted">Deadline</p>
                        <p className="mt-1 font-semibold text-text">{formatDeadline(row.deadline)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted">Bids</p>
                        <p className="mt-1 font-semibold text-text">{row.bidCount}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

          {!loading && rows.length === 0 ? (
            <div className="rounded-lg border-[1.5px] border-border bg-white p-6 text-sm text-muted">No public tenders available right now.</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default PublicTenders;
