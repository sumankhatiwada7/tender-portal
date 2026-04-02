import { useNavigate, useOutletContext } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { createTender } from "../../features/dashboard/dashboard.api";
import { CardSurface, DashboardIcon } from "../../features/dashboard/components/DashboardUi";
import TenderForm from "../../features/dashboard/components/TenderForm";
import type { GovernmentOutletContext, TenderMutationInput } from "../../features/dashboard/dashboard.types";

function CreateTenderPage() {
  const navigate = useNavigate();
  const { session } = useOutletContext<GovernmentOutletContext>();
  const { showToast } = useToast();

  async function handleCreateTender(input: TenderMutationInput) {
    await createTender(input);
    showToast({
      tone: "success",
      title: "Tender published",
      message: "Your tender is now open for businesses to review and bid on.",
    });
    navigate("/government/manage", { replace: true });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <CardSurface className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">New notice</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Create a new tender</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Add the core project details, deadline, location, and supporting documents. Validation errors will show directly below the field that needs attention.
          </p>
        </div>
        <TenderForm submitLabel="Publish Tender" submittingLabel="Publishing..." onSubmit={handleCreateTender} />
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
