import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { acceptBid, fetchBidsForTender, fetchTenders, rejectBid } from "../../features/dashboard/dashboard.api";
import {
  CardSurface,
  DashboardIcon,
  EmptyState,
  LoadingBlock,
  Modal,
  SectionHeader,
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
  const [statusFilter, setStatusFilter] = useState<"all" | BidItem["status"]>("all");
  const deferredSearch = useDeferredValue(searchValue);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [detailsBid, setDetailsBid] = useState<BidItem | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());

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
      setBids(await fetchBidsForTender(tenderId));
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

    return bids.filter((bid) => {
      const matchesStatus = statusFilter === "all" ? true : bid.status === statusFilter;
      const matchesQuery =
        query.length === 0
          ? true
          : [bid.businessName ?? "", bid.businessEmail ?? "", bid.proposal].some((value) => matchesSearch(value, query));
      return matchesStatus && matchesQuery;
    });
  }, [bids, deferredSearch, statusFilter]);

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
        title: action === "accept" ? "Bid approved" : "Bid rejected",
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

  function toggleShortlist(bidId: string) {
    setShortlistedIds((current) => {
      const next = new Set(current);
      if (next.has(bidId)) {
        next.delete(bidId);
      } else {
        next.add(bidId);
      }
      return next;
    });
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
            className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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
            className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            to="/government/create"
          >
            Create Tender
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <CardSurface className="p-6">
        <SectionHeader
          eyebrow="Bid management"
          title="Review incoming proposals"
          description="Inspect submissions, shortlist suppliers, compare bids, and approve or reject tender responses."
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-[280px_1fr_180px]">
          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            value={selectedTenderId}
            onChange={(event) => setSearchParams(new URLSearchParams({ tender: event.target.value }), { replace: true })}
          >
            {tenders.map((tender) => (
              <option key={tender.id} value={tender.id}>
                {tender.title}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
            <DashboardIcon className="h-5 w-5 text-slate-400" name="search" />
            <input
              className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
              placeholder="Search by company, email, or proposal text"
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | BidItem["status"])}
          >
            <option value="all">All bid statuses</option>
            <option value="pending">Submitted</option>
            <option value="accepted">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </CardSurface>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Submitted", pendingCount, "Awaiting evaluation"],
          ["Approved", acceptedCount, "Award-ready decisions"],
          ["Rejected", rejectedCount, "Declined submissions"],
        ].map(([label, value, detail]) => (
          <CardSurface className="p-5" key={label}>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{detail}</p>
          </CardSurface>
        ))}
      </div>

      {selectedTender ? (
        <CardSurface className="p-5">
          <div className="grid gap-5 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">Selected tender</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{selectedTender.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{selectedTender.description}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Deadline</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatDate(selectedTender.deadline)}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Budget</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatCurrency(selectedTender.budget)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Location</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{selectedTender.location}</p>
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
          description={bids.length === 0 ? "No businesses have submitted a bid for this tender yet." : "No bids match the current filters."}
          icon="briefcase"
        />
      ) : (
        <CardSurface className="overflow-hidden">
          <div className="overflow-x-auto dashboard-scrollbar">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-950">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4">Company Name</th>
                  <th className="px-5 py-4">Tender Name</th>
                  <th className="px-5 py-4">Bid Amount</th>
                  <th className="px-5 py-4">Submission Date</th>
                  <th className="px-5 py-4">Documents</th>
                  <th className="px-5 py-4">Bid Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {filteredBids.map((bid) => {
                  const actionDisabled = pendingActionId === bid.id || bid.status !== "pending" || selectedTender?.status === "awarded";

                  return (
                    <tr className="align-top transition hover:bg-slate-50 dark:hover:bg-slate-950" key={bid.id}>
                      <td className="px-5 py-5">
                        <p className="font-semibold text-slate-900 dark:text-white">{bid.businessName ?? "Business account"}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{bid.businessEmail ?? bid.businessId}</p>
                      </td>
                      <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">{selectedTender?.title ?? bid.tenderId}</td>
                      <td className="px-5 py-5 text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(bid.amount)}</td>
                      <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">{bid.createdAt ? formatDate(bid.createdAt) : "Not available"}</td>
                      <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">{bid.documents.length} submitted</td>
                      <td className="px-5 py-5">
                        <StatusBadge status={bid.status} />
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex flex-wrap gap-2">
                          <TableActionButton icon="eye" label="Details" tone="sky" onClick={() => setDetailsBid(bid)} />
                          <TableActionButton icon="check" label={pendingActionId === bid.id ? "Working..." : "Approve"} tone="emerald" disabled={actionDisabled} onClick={() => void handleDecision("accept", bid)} />
                          <TableActionButton icon="x" label={pendingActionId === bid.id ? "Working..." : "Reject"} tone="rose" disabled={actionDisabled} onClick={() => void handleDecision("reject", bid)} />
                          <TableActionButton icon="spark" label={shortlistedIds.has(bid.id) ? "Shortlisted" : "Shortlist"} onClick={() => toggleShortlist(bid.id)} />
                          {bid.documents[0]?.url ? (
                            <a className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" href={bid.documents[0].url} rel="noreferrer" target="_blank">
                              <DashboardIcon className="h-4 w-4" name="download" />
                              Download
                            </a>
                          ) : null}
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

      <Modal open={Boolean(detailsBid)} title="Bid details" description="Inspect proposal metadata and submitted documents." onClose={() => setDetailsBid(null)}>
        {detailsBid ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950"><span className="font-semibold text-slate-950 dark:text-white">Company:</span> {detailsBid.businessName ?? "Business account"}</p>
              <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950"><span className="font-semibold text-slate-950 dark:text-white">Amount:</span> {formatCurrency(detailsBid.amount)}</p>
              <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950 md:col-span-2"><span className="font-semibold text-slate-950 dark:text-white">Proposal:</span> {detailsBid.proposal}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-950 dark:text-white">Documents submitted</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {detailsBid.documents.length ? detailsBid.documents.map((document) => (
                  <a className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300" href={document.url} target="_blank" rel="noreferrer" key={document.url}>
                    <DashboardIcon className="h-4 w-4" name="download" />
                    {document.originalname}
                  </a>
                )) : <p className="text-sm text-slate-500 dark:text-slate-400">No documents attached.</p>}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default BidsPage;
