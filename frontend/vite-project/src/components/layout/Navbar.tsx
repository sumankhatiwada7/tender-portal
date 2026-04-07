import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import Button from "../ui/Button";

function roleLinks(role?: string) {
  if (role === "business") {
    return [
      { to: "/tenders", label: "Tenders" },
      { to: "/my-bids", label: "My Bids" },
      { to: "/dashboard", label: "Dashboard" },
    ];
  }

  if (role === "government") {
    return [
      { to: "/tenders", label: "Tenders" },
      { to: "/tenders/create", label: "Create Tender" },
      { to: "/dashboard", label: "Dashboard" },
    ];
  }

  if (role === "admin") {
    return [
      { to: "/admin", label: "Users" },
      { to: "/dashboard", label: "Dashboard" },
    ];
  }

  return [
    { to: "/tenders", label: "Tenders" },
    { to: "/#how-it-works", label: "How it works" },
  ];
}

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const role = user?.role?.[0];
  const links = roleLinks(role);

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b-2 border-green-main bg-white px-12">
      <Link to="/" className="font-syne text-2xl font-extrabold tracking-tight text-gray-900">
        Tender <span className="text-green-mid">Nepal</span>
      </Link>

      <div className="flex items-center gap-8">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-green-main" : "text-gray-600 hover:text-green-main"}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {!isAuthenticated ? (
          <>
            <Button variant="outline" className="px-4 py-2" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button className="px-4 py-2" onClick={() => navigate("/register")}>
              Register
            </Button>
          </>
        ) : (
          <>
            {role === "admin" ? (
              <span className="rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-green-main">Admin</span>
            ) : (
              <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
            )}
            <Button
              variant="outline"
              className="px-4 py-2"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
