import axios from "axios";
import { useEffect, useState } from "react";
import { useForm, type FieldPath, type RegisterOptions } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { AUTH_BASE_PATH } from "../../features/auth/auth.config";
import {
  clearSession,
  loadSession,
  parseAuthError,
  persistSession,
} from "../../features/auth/auth.utils";
import type { AuthFormValues, LoginResponse, SessionState } from "../../features/auth/auth.types";
import AuthShell from "../../features/auth/components/AuthShell";
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

  function clearFeedback(field?: FieldPath<AuthFormValues>) {
    if (field) {
      clearErrors(field);
    }

    setFormError(null);
    setExtraErrors([]);
    setSuccessMessage(null);
  }

  function registerField<TFieldName extends FieldPath<AuthFormValues>>(
    field: TFieldName,
    options?: RegisterOptions<AuthFormValues, TFieldName>,
  ) {
    return register(field, {
      ...options,
      onChange: (event) => {
        options?.onChange?.(event);
        clearFeedback(field);
      },
    });
  }

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
    <AuthShell
      view="login"
      title="Welcome back"
      description="Sign in to continue into the queue system with backend validation shown inline."
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
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Stored session
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">{session.user.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{session.user.email}</p>
              <p className="mt-1 text-sm text-slate-600">{session.user.role}</p>
            </div>
            <button
              className="mt-4 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 active:translate-y-px"
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
          autoComplete="email"
          type="email"
          label="Email address"
          placeholder="alex@company.com"
          registration={registerField("email", { required: "Email is required" })}
          error={errors.email?.message}
          onValueChange={() => clearFeedback("email")}
        />

        <InputField
          autoComplete="current-password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          registration={registerField("password", { required: "Password is required" })}
          error={errors.password?.message}
          onValueChange={() => clearFeedback("password")}
        />

        <button
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 active:translate-y-px disabled:cursor-wait disabled:bg-blue-400"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-90"
                  d="M22 12a10 10 0 0 0-10-10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            "Login"
          )}
        </button>

        <p className="text-center text-sm text-slate-600">
          New here?{" "}
          <Link className="font-semibold text-blue-600 transition-colors hover:text-blue-700" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
