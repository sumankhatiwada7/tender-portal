import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { createPaymentSession, fetchPaymentSummary, verifyPaymentSession } from "../../features/dashboard/dashboard.api";
import { useAuthStore } from "../../store/auth.store";
import NotificationBell from "../notifications/NotificationBell";

function getInitials(name?: string) {
  if (!name) {
    return "TN";
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "TN";
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, logout } = useAuthStore();
  const role = user?.role?.[0];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [bidCredits, setBidCredits] = useState(0);
  const [creditQuantity, setCreditQuantity] = useState(1);
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);

  const dashboardPath = role === "admin" ? "/admin" : role === "government" ? "/government" : "/tenders";
  const userInitials = getInitials(user?.name);

  function navigateToSection(sectionId: string) {
    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate(`/#${sectionId}`);
  }

  useEffect(() => {
    if (!isAuthenticated || role !== "business") {
      return;
    }

    let isMounted = true;

    async function loadCredits() {
      try {
        const summary = await fetchPaymentSummary("bid");
        if (isMounted) {
          setBidCredits(summary.availableCredits);
        }
      } catch {
        if (isMounted) {
          setBidCredits(0);
        }
      }
    }

    void loadCredits();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (!isAuthenticated || role !== "business") {
      return;
    }

    const paymentState = searchParams.get("payment");
    const paymentType = searchParams.get("type");
    const sessionId = searchParams.get("session_id");
    if (!paymentState || paymentType !== "bid") {
      return;
    }

    async function handlePaymentReturn() {
      if (paymentState === "success" && sessionId) {
        try {
          await verifyPaymentSession(sessionId);
          const summary = await fetchPaymentSummary("bid");
          setBidCredits(summary.availableCredits);
        } catch {
          // Keep navbar quiet; bid page will show any action errors.
        }
      }

      setSearchParams({}, { replace: true });
    }

    void handlePaymentReturn();
  }, [isAuthenticated, role, searchParams, setSearchParams]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [dropdownOpen]);

  async function handleBuyCredits() {
    setIsBuyingCredits(true);

    try {
      const session = await createPaymentSession({
        type: "bid",
        quantity: creditQuantity,
        returnPath: `${location.pathname}${location.search}`,
      });

      if (!session.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.assign(session.url);
    } catch {
      setIsBuyingCredits(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b-2 border-green-main bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-12">
        <Link className="font-syne text-2xl font-extrabold tracking-tight" to="/">
          Tender <span className="text-green-main">Nepal</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-text lg:flex">
          <Link className="hover:underline" to="/tenders">
            Tenders
          </Link>
          <button className="hover:underline" type="button" onClick={() => navigateToSection("how-it-works")}>
            How it works
          </button>
          <button className="hover:underline" type="button" onClick={() => navigateToSection("payment-info")}>
            Payments
          </button>
          <button className="hover:underline" type="button" onClick={() => navigateToSection("for-business")}>
            For business
          </button>
          <button className="hover:underline" type="button" onClick={() => navigateToSection("contact")}>
            Contact
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link className="rounded-lg border border-green-main px-4 py-2 text-sm font-semibold text-green-main" to="/login">
                Login
              </Link>
              <Link className="rounded-lg border border-green-main bg-green-main px-4 py-2 text-sm font-semibold text-white" to="/register">
                Register
              </Link>
            </>
          ) : role === "business" ? (
            <>
              <NotificationBell compact tone="green" />
              <div className="relative" ref={accountMenuRef}>
                <button
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-green-main bg-green-light text-sm font-extrabold text-green-main shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-main focus:ring-offset-2"
                  type="button"
                  aria-label="Open account menu"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((current) => !current)}
                >
                  <span>{userInitials}</span>
                </button>

                {dropdownOpen ? (
                  <div className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-green-main/15 bg-white p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-main text-sm font-extrabold text-white">
                        {userInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="mt-1 truncate text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-900">Bid credits</p>
                    <p className="mt-1 text-sm text-gray-600">Available: {bidCredits} | $1 per bid</p>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green-main/20 text-lg font-semibold text-green-main disabled:opacity-50"
                        type="button"
                        onClick={() => setCreditQuantity((current) => Math.max(1, current - 1))}
                        disabled={creditQuantity <= 1 || isBuyingCredits}
                      >
                        -
                      </button>
                      <div className="min-w-20 rounded-xl border border-green-main/15 px-4 py-2 text-center text-sm font-semibold text-gray-900">
                        {creditQuantity}
                      </div>
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green-main/20 text-lg font-semibold text-green-main disabled:opacity-50"
                        type="button"
                        onClick={() => setCreditQuantity((current) => Math.min(10, current + 1))}
                        disabled={creditQuantity >= 10 || isBuyingCredits}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="mt-4 w-full rounded-lg bg-green-main px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      type="button"
                      onClick={() => void handleBuyCredits()}
                      disabled={isBuyingCredits}
                    >
                      {isBuyingCredits ? "Opening checkout..." : `Buy ${creditQuantity} Credit${creditQuantity > 1 ? "s" : ""}`}
                    </button>

                    <Link
                      className="mt-3 block rounded-lg border border-green-main px-4 py-2 text-center text-sm font-semibold text-green-main"
                      to={dashboardPath}
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate("/login");
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <NotificationBell compact tone="green" />
              <span className="hidden text-sm font-semibold text-text md:inline">{user?.name}</span>
              <Link className="rounded-lg border border-green-main px-4 py-2 text-sm font-semibold text-green-main" to={dashboardPath}>
                Dashboard
              </Link>
              <button
                className="rounded-lg border border-green-main bg-green-main px-4 py-2 text-sm font-semibold text-white"
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
