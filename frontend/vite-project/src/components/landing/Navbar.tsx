import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const role = user?.role?.[0];

  const dashboardPath = role === "admin" ? "/admin" : role === "government" ? "/government" : "/tenders";

  function navigateToSection(sectionId: string) {
    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate(`/#${sectionId}`);
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
