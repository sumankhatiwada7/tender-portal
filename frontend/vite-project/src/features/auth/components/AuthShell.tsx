import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type AuthShellProps = {
  view: "login" | "register";
  title: string;
  description: string;
  topFeedback?: ReactNode;
  children: ReactNode;
  bottomContent?: ReactNode;
};

function AuthShell({ view, title, description, topFeedback, children, bottomContent }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-blue-100 px-4 py-10 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.16),transparent_30%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />

      <section className="relative mx-auto mt-20 max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600/75">
            Tender  System
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            All your tender,tendermangament,bids in one place.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200/80">
          <div className="mb-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                [
                  "rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900",
                ].join(" ")
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                [
                  "rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900",
                ].join(" ")
              }
            >
              Register
            </NavLink>
          </div>

          <div className="space-y-2">
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
              {view}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="text-sm leading-6 text-slate-600">{description}</p>
          </div>

          {topFeedback ? <div className="mt-6 space-y-3">{topFeedback}</div> : null}

          <div className="mt-6">{children}</div>

          {bottomContent ? <div className="mt-6">{bottomContent}</div> : null}
        </div>
      </section>
    </main>
  );
}

export default AuthShell;
