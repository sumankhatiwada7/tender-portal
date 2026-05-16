import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearSession, loadSession } from "../../auth/auth.utils";
import type { GovernmentOutletContext } from "../dashboard.types";
import { CardSurface, DashboardIcon } from "./DashboardUi";
import NotificationBell from "../../../components/notifications/NotificationBell";

const navigationItems = [
  { to: "/government", label: "Dashboard", icon: "grid" as const, end: true },
  { to: "/government/create", label: "Create Tender", icon: "plus" as const },
  { to: "/government/manage", label: "Manage Tenders", icon: "folder" as const },
  { to: "/government/bids", label: "Bids Received", icon: "gavel" as const },
  { to: "/government/payment", label: "Payments", icon: "cash" as const },
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

  if (pathname === "/government/payment") {
    return {
      title: "Payments",
      description: "Purchase and review tender publishing credits.",
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
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem("government-dashboard-theme") === "dark");

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname, location.search]);

  if (!session) {
    return null;
  }

  const pageMeta = getPageMeta(location.pathname);
  const breadcrumbs = useMemo(() => {
    const current = navigationItems.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)));
    return ["Government", current?.label ?? "Dashboard"];
  }, [location.pathname]);

  function handleLogout() {
    clearSession();
    navigate("/", { replace: true });
  }

  const outletContext: GovernmentOutletContext = {
    session,
    onLogout: handleLogout,
  };

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("government-dashboard-theme", next ? "dark" : "light");
      return next;
    });
  }

  return (
    <div className={["min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100", darkMode ? "dark" : ""].join(" ")}>
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
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-900 bg-slate-950 text-white shadow-[0_24px_80px_rgba(2,6,23,0.24)] transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-sky-600 text-white shadow-lg shadow-sky-900/20">
              <DashboardIcon className="h-6 w-6" name="building" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">TenderFlow Gov</p>
              <p className="mt-1 text-xs text-slate-400">Procurement command</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/12 text-white shadow-[inset_3px_0_0_#38bdf8]"
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

        <div className="border-t border-white/10 p-3">
          <div className="mb-3 rounded-lg border border-white/10 bg-white/7 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Office status</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">Verified agency</span>
              <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-xs font-semibold text-emerald-200">Active</span>
            </div>
          </div>
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/7 hover:text-white"
            type="button"
            onClick={handleLogout}
          >
            <DashboardIcon className="h-5 w-5" name="logout" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-colors dark:border-slate-800 dark:bg-slate-950/85">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
                type="button"
                onClick={() => setSidebarOpen(true)}
              >
                <DashboardIcon className="h-5 w-5" name="menu" />
              </button>
              <div>
                <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:flex">
                  {breadcrumbs.map((crumb, index) => (
                    <span className="flex items-center gap-2" key={`${crumb}-${index}`}>
                      {index > 0 ? <span className="text-slate-300 dark:text-slate-700">/</span> : null}
                      {crumb}
                    </span>
                  ))}
                </div>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">{pageMeta.title}</h1>
                <p className="mt-1 hidden text-sm text-slate-500 dark:text-slate-400 md:block">{pageMeta.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                type="button"
                onClick={toggleTheme}
              >
                <DashboardIcon className="h-5 w-5" name={darkMode ? "sun" : "moon"} />
              </button>
              <NotificationBell tone="sky" />

              <div className="relative">
                <button
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-2 py-2 text-left transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white dark:bg-sky-600">
                    <DashboardIcon className="h-5 w-5" name="user" />
                  </div>
                  <div className="hidden text-sm sm:block">
                    <p className="font-semibold text-slate-900 dark:text-white">{session.user.name}</p>
                    <p className="text-slate-500 dark:text-slate-400">{session.user.role}</p>
                  </div>
                </button>

                {profileOpen ? (
                  <CardSurface className="absolute right-0 mt-3 w-72 p-4">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{session.user.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{session.user.email}</p>
                    <div className="mt-4 grid gap-2">
                      <NavLink
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        to="/government/profile"
                      >
                        View profile
                      </NavLink>
                      <button
                        className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
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

        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
}

export default GovernmentDashboardShell;
