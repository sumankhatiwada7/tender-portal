import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { register } from "../../api/auth.api";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import type { ApiErrorResponse } from "../../api/types";

type Role = "business" | "government";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("business");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    registrationNumber: "",
    panNumber: "",
    officeAddress: "",
    representative: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const nextErrors: Record<string, string> = {};

    if (!form.name) nextErrors.name = "Organisation name is required";
    if (!form.email) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords must match";
    if (files.length === 0) nextErrors.verificationDocs = "At least one verification document is required";

    if (role === "business") {
      if (!form.registrationNumber) nextErrors.registrationNumber = "Registration number is required";
      if (!form.panNumber) nextErrors.panNumber = "PAN number is required";
    }

    if (role === "government") {
      if (!form.officeAddress) nextErrors.officeAddress = "Office address is required";
      if (!form.representative) nextErrors.representative = "Representative name is required";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("password", form.password);
      payload.append("role", role);

      if (role === "business") {
        payload.append("registrationNumber", form.registrationNumber);
        payload.append("panNumber", form.panNumber);
      } else {
        payload.append("officeAddress", form.officeAddress);
        payload.append("representative", form.representative);
      }

      files.forEach((file) => payload.append("verificationDocs", file));
      await register(payload);
      navigate("/login?registered=1");
    } catch (err) {
      const apiError = err as AxiosError<ApiErrorResponse>;
      if (!apiError.response) {
        setError("Cannot reach the server. Ensure backend is running and VITE_API_URL is correct.");
      } else {
        setError(apiError.response.data?.message ?? "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-64px)] grid-cols-2">
      <section className="flex flex-col justify-between bg-green-dark p-12 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-accent">Join the platform</p>
          <h1 className="mt-5 font-syne text-[clamp(2.4rem,4.5vw,3.8rem)] font-extrabold tracking-tight">Register for TenderNepal</h1>
          <p className="mt-4 max-w-lg text-sm text-white/80">Create your account to participate in secure and transparent procurement.</p>
          <div className="mt-8 space-y-3">
            {["Fill in your details", "Upload verification documents", "Admin reviews within 72hrs"].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-accent text-sm font-bold text-green-dark">
                  {index + 1}
                </span>
                <span className="text-sm text-white/90">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30">© 2026 TenderNepal · Government of Nepal</p>
      </section>

      <section className="max-h-[calc(100vh-64px)] overflow-y-auto bg-white p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-green-mid">Create account</p>
        <h2 className="mt-3 font-syne text-4xl font-extrabold tracking-tight text-gray-900">Register</h2>
        <p className="mt-2 text-sm text-gray-500">
          Already registered? <Link to="/login" className="font-semibold text-green-main">Login</Link>
        </p>

        {error ? <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("business")}
              className={`rounded-xl border-[1.5px] p-4 text-left ${role === "business" ? "border-green-main bg-green-light" : "border-gray-200"}`}
            >
              <p className="text-lg">🏢</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">Business</p>
              <p className="text-xs text-gray-500">Bid on tenders</p>
            </button>
            <button
              type="button"
              onClick={() => setRole("government")}
              className={`rounded-xl border-[1.5px] p-4 text-left ${role === "government" ? "border-green-main bg-green-light" : "border-gray-200"}`}
            >
              <p className="text-lg">🏛</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">Government</p>
              <p className="text-xs text-gray-500">Publish tenders</p>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input placeholder="Organisation name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {fieldErrors.name ? <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p> : null}
            </div>
            <div>
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {fieldErrors.email ? <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {fieldErrors.password ? <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p> : null}
            </div>
            <div>
              <Input
                placeholder="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              {fieldErrors.confirmPassword ? <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p> : null}
            </div>
          </div>

          {role === "business" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="Registration number"
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                />
                {fieldErrors.registrationNumber ? <p className="mt-1 text-xs text-red-500">{fieldErrors.registrationNumber}</p> : null}
              </div>
              <div>
                <Input placeholder="PAN number" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} />
                {fieldErrors.panNumber ? <p className="mt-1 text-xs text-red-500">{fieldErrors.panNumber}</p> : null}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="Office address"
                  value={form.officeAddress}
                  onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                />
                {fieldErrors.officeAddress ? <p className="mt-1 text-xs text-red-500">{fieldErrors.officeAddress}</p> : null}
              </div>
              <div>
                <Input
                  placeholder="Representative name"
                  value={form.representative}
                  onChange={(e) => setForm({ ...form, representative: e.target.value })}
                />
                {fieldErrors.representative ? <p className="mt-1 text-xs text-red-500">{fieldErrors.representative}</p> : null}
              </div>
            </div>
          )}

          <label className="block cursor-pointer rounded-xl border-[1.5px] border-dashed border-gray-300 p-4 hover:bg-gray-50">
            <p className="text-sm font-semibold text-gray-800">Upload verification documents</p>
            <p className="mt-1 text-xs text-gray-500">Business cert, PAN certificate · PDF, JPG, PNG · Max 10MB each</p>
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            {files.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-gray-600">
                {files.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            ) : null}
          </label>
          {fieldErrors.verificationDocs ? <p className="-mt-3 text-xs text-red-500">{fieldErrors.verificationDocs}</p> : null}

          <Button className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account & submit for review →"}
          </Button>
          <p className="text-xs text-gray-500">By continuing, you agree to procurement compliance and verification checks.</p>
        </form>
      </section>
    </main>
  );
}
