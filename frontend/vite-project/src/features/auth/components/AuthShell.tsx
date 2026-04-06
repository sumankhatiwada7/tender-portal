import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "../../../components/landing/Navbar";
import Footer from "../../../components/landing/Footer";

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
    <>
      <Navbar />
      <main className="min-h-screen bg-bg px-4 py-12 text-text">
        <section className="mx-auto mt-10 max-w-xl">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-main">Tender Nepal Auth</p>
            <p className="mt-3 text-sm leading-6 text-muted">Secure sign in and registration for businesses and government offices.</p>
          </div>

          <div className="rounded-lg border-[1.5px] border-border bg-white p-8">
            <div className="mb-8 grid grid-cols-2 rounded-lg bg-green-light p-1">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    "rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-all duration-200",
                    isActive ? "bg-white text-text" : "text-muted hover:text-text",
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
                    isActive ? "bg-white text-text" : "text-muted hover:text-text",
                  ].join(" ")
                }
              >
                Register
              </NavLink>
            </div>

            <div className="space-y-2">
              <div className="inline-flex rounded-md bg-green-light px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-main">{view}</div>
              <h1 className="font-syne text-3xl font-extrabold tracking-tight text-text">{title}</h1>
              <p className="text-sm leading-6 text-muted">{description}</p>
            </div>

            {topFeedback ? <div className="mt-6 space-y-3">{topFeedback}</div> : null}

            <div className="mt-6">{children}</div>

            {bottomContent ? <div className="mt-6">{bottomContent}</div> : null}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default AuthShell;
