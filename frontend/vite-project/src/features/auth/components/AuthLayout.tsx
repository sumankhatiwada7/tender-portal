import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { AUTH_BASE_PATH } from "../auth.config";

type AuthLayoutProps = {
  title: string;
  description: string;
  topFeedback?: ReactNode;
  children: ReactNode;
  bottomContent?: ReactNode;
};

function AuthLayout({ title, description, topFeedback, children, bottomContent }: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(218,119,74,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(85,156,144,0.24),transparent_36%),linear-gradient(135deg,#0b1220_0%,#121b2d_55%,#172235_100%)] px-4 py-5 text-stone-100 sm:px-6">
      <div className="pointer-events-none absolute -left-20 -top-28 h-72 w-72 rounded-full bg-[rgba(234,137,94,0.28)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[rgba(111,181,168,0.24)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent)]" />

      <section className="relative z-10 mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="flex min-h-[44rem] flex-col justify-between rounded-[28px] border border-white/[0.12] bg-slate-950/[0.72] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-10">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.16em] text-teal-200">Queue System</p>
            <h1 className="max-w-[12ch] text-5xl leading-none font-semibold tracking-[-0.05em] sm:text-6xl lg:text-[5.2rem]">
              Move from signup to tender workflow without losing backend context.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-200/[0.8] sm:text-[1.02rem]">
              These auth screens call your real API, keep the design responsive, and surface
              backend validation exactly where users need it.
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            <div className="grid grid-cols-[60px_1fr] gap-4 border-t border-white/10 py-4">
              <span className="text-sm tracking-[0.14em] text-orange-200">01</span>
              <p className="leading-7 text-stone-200/[0.75]">
                Register with a government or business role from the same entry flow.
              </p>
            </div>

            <div className="grid grid-cols-[60px_1fr] gap-4 border-t border-white/10 py-4">
              <span className="text-sm tracking-[0.14em] text-orange-200">02</span>
              <p className="leading-7 text-stone-200/[0.75]">
                See field errors from `errors[]` directly under the related inputs.
              </p>
            </div>

            <div className="grid grid-cols-[60px_1fr] gap-4 border-t border-white/10 py-4">
              <span className="text-sm tracking-[0.14em] text-orange-200">03</span>
              <p className="leading-7 text-stone-200/[0.75]">
                Capture successful login tokens locally so the next frontend step is easier.
              </p>
            </div>
          </div>

          <p className="mt-8 text-sm leading-7 text-teal-100/[0.9]">
            API target:{" "}
            <code className="rounded bg-white/[0.08] px-2 py-1 text-teal-100">{AUTH_BASE_PATH}</code>
          </p>
        </aside>

        <section className="self-center rounded-[28px] border border-white/[0.12] bg-slate-950/[0.72] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-7">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-2">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                [
                  "rounded-xl px-4 py-3 text-center text-sm font-medium transition duration-150",
                  isActive
                    ? "bg-[linear-gradient(135deg,rgba(232,143,102,0.92),rgba(194,103,63,0.92))] text-orange-50"
                    : "text-stone-200/[0.7] hover:-translate-y-0.5 hover:text-stone-100",
                ].join(" ")
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                [
                  "rounded-xl px-4 py-3 text-center text-sm font-medium transition duration-150",
                  isActive
                    ? "bg-[linear-gradient(135deg,rgba(232,143,102,0.92),rgba(194,103,63,0.92))] text-orange-50"
                    : "text-stone-200/[0.7] hover:-translate-y-0.5 hover:text-stone-100",
                ].join(" ")
              }
            >
              Register
            </NavLink>
          </div>

          <div className="mb-6 mt-7">
            <h2 className="text-[2rem] leading-tight font-semibold">{title}</h2>
            <p className="mt-2.5 leading-7 text-stone-200/[0.75]">{description}</p>
          </div>

          {topFeedback}

          {children}

          {bottomContent}
        </section>
      </section>
    </main>
  );
}

export default AuthLayout;
