import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { AUTH_BASE_PATH } from "../../features/auth/auth.config";
import {
  clearSession,
  loadSession,
  parseAuthError,
  persistSession,
} from "../../features/auth/auth.utils";
import type { AuthFormValues, LoginResponse, SessionState } from "../../features/auth/auth.types";
import AuthLayout from "../../features/auth/components/AuthLayout";
import FeedbackMessage from "../../features/auth/components/FeedbackMessage";
import InputField from "../../features/auth/components/InputField";

function LoginPage() {
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [extraErrors, setExtraErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState | null>(loadSession);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    defaultValues: {
      name: "",
      email: searchParams.get("email") ?? "",
      password: "",
      role: "business",
    },
  });

  useEffect(() => {
    const prefilledEmail = searchParams.get("email");
    if (prefilledEmail) {
      setValue("email", prefilledEmail);
    }
  }, [searchParams, setValue]);

  const justRegistered = searchParams.get("registered") === "1";

  async function onSubmit(values: AuthFormValues) {
    clearErrors();
    setFormError(null);
    setExtraErrors([]);
    setSuccessMessage(null);

    try {
      const response = await axios.post<LoginResponse>(`${AUTH_BASE_PATH}/login`, {
        email: values.email.trim(),
        password: values.password,
      });

      const nextSession = {
        token: response.data.token,
        user: response.data.user,
      };

      persistSession(nextSession);
      setSession(nextSession);
      setSuccessMessage(response.data.message);
      reset({
        name: "",
        email: values.email.trim(),
        password: "",
        role: "business",
      });
    } catch (error) {
      const parsedError = parseAuthError(error);

      for (const fieldError of parsedError.fieldErrors) {
        setError(fieldError.field, {
          type: "server",
          message: fieldError.message,
        });
      }

      setFormError(parsedError.message);
      setExtraErrors(parsedError.extraErrors);
    }
  }

  function handleSignOut() {
    clearSession();
    setSession(null);
    setSuccessMessage("Stored session cleared.");
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to continue into the queue system."
      topFeedback={
        <>
          {justRegistered ? (
            <FeedbackMessage tone="info">
              Registration succeeded. You can sign in right away with the same email.
            </FeedbackMessage>
          ) : null}

          {successMessage ? <FeedbackMessage tone="success">{successMessage}</FeedbackMessage> : null}

          {formError ? <FeedbackMessage tone="error">{formError}</FeedbackMessage> : null}

          {extraErrors.length > 0 ? (
            <FeedbackMessage tone="error">
              <ul className="list-disc pl-5">
                {extraErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </FeedbackMessage>
          ) : null}
        </>
      }
      bottomContent={
        session ? (
          <div className="mt-5 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.82rem] uppercase tracking-[0.08em] text-teal-100/[0.9]">
                Stored session
              </p>
              <h3 className="mt-1 text-lg font-semibold">{session.user.name}</h3>
              <p className="mt-1 text-sm text-stone-200/[0.8]">{session.user.email}</p>
              <p className="mt-1 text-sm text-stone-200/[0.8]">{session.user.role.join(", ")}</p>
            </div>
            <button
              className="rounded-2xl bg-white/[0.08] px-4 py-3 text-sm font-medium text-stone-100 transition hover:-translate-y-0.5 hover:bg-white/[0.12]"
              type="button"
              onClick={handleSignOut}
            >
              Clear session
            </button>
          </div>
        ) : null
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Email"
          type="email"
          placeholder="alex@company.com"
          registration={register("email", { required: "Email is required" })}
          error={errors.email?.message}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
          registration={register("password", { required: "Password is required" })}
          error={errors.password?.message}
        />

        <button
          className="mt-2 rounded-2xl bg-gradient-to-br from-teal-200 to-teal-500 px-4 py-4 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
