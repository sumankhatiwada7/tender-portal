import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { createPaymentSession, createTender, fetchPaymentSummary, verifyPaymentSession } from "../../features/dashboard/dashboard.api";
import { CardSurface, DashboardIcon } from "../../features/dashboard/components/DashboardUi";
import TenderForm from "../../features/dashboard/components/TenderForm";
import type { GovernmentOutletContext, PaymentSummaryResponse, TenderFormValues, TenderMutationInput } from "../../features/dashboard/dashboard.types";

const TENDER_DRAFT_STORAGE_KEY = "government-create-tender-draft";

function readDraft(): Partial<TenderFormValues> | null {
  try {
    const raw = window.sessionStorage.getItem(TENDER_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as Partial<TenderFormValues>;
  } catch {
    return null;
  }
}

function CreateTenderPage() {
  const navigate = useNavigate();
  const { session } = useOutletContext<GovernmentOutletContext>();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryResponse | null>(null);
  const [isBuyingCredit, setIsBuyingCredit] = useState(false);
  const [creditQuantity, setCreditQuantity] = useState(1);

  const draftValues = useMemo(() => readDraft(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadPaymentSummary() {
      try {
        const summary = await fetchPaymentSummary("tender");
        if (isMounted) {
          setPaymentSummary(summary);
        }
      } catch (error) {
        if (isMounted) {
          showToast({
            tone: "error",
            title: "Payment status unavailable",
            message: error instanceof Error ? error.message : "Unable to load payment status.",
          });
        }
      }
    }

    void loadPaymentSummary();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

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
          const summary = await fetchPaymentSummary("tender");
          setPaymentSummary(summary);
          showToast({
            tone: "success",
            title: "Payment received",
            message: "Your tender credits are ready. Reattach any documents if needed, then publish your tender.",
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
          message: "No tender credit was used. You can try the payment again whenever you're ready.",
        });
      }

      setSearchParams({}, { replace: true });
    }

    void handlePaymentReturn();
  }, [searchParams, setSearchParams, showToast]);

  function persistDraft(input: TenderMutationInput) {
    const draft: TenderFormValues = {
      title: input.title,
      description: input.description,
      budget: String(input.budget),
      deadline: input.deadline,
      category: input.category,
      location: input.location,
      status: input.status ?? "open",
    };

    window.sessionStorage.setItem(TENDER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }

  async function handleBuyCredit() {
    setIsBuyingCredit(true);

    try {
      const sessionResponse = await createPaymentSession({ type: "tender", quantity: creditQuantity });
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
      setIsBuyingCredit(false);
    }
  }

  async function handleCreateTender(input: TenderMutationInput) {
    if ((paymentSummary?.availableCredits ?? 0) < 1) {
      persistDraft(input);
      showToast({
        tone: "info",
        title: "Tender payment required",
        message: "Buy at least one tender credit first. Your form details were saved, but you will need to reselect documents after payment.",
      });
      await handleBuyCredit();
      return;
    }

    await createTender(input);
    window.sessionStorage.removeItem(TENDER_DRAFT_STORAGE_KEY);
    showToast({
      tone: "success",
      title: "Tender published",
      message: "Your tender is now open for businesses to review and bid on.",
    });
    setPaymentSummary((current) =>
      current
        ? {
            ...current,
            availableCredits: Math.max(0, current.availableCredits - 1),
          }
        : current,
    );
    navigate("/government/manage", { replace: true });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <CardSurface className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">New notice</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Create a new tender</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Each tender publish costs $1. You can buy between 1 and 10 credits at a time, then use them as needed.
          </p>
        </div>
        <div className="mb-6 rounded-[1.5rem] border border-sky-100 bg-sky-50 px-5 py-4 text-sm text-sky-900">
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-semibold">Tender publishing fee</p>
              <p className="mt-1 leading-6">
                Available credits: <span className="font-semibold">{paymentSummary?.availableCredits ?? 0}</span> | Price per tender: $1
              </p>
              <p className="mt-1 text-sky-700/80">If you leave for checkout, your text fields will be restored when you return.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-sky-900">Credits to buy</span>
                <div className="flex items-center gap-3">
                  <button
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sky-200 bg-white text-lg font-semibold text-sky-900 transition hover:border-sky-300 disabled:opacity-50"
                    type="button"
                    onClick={() => setCreditQuantity((current) => Math.max(1, current - 1))}
                    disabled={isBuyingCredit || creditQuantity <= 1}
                  >
                    -
                  </button>
                  <div className="min-w-24 rounded-2xl border border-sky-200 bg-white px-4 py-3 text-center font-semibold text-slate-950">
                    {creditQuantity}
                  </div>
                  <button
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sky-200 bg-white text-lg font-semibold text-sky-900 transition hover:border-sky-300 disabled:opacity-50"
                    type="button"
                    onClick={() => setCreditQuantity((current) => Math.min(10, current + 1))}
                    disabled={isBuyingCredit || creditQuantity >= 10}
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-xs text-sky-700/80">Choose between 1 and 10 credits per checkout. Total: ${creditQuantity}</p>
              </label>

              <button
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-500"
                type="button"
                onClick={() => void handleBuyCredit()}
                disabled={isBuyingCredit}
              >
                {isBuyingCredit ? "Opening checkout..." : `Buy ${creditQuantity} Tender Credit${creditQuantity > 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
        <TenderForm
          initialValues={draftValues ?? undefined}
          submitLabel="Publish Tender"
          submittingLabel="Publishing..."
          onSubmit={handleCreateTender}
        />
      </CardSurface>

      <div className="space-y-6">
        <CardSurface className="overflow-hidden">
          <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-slate-950 p-6 text-white">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12">
              <DashboardIcon className="h-6 w-6" name="spark" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold">Publishing checklist</h3>
            <p className="mt-3 text-sm leading-7 text-sky-50/85">
              A complete tender brief helps businesses respond with better proposals and reduces clarification delays later.
            </p>
          </div>
          <div className="space-y-4 p-6">
            {[
              "Use a clear title that businesses can recognize quickly.",
              "Summarize scope, budget expectations, and submission requirements.",
              "Attach any supporting documents so evaluation stays consistent.",
            ].map((item) => (
              <div className="flex items-start gap-3" key={item}>
                <div className="mt-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <DashboardIcon className="h-3.5 w-3.5" name="check" />
                </div>
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </CardSurface>

        <CardSurface className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Signed in as</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{session.user.name}</h3>
          <p className="mt-2 text-sm text-slate-500">{session.user.email}</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This tender will be attached to your government account, so only your office can edit or delete it later.
          </p>
        </CardSurface>
      </div>
    </div>
  );
}

export default CreateTenderPage;
