import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearSession, loadSession } from "../../auth/auth.utils";
import type { GovernmentOutletContext } from "../dashboard.types";
import { CardSurface, DashboardIcon } from "./DashboardUi";

const navigationItems = [
  { to: "/government", label: "Dashboard", icon: "grid" as const, end: true },
  { to: "/government/create", label: "Create Tender", icon: "plus" as const },
  { to: "/government/manage", label: "Manage Tenders", icon: "folder" as const },
  { to: "/government/bids", label: "Bids Received", icon: "gavel" as const },
  { to: "/government/profile", label: "Profile", icon: "user" as const },
];

function getPageMeta(pathname: string) {
  if (pathname === "/government/create") {
    return {
      title: "Create Tender",
      description: "Publish a new procurement opportunity with the required details.",
    };
  }

  if (pathname === "/government/manage") {
    return {
      title: "Manage Tenders",
      description: "Track, filter, update, and archive your tender notices.",
    };
  }

  if (pathname === "/government/bids") {
    return {
      title: "Bids Received",
      description: "Review incoming business proposals and make award decisions.",
    };
  }

  if (pathname === "/government/profile") {
    return {
      title: "Profile",
      description: "Keep your government account information and preferences in view.",
    };
  }

  return {
    title: "Government Dashboard",
    description: "Monitor tender performance, deadlines, and bid activity from one workspace.",
  };
}

function GovernmentDashboardShell() {
  const session = loadSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname, location.search]);

  if (!session) {
    return null;
  }

  const pageMeta = getPageMeta(location.pathname);

  function handleLogout() {
    clearSession();
    navigate("/", { replace: true });
  }

  const outletContext: GovernmentOutletContext = {
    session,
    onLogout: handleLogout,
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#f1f5f9_100%)] text-slate-900">
      {sidebarOpen ? (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          type="button"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/80 bg-slate-950 text-white shadow-[0_24px_80px_rgba(2,6,23,0.24)] transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-900/20">
              <DashboardIcon className="h-6 w-6" name="building" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">TenderFlow</p>
              <p className="mt-1 text-sm text-slate-300">Government control center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-slate-300 hover:bg-white/7 hover:text-white",
                ].join(" ")
              }
              end={item.end}
              key={item.to}
              to={item.to}
            >
              <DashboardIcon className="h-5 w-5" name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/7 hover:text-white"
            type="button"
            onClick={handleLogout}
          >
            <DashboardIcon className="h-5 w-5" name="logout" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 lg:hidden"
                type="button"
                onClick={() => setSidebarOpen(true)}
              >
                <DashboardIcon className="h-5 w-5" name="menu" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">Government Portal</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{pageMeta.title}</h1>
                <p className="mt-1 text-sm text-slate-500">{pageMeta.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                type="button"
              >
                <DashboardIcon className="h-5 w-5" name="bell" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </button>

              <div className="relative">
                <button
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-300"
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
                    <DashboardIcon className="h-5 w-5" name="user" />
                  </div>
                  <div className="hidden text-sm sm:block">
                    <p className="font-semibold text-slate-900">{session.user.name}</p>
                    <p className="text-slate-500">{session.user.role}</p>
                  </div>
                </button>

                {profileOpen ? (
                  <CardSurface className="absolute right-0 mt-3 w-72 p-4">
                    <p className="text-sm font-semibold text-slate-950">{session.user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{session.user.email}</p>
                    <div className="mt-4 grid gap-2">
                      <NavLink
                        className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                        to="/government/profile"
                      >
                        View profile
                      </NavLink>
                      <button
                        className="rounded-2xl px-3 py-2 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                        type="button"
                        onClick={handleLogout}
                      >
                        Sign out
                      </button>
                    </div>
                  </CardSurface>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
}

export default GovernmentDashboardShell;
