import { Link, useOutletContext } from "react-router-dom";
import { CardSurface, DashboardIcon } from "../../features/dashboard/components/DashboardUi";
import type { GovernmentOutletContext } from "../../features/dashboard/dashboard.types";

function ProfilePage() {
  const { session, onLogout } = useOutletContext<GovernmentOutletContext>();

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
      <CardSurface className="p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Account profile</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Government user details</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This profile is sourced from the authenticated session stored after login.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Full name</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{session.user.name}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
            <p className="mt-2 text-lg font-semibold capitalize text-slate-950">{session.user.role}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email address</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{session.user.email}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            to="/government/manage"
          >
            Manage tenders
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
            type="button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </CardSurface>

      <div className="space-y-6">
        <CardSurface className="p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700">
            <DashboardIcon className="h-6 w-6" name="shield" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-slate-950">Session summary</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Government accounts are redirected into the dashboard automatically after login so procurement work starts in the right place.
          </p>
        </CardSurface>

        <CardSurface className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Quick links</p>
          <div className="mt-4 grid gap-3">
            <Link className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950" to="/government/create">
              Create a new tender
            </Link>
            <Link className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950" to="/government/bids">
              Review bids received
            </Link>
          </div>
        </CardSurface>
      </div>
    </div>
  );
}

export default ProfilePage;
