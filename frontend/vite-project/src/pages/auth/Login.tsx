import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";
import { login } from "../../api/auth.api";
import { getPublicPlatformStats, type PublicPlatformStats } from "../../api/public.api";
import type { ApiErrorResponse } from "../../api/types";
import { getRoleList } from "../../api/types";
import { useAuthStore } from "../../store/auth.store";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function formatCompactCurrency(value: number) {
  return `NPR ${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState<PublicPlatformStats | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const setAuth = useAuthStore((state) => state.setAuth);

  const successMessage = useMemo(() => searchParams.get("registered"), [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function loadPlatformStats() {
      try {
        const response = await getPublicPlatformStats();
        if (mounted) {
          setPlatformStats(response);
        }
      } catch {
        if (mounted) {
          setPlatformStats(null);
        }
      }
    }

    void loadPlatformStats();

    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPendingMessage("");
    const nextFieldErrors: { email?: string; password?: string } = {};

    if (!email) nextFieldErrors.email = "Email is required";
    if (!password) nextFieldErrors.password = "Password is required";
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await login({ email, password });
      const roles = getRoleList(data.user.role);
      setAuth(
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: roles,
          status: data.user.status,
        },
        data.token,
      );

      const role = roles[0];
      if (role === "admin") navigate("/admin");
      else if (role === "government") navigate("/dashboard");
      else navigate("/tenders");
    } catch (err) {
      const apiError = err as AxiosError<ApiErrorResponse>;
      const message = apiError.response?.data?.message ?? "Login failed. Please try again.";
      const lower = message.toLowerCase();
      if (lower.includes("pending")) {
        setPendingMessage("Your account is pending admin approval. You'll receive an email within 72 hours.");
      } else {
        setError(message);
      }

      const issues = apiError.response?.data?.errors ?? [];
      setFieldErrors({
        email: issues.find((issue) => issue.field === "email")?.message,
        password: issues.find((issue) => issue.field === "password")?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-64px)] md:grid-cols-2">
      <section className="flex flex-col justify-between bg-green-dark p-12 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-accent">Secure Login | Official Platform</p>
          <h1 className="mt-5 font-syne text-[clamp(2.4rem,4.5vw,3.8rem)] font-extrabold tracking-tight">
            Welcome back to <span className="text-green-accent">TenderNepal</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm text-white/80">
            Access Nepal&apos;s official procurement platform to publish tenders, submit bids, and track outcomes securely.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              [String(platformStats?.openTenders ?? 0), "Active tenders"],
              [formatCompactCurrency(platformStats?.totalTenderValue ?? 0), "Total value"],
              [String(platformStats?.registeredBusinesses ?? 0), "Businesses"],
              [String(platformStats?.governmentOffices ?? 0), "Gov offices"],
            ].map((item) => (
              <div key={item[1]} className="rounded-lg border border-white/10 bg-white/6 p-4">
                <p className="font-syne text-2xl font-extrabold text-green-accent">{item[0]}</p>
                <p className="mt-1 text-xs text-white/70">{item[1]}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30">Copyright 2026 TenderNepal | Government of Nepal</p>
      </section>

      <section className="bg-white p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-green-mid">Access your account</p>
        <h2 className="mt-3 font-syne text-4xl font-extrabold tracking-tight text-gray-900">Login</h2>
        <p className="mt-2 text-sm text-gray-500">
          New on TenderNepal? <Link to="/register" className="font-semibold text-green-main">Create an account</Link>
        </p>

        {successMessage ? (
          <div className="mt-6 rounded-lg border border-green-main/20 bg-green-light p-4 text-sm text-green-main">
            Registration submitted successfully. Please login after admin approval.
          </div>
        ) : null}

        {pendingMessage ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{pendingMessage}</div>
        ) : null}

        {error ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {fieldErrors.email ? <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {fieldErrors.password ? <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p> : null}
          </div>

          <div className="text-right">
            <button type="button" className="text-sm text-green-main">Forgot password?</button>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-gray-800 after:h-px after:flex-1 after:bg-gray-100">
          Browse publicly
        </div>
        <Link to="/tenders" className="mt-3 block text-sm text-green-main">
          View public tenders without signing in
        </Link>
      </section>
    </main>
  );
}
