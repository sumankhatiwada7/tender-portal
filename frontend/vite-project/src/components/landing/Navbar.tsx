import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { createPaymentSession, fetchPaymentSummary, verifyPaymentSession } from "../../features/dashboard/dashboard.api";
import { useAuthStore } from "../../store/auth.store";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, logout } = useAuthStore();
  const role = user?.role?.[0];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bidCredits, setBidCredits] = useState(0);
  const [creditQuantity, setCreditQuantity] = useState(1);
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);

  const dashboardPath = role === "admin" ? "/admin" : role === "government" ? "/government" : "/tenders";

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
            <div className="relative">
              <button
                className="flex items-center gap-3 rounded-lg border border-green-main px-4 py-2 text-sm font-semibold text-green-main"
                type="button"
                onClick={() => setDropdownOpen((current) => !current)}
              >
                <span>{user?.name}</span>
                <span className="rounded-full bg-green-light px-2 py-1 text-xs text-green-main">{bidCredits} credits</span>
              </button>

              {dropdownOpen ? (
                <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-green-main/15 bg-white p-4 shadow-xl">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{user?.email}</p>
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

                  <Link className="mt-3 block rounded-lg border border-green-main px-4 py-2 text-center text-sm font-semibold text-green-main" to={dashboardPath}>
                    Dashboard
                  </Link>
                  <button
                    className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
                    type="button"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
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
