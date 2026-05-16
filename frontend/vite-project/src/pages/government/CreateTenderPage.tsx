import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { createTender, fetchPaymentSummary } from "../../features/dashboard/dashboard.api";
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
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryResponse | null>(null);

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

  function persistDraft(input: TenderMutationInput) {
    const draft: TenderFormValues = {
      title: input.title,
      description: input.description,
      budget: String(input.budget),
      deadline: input.deadline,
      category: input.category,
      location: input.location,
      status: input.status ?? "open",
      eligibilityCriteria: input.eligibilityCriteria ?? "",
      requiredDocuments: input.requiredDocuments ?? "",
      tenderType: input.tenderType ?? "Open Competitive",
      contactInformation: input.contactInformation ?? "",
    };

    window.sessionStorage.setItem(TENDER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }

  function handleSaveDraft(values: TenderFormValues) {
    window.sessionStorage.setItem(TENDER_DRAFT_STORAGE_KEY, JSON.stringify(values));
    showToast({
      tone: "success",
      title: "Draft saved",
      message: "Your tender draft is saved in this browser session.",
    });
  }

  async function handleCreateTender(input: TenderMutationInput) {
    if ((paymentSummary?.availableCredits ?? 0) < 1) {
      persistDraft(input);
      showToast({
        tone: "info",
        title: "Tender payment required",
        message: "Your form details were saved. Purchase one tender credit before publishing.",
      });
      navigate("/government/payment");
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
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <CardSurface className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">New notice</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Create a new tender</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Complete the guided tender form, preview the notice, save drafts, and publish after payment verification.
          </p>
        </div>
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Tender credits available: <span className="font-semibold text-slate-950 dark:text-white">{paymentSummary?.availableCredits ?? 0}</span>
          </p>
          <Link className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500" to="/government/payment">
            Purchase Credits
          </Link>
        </div>
        <TenderForm
          initialValues={draftValues ?? undefined}
          submitLabel="Publish Tender"
          submittingLabel="Publishing..."
          onSubmit={handleCreateTender}
          onSaveDraft={handleSaveDraft}
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
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{item}</p>
              </div>
            ))}
          </div>
        </CardSurface>

        <CardSurface className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">Signed in as</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{session.user.name}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{session.user.email}</p>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
            This tender will be attached to your government account, so only your office can edit or delete it later.
          </p>
        </CardSurface>
      </div>
    </div>
  );
}

export default CreateTenderPage;
