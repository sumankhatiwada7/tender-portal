import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { createPaymentSession, fetchPaymentSummary, verifyPaymentSession } from "../../features/dashboard/dashboard.api";
import { CardSurface, DashboardIcon, LoadingBlock, SectionHeader } from "../../features/dashboard/components/DashboardUi";
import type { PaymentSummaryResponse } from "../../features/dashboard/dashboard.types";

function GovernmentPaymentPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState<PaymentSummaryResponse | null>(null);
  const [creditQuantity, setCreditQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);

  async function loadSummary() {
    setLoading(true);
    try {
      setSummary(await fetchPaymentSummary("tender"));
    } catch (error) {
      showToast({
        tone: "error",
        title: "Payment status unavailable",
        message: error instanceof Error ? error.message : "Unable to load payment status.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  useEffect(() => {
    const paymentState = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (!paymentState) {
      return;
    }

    async function handlePaymentReturn() {
      if (paymentState === "success" && sessionId) {
        try {
          await verifyPaymentSession(sessionId);
          await loadSummary();
          showToast({
            tone: "success",
            title: "Payment received",
            message: "Your tender credits are ready to use.",
          });
        } catch (error) {
          showToast({
            tone: "error",
            title: "Payment verification failed",
            message: error instanceof Error ? error.message : "Unable to confirm the completed payment.",
          });
        }
      }

      if (paymentState === "cancelled") {
        showToast({
          tone: "info",
          title: "Payment cancelled",
          message: "No tender credits were purchased.",
        });
      }

      setSearchParams({}, { replace: true });
    }

    void handlePaymentReturn();
  }, [searchParams, setSearchParams, showToast]);

  async function handleBuyCredit() {
    setIsBuying(true);

    try {
      const sessionResponse = await createPaymentSession({
        type: "tender",
        quantity: creditQuantity,
        returnPath: "/government/payment",
      });

      if (!sessionResponse.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.assign(sessionResponse.url);
    } catch (error) {
      showToast({
        tone: "error",
        title: "Checkout failed",
        message: error instanceof Error ? error.message : "Unable to start the tender payment.",
      });
      setIsBuying(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading payment details..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <CardSurface className="p-6">
        <SectionHeader
          eyebrow="Tender credits"
          title="Purchase publishing credits"
          description="Each tender publish uses one credit. Buy credits here, then return to Create Tender when you are ready."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Available credits", String(summary?.availableCredits ?? 0)],
            ["Price per tender", `$${summary?.unitPriceUsd ?? 1}`],
            ["Pending payments", String(summary?.pendingPayments ?? 0)],
          ].map(([label, value]) => (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950" key={label}>
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </CardSurface>

      <CardSurface className="p-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Credits to buy</p>
            <div className="mt-3 flex items-center gap-3">
              <button
                className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-900 transition hover:border-slate-300 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                type="button"
                onClick={() => setCreditQuantity((current) => Math.max(1, current - 1))}
                disabled={isBuying || creditQuantity <= 1}
              >
                -
              </button>
              <div className="min-w-24 rounded-lg border border-slate-200 bg-slate-50 px-5 py-3 text-center text-lg font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                {creditQuantity}
              </div>
              <button
                className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-900 transition hover:border-slate-300 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                type="button"
                onClick={() => setCreditQuantity((current) => Math.min(10, current + 1))}
                disabled={isBuying || creditQuantity >= 10}
              >
                +
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Total: ${creditQuantity}. You can buy 1 to 10 credits at a time.</p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-wait disabled:bg-sky-400"
            type="button"
            onClick={() => void handleBuyCredit()}
            disabled={isBuying}
          >
            <DashboardIcon className="h-4 w-4" name="cash" />
            {isBuying ? "Opening checkout..." : "Buy Credits"}
          </button>
        </div>
      </CardSurface>

      <div className="flex flex-wrap gap-3">
        <Link className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-800" to="/government/create">
          Create Tender
        </Link>
        <Link className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" to="/government">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default GovernmentPaymentPage;
