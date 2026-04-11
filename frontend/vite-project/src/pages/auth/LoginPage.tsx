import axios from "axios";
import { useEffect, useState } from "react";
import { useForm, type FieldPath, type RegisterOptions } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AUTH_BASE_PATH } from "../../features/auth/auth.config";
import {
  getHomeRouteForRole,
  parseAuthError,
  persistSession,
} from "../../features/auth/auth.utils";
import type { AuthFormValues, LoginResponse } from "../../features/auth/auth.types";
import AuthShell from "../../features/auth/components/AuthShell";
import FeedbackMessage from "../../features/auth/components/FeedbackMessage";
import InputField from "../../features/auth/components/InputField";

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [extraErrors, setExtraErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      }, {
        withCredentials: true,
      });

      const nextSession = {
        token: response.data.token,
        user: response.data.user,
      };

      persistSession(nextSession);
      setSuccessMessage(response.data.message);
      reset({
        name: "",
        email: values.email.trim(),
        password: "",
        role: "business",
      });

      const requestedPath = searchParams.get("next");
      const fallbackPath = getHomeRouteForRole(nextSession.user.role);
      const nextPath =
        nextSession.user.role === "government" && requestedPath?.startsWith("/government")
          ? requestedPath
          : fallbackPath;

      navigate(nextPath, { replace: true });
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

  return (
    <AuthShell
      view="login"
      title="Welcome back"
      description="Sign in to continue into Tender Nepal with secure role-based access."
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
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-green-main bg-green-main px-4 py-3.5 font-semibold text-white transition-colors duration-200 hover:bg-green-dark active:translate-y-px disabled:cursor-wait disabled:bg-green-main/40"
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

        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link className="font-semibold text-green-main transition-colors hover:text-green-dark" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
