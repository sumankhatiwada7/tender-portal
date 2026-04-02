import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { acceptBid, fetchBidsForTender, fetchTenders, rejectBid } from "../../features/dashboard/dashboard.api";
import {
  CardSurface,
  DashboardIcon,
  EmptyState,
  LoadingBlock,
  StatusBadge,
  TableActionButton,
} from "../../features/dashboard/components/DashboardUi";
import type { BidItem, GovernmentOutletContext, TenderItem } from "../../features/dashboard/dashboard.types";
import {
  filterTendersForGovernment,
  formatCurrency,
  formatDate,
  getApiErrorMessage,
  matchesSearch,
} from "../../features/dashboard/dashboard.utils";

function BidsPage() {
  const { session } = useOutletContext<GovernmentOutletContext>();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loadingTenders, setLoadingTenders] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const selectedTenderId = searchParams.get("tender") ?? "";
  const selectedTender = tenders.find((tender) => tender.id === selectedTenderId) ?? null;

  async function loadTenders() {
    setLoadingTenders(true);
    setError(null);

    try {
      const allTenders = await fetchTenders();
      const ownedTenders = filterTendersForGovernment(allTenders, session.user.id);
      setTenders(ownedTenders);

      if (ownedTenders.length === 0) {
        setSearchParams(new URLSearchParams(), { replace: true });
      } else if (!selectedTenderId || !ownedTenders.some((tender) => tender.id === selectedTenderId)) {
        setSearchParams(new URLSearchParams({ tender: ownedTenders[0].id }), { replace: true });
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load your tenders."));
    } finally {
      setLoadingTenders(false);
    }
  }

  async function loadBids(tenderId: string) {
    setLoadingBids(true);
    setError(null);

    try {
      const nextBids = await fetchBidsForTender(tenderId);
      setBids(nextBids);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load bids for this tender."));
    } finally {
      setLoadingBids(false);
    }
  }

  useEffect(() => {
    void loadTenders();
  }, [session.user.id]);

  useEffect(() => {
    if (!selectedTenderId) {
      setBids([]);
      return;
    }

    void loadBids(selectedTenderId);
  }, [selectedTenderId]);

  const filteredBids = useMemo(() => {
    const query = deferredSearch.trim();

    if (!query) {
      return bids;
    }

    return bids.filter((bid) =>
      [bid.businessName ?? "", bid.businessEmail ?? "", bid.proposal].some((value) => matchesSearch(value, query)),
    );
  }, [bids, deferredSearch]);

  const pendingCount = bids.filter((bid) => bid.status === "pending").length;
  const acceptedCount = bids.filter((bid) => bid.status === "accepted").length;
  const rejectedCount = bids.filter((bid) => bid.status === "rejected").length;

  async function handleDecision(action: "accept" | "reject", bid: BidItem) {
    if (!selectedTender) {
      return;
    }

    setPendingActionId(bid.id);

    try {
      if (action === "accept") {
        await acceptBid(selectedTender.id, bid.id);
      } else {
        await rejectBid(selectedTender.id, bid.id);
      }

      showToast({
        tone: "success",
        title: action === "accept" ? "Bid accepted" : "Bid rejected",
        message:
          action === "accept"
            ? `${bid.businessName ?? "The business"} has been awarded the tender.`
            : `${bid.businessName ?? "The business"} has been marked as rejected.`,
      });

      await loadTenders();
      await loadBids(selectedTender.id);
    } catch (decisionError) {
      showToast({
        tone: "error",
        title: "Action failed",
        message: getApiErrorMessage(decisionError, "Unable to update the bid status."),
      });
    } finally {
      setPendingActionId(null);
    }
  }

  if (loadingTenders) {
    return <LoadingBlock label="Loading bid workspace..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load bids"
        description={error}
        icon="gavel"
        action={
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
            onClick={() => void loadTenders()}
          >
            Retry
          </button>
        }
      />
    );
  }

  if (tenders.length === 0) {
    return (
      <EmptyState
        title="No tenders available for review"
        description="Create a tender first, then this page will show bids submitted by businesses."
        icon="gavel"
        action={
          <Link
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            to="/government/create"
          >
            Create Tender
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <CardSurface className="p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Bid review</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Review incoming proposals</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Select one of your tenders, inspect the businesses that applied, and accept or reject bids directly from this page.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Pending", String(pendingCount)],
              ["Accepted", String(acceptedCount)],
              ["Rejected", String(rejectedCount)],
            ].map(([label, value]) => (
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3" key={label}>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Choose tender</span>
            <select
              className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              value={selectedTenderId}
              onChange={(event) => setSearchParams(new URLSearchParams({ tender: event.target.value }), { replace: true })}
            >
              {tenders.map((tender) => (
                <option key={tender.id} value={tender.id}>
                  {tender.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Search bids</span>
            <div className="flex items-center gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3">
              <DashboardIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search by business or proposal text"
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </label>
        </div>
      </CardSurface>

      {selectedTender ? (
        <CardSurface className="p-6">
          <div className="grid gap-5 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Selected tender</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">{selectedTender.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{selectedTender.description}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{formatDate(selectedTender.deadline)}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Budget</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(selectedTender.budget)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{selectedTender.location}</p>
              <div className="mt-4">
                <StatusBadge status={selectedTender.status} />
              </div>
            </div>
          </div>
        </CardSurface>
      ) : null}

      {loadingBids ? (
        <LoadingBlock label="Loading bids..." />
      ) : filteredBids.length === 0 ? (
        <EmptyState
          title="No bids to review"
          description={
            bids.length === 0
              ? "No businesses have submitted a bid for this tender yet."
              : "No bids match the current search."
          }
          icon="briefcase"
        />
      ) : (
        <CardSurface className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Bid Amount</th>
                  <th className="px-6 py-4">Proposal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBids.map((bid) => {
                  const actionDisabled =
                    pendingActionId === bid.id || bid.status !== "pending" || selectedTender?.status === "awarded";

                  return (
                    <tr className="align-top" key={bid.id}>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">{bid.businessName ?? "Business account"}</p>
                        <p className="mt-1 text-sm text-slate-500">{bid.businessEmail ?? bid.businessId}</p>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-900">{formatCurrency(bid.amount)}</td>
                      <td className="px-6 py-5 text-sm leading-7 text-slate-600">
                        <div className="max-w-xl">{bid.proposal}</div>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={bid.status} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <TableActionButton
                            disabled={actionDisabled}
                            icon="check"
                            label={pendingActionId === bid.id ? "Working..." : "Accept"}
                            tone="emerald"
                            onClick={() => void handleDecision("accept", bid)}
                          />
                          <TableActionButton
                            disabled={actionDisabled}
                            icon="x"
                            label={pendingActionId === bid.id ? "Working..." : "Reject"}
                            tone="rose"
                            onClick={() => void handleDecision("reject", bid)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardSurface>
      )}
    </div>
  );
}

export default BidsPage;
