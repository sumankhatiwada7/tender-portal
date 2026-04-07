import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { create as createBid, getForTender } from "../../api/bid.api";
import { getById } from "../../api/tender.api";
import type { Bid, Tender } from "../../api/types";
import { useAuthStore } from "../../store/auth.store";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { Textarea } from "../../components/ui/Input";

function daysLeft(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function TenderDetail() {
  const { id = "" } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const role = user?.role?.[0];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tender, setTender] = useState<Tender | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);

  const [amount, setAmount] = useState("");
  const [proposal, setProposal] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const tenderData = await getById(id);
        if (!mounted) return;
        setTender(tenderData);

        if (role === "government") {
          const bidData = await getForTender(id);
          if (mounted) setBids(bidData);
        }
      } catch (err) {
        if (mounted) setError((err as Error).message || "Unable to load tender");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id, role]);

  const bidStats = useMemo(() => {
    if (bids.length === 0) {
      return { total: 0, low: 0, high: 0 };
    }

    const amounts = bids.map((bid) => Number(bid.amount));
    return {
      total: bids.length,
      low: Math.min(...amounts),
      high: Math.max(...amounts),
    };
  }, [bids]);

  async function onSubmitBid(event: React.FormEvent) {
    event.preventDefault();
    if (!amount || !proposal) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("amount", amount);
      payload.append("proposal", proposal);
      files.forEach((file) => payload.append("documents", file));
      await createBid(id, payload);
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message || "Unable to submit bid");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-64px)] grid-cols-[1fr_380px]">
      <section className="overflow-y-auto bg-bg p-10">
        {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-28" />
            <Skeleton className="h-48" />
          </div>
        ) : null}

        {!loading && !tender ? <EmptyState title="Tender not found" subtitle="This tender may have been removed." /> : null}

        {!loading && tender ? (
          <>
            <p className="text-sm text-gray-500">
              <Link to="/">Home</Link> / <Link to="/tenders">Tenders</Link> / {tender.title}
            </p>

            <article className="mt-4 rounded-xl border-[1.5px] border-gray-200 bg-white p-7">
              <div className="flex items-center gap-3">
                <Badge variant={tender.status}>{tender.status}</Badge>
                <span className="text-sm text-gray-500">{tender.location}</span>
              </div>
              <h1 className="mt-4 font-syne text-2xl font-extrabold tracking-tight text-gray-900">{tender.title}</h1>
              <p className="mt-3 text-sm text-gray-600">{tender.description}</p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{tender.category}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{tender.location}</span>
              </div>
            </article>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-xl border-[1.5px] border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-400">Budget</p>
                <p className="mt-1 font-syne text-xl font-extrabold text-green-dark">NPR {tender.budget.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Maximum bid</p>
              </div>
              <div className="rounded-xl border-[1.5px] border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-400">Deadline</p>
                <p className="mt-1 font-syne text-xl font-extrabold text-gray-900">{new Date(tender.deadline).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">{daysLeft(tender.deadline)} days remaining</p>
              </div>
              <div className="rounded-xl border-[1.5px] border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-400">Bids</p>
                <p className="mt-1 font-syne text-xl font-extrabold text-gray-900">{bidStats.total}</p>
                <p className="text-xs text-gray-500">Submitted so far</p>
              </div>
            </div>

            <article className="mt-4 rounded-xl border-[1.5px] border-gray-200 bg-white p-6">
              <h2 className="flex items-center gap-3 text-sm font-semibold text-gray-800 after:h-px after:flex-1 after:bg-gray-100">Documents</h2>
              <div className="mt-4 space-y-2">
                {tender.documents?.length ? (
                  tender.documents.map((document) => (
                    <div key={document.url} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-sm">
                      <span>{document.originalname}</span>
                      <a className="text-green-main" href={document.url} target="_blank" rel="noreferrer">
                        Download
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded.</p>
                )}
              </div>
            </article>

            <article className="mt-4 rounded-xl border-[1.5px] border-gray-200 bg-white p-6">
              <h2 className="flex items-center gap-3 text-sm font-semibold text-gray-800 after:h-px after:flex-1 after:bg-gray-100">Bid summary</h2>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {[
                  ["Total bids", String(bidStats.total)],
                  ["Lowest bid", `NPR ${bidStats.low.toLocaleString()}`],
                  ["Highest bid", `NPR ${bidStats.high.toLocaleString()}`],
                  ["Days left", String(daysLeft(tender.deadline))],
                ].map((item) => (
                  <div key={item[0]} className="rounded-lg bg-bg p-3 text-center">
                    <p className="text-xs text-gray-500">{item[0]}</p>
                    <p className="mt-1 font-syne text-base font-extrabold text-gray-900">{item[1]}</p>
                  </div>
                ))}
              </div>
            </article>
          </>
        ) : null}
      </section>

      <aside className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-l-[1.5px] border-gray-200 bg-white p-8">
        {!isAuthenticated ? (
          <div className="rounded-xl border border-green-main/20 bg-green-light p-6 text-center">
            <h3 className="font-syne text-2xl font-extrabold tracking-tight text-green-dark">Sign in to bid</h3>
            <p className="mt-2 text-sm text-gray-600">Login or register to submit a bid for this tender.</p>
            <div className="mt-5 flex gap-2">
              <Link className="w-full rounded-lg border-[1.5px] border-green-main py-3 text-sm font-medium text-green-main" to="/login">
                Login
              </Link>
              <Link className="w-full rounded-lg bg-green-main py-3 text-sm font-semibold text-white" to="/register">
                Register
              </Link>
            </div>
          </div>
        ) : null}

        {isAuthenticated && role === "government" ? (
          <div className="rounded-xl border-[1.5px] border-gray-200 bg-white p-6">
            <h3 className="font-syne text-2xl font-extrabold tracking-tight text-gray-900">Tender bids</h3>
            <p className="mt-2 text-sm text-gray-600">Total bids received: {bidStats.total}</p>
            <p className="mt-1 text-sm text-gray-600">Lowest bid: NPR {bidStats.low.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-600">Highest bid: NPR {bidStats.high.toLocaleString()}</p>
            <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-green-main">
              View all bids →
            </Link>
          </div>
        ) : null}

        {isAuthenticated && role === "business" && tender?.status === "open" && !submitted ? (
          <form onSubmit={onSubmitBid} className="space-y-4 rounded-xl border-[1.5px] border-gray-200 bg-white p-6">
            <h3 className="font-syne text-2xl font-extrabold tracking-tight text-gray-900">Submit your bid</h3>
            <p className="text-sm text-gray-500">Logged in as {user?.name}</p>
            <div className="rounded-lg bg-green-light p-3 text-sm text-green-main">Bidding closes · {tender ? daysLeft(tender.deadline) : 0} days left</div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Amount</label>
              <div className="flex rounded-lg border-[1.5px] border-gray-200 bg-gray-50">
                <span className="px-3 py-2.5 text-sm text-gray-500">NPR</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  className="w-full bg-transparent py-2.5 pr-3.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Proposal</label>
              <Textarea value={proposal} onChange={(e) => setProposal(e.target.value)} className="min-h-27.5" maxLength={500} />
              <p className="mt-1 text-right text-xs text-gray-500">{proposal.length}/500</p>
            </div>

            <label className="block cursor-pointer rounded-lg border-[1.5px] border-dashed border-gray-300 p-3 text-sm text-gray-600 hover:bg-gray-50">
              Upload documents (optional, max 3)
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 3))}
              />
            </label>
            {files.length > 0 ? (
              <ul className="space-y-1 text-xs text-gray-500">
                {files.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            ) : null}

            <Button className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit bid"}
            </Button>
            <p className="text-xs text-gray-500">You can submit only one bid per tender.</p>
          </form>
        ) : null}

        {submitted ? (
          <div className="rounded-xl border border-green-main/20 bg-green-light p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-main text-white">✓</div>
            <h3 className="mt-4 font-syne text-2xl font-extrabold tracking-tight text-green-dark">Bid submitted!</h3>
            <p className="mt-2 text-sm text-green-main">Your proposal has been recorded successfully.</p>
          </div>
        ) : null}
      </aside>
    </main>
  );
}
