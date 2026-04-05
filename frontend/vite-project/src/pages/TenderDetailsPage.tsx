import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { loadSession } from "../features/auth/auth.utils";
import { formatCurrency, formatDate, getTenderStatusTone } from "../features/dashboard/dashboard.utils";
import type { TenderItem } from "../features/dashboard/dashboard.types";
import { fetchPublicTenderById, submitBusinessBid } from "../features/tenders/publicTenders.api";

function TenderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tender, setTender] = useState<TenderItem | null>(null);
  const [proposal, setProposal] = useState("");
  const [amount, setAmount] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const session = loadSession();
  const isBusiness = session?.user.role === "business";

  useEffect(() => {
    async function loadTender() {
      if (!id) {
        setError("Tender id is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchPublicTenderById(id);
        setTender(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load tender details.");
      } finally {
        setLoading(false);
      }
    }

    void loadTender();
  }, [id]);

  async function handleSubmitBid(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tender) {
      return;
    }

    const parsedAmount = Number(amount);
    if (!proposal.trim()) {
      setSubmitError("Proposal is required.");
      setSubmitSuccess(null);
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSubmitError("Amount must be greater than 0.");
      setSubmitSuccess(null);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await submitBusinessBid(tender.id, {
        proposal: proposal.trim(),
        amount: parsedAmount,
      });
      setSubmitSuccess("Bid submitted successfully.");
      setProposal("");
      setAmount("");
    } catch (submitBidError) {
      setSubmitError(submitBidError instanceof Error ? submitBidError.message : "Unable to submit bid.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6fbff_0%,#edf3ff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            to="/tenders"
          >
            Back to all tenders
          </Link>
        </div>

        {loading ? (
          <section className="rounded-4xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading tender details...</section>
        ) : error || !tender ? (
          <section className="rounded-4xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-lg font-semibold text-rose-700">Tender unavailable</p>
            <p className="mt-2 text-sm text-rose-600">{error ?? "Tender not found."}</p>
          </section>
        ) : (
          <>
            <section className="rounded-4xl border border-slate-200/80 bg-white/95 p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className={["inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ring-1", getTenderStatusTone(tender.status)].join(" ")}>
                  {tender.status}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {tender.category}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {tender.location}
                </span>
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{tender.title}</h1>
              <p className="mt-4 text-base leading-8 text-slate-700">{tender.description}</p>

              <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(tender.budget)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{formatDate(tender.deadline)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-950">Bid for this tender</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Business users can submit a proposal and amount directly from this page.
              </p>

              {isBusiness ? (
                <form className="mt-6 space-y-4" onSubmit={handleSubmitBid}>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Proposal</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300"
                      value={proposal}
                      onChange={(event) => setProposal(event.target.value)}
                      placeholder="Write your business proposal"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Bid amount</span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300"
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Enter amount"
                    />
                  </label>

                  {submitError ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}
                  {submitSuccess ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{submitSuccess}</p> : null}

                  <button
                    className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-wait disabled:bg-sky-400"
                    type="submit"
                    disabled={submitting || tender.status !== "open"}
                  >
                    {tender.status !== "open" ? "Tender is not open for bids" : submitting ? "Submitting..." : "Submit bid"}
                  </button>
                </form>
              ) : (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-700">
                    Sign in as a business account to place a bid on this tender.
                  </p>
                  <button
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    type="button"
                    onClick={() => navigate(`/login?next=${encodeURIComponent(`/tenders/${tender.id}`)}`)}
                  >
                    Login to bid
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default TenderDetailsPage;
