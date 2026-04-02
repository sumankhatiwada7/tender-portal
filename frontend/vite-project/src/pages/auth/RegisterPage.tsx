import axios from "axios";
import { useState } from "react";
import { useForm, type FieldPath, type RegisterOptions } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_BASE_PATH } from "../../features/auth/auth.config";
import { parseAuthError } from "../../features/auth/auth.utils";
import type { AuthFormValues, RegisterResponse } from "../../features/auth/auth.types";
import AuthShell from "../../features/auth/components/AuthShell";
import FeedbackMessage from "../../features/auth/components/FeedbackMessage";
import InputField from "../../features/auth/components/InputField";

function RegisterPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [extraErrors, setExtraErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "business",
    },
  });

  function clearFeedback(field?: FieldPath<AuthFormValues>) {
    if (field) {
      clearErrors(field);
    }

    setFormError(null);
    setExtraErrors([]);
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

    try {
      await axios.post<RegisterResponse>(`${AUTH_BASE_PATH}/register`, {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });

      navigate(`/login?registered=1&email=${encodeURIComponent(values.email.trim())}`, {
        replace: true,
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

  return (
    <AuthShell
      view="register"
      title="Create your account"
      description="Create an account, choose your role, and keep backend validation visible at field level."
      topFeedback={
        <>
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
          autoComplete="name"
          type="text"
          label="Full name"
          placeholder="Alex Morgan"
          registration={registerField("name", { required: "Name is required" })}
          error={errors.name?.message}
          onValueChange={() => clearFeedback("name")}
        />

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
          autoComplete="new-password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          registration={registerField("password", { required: "Password is required" })}
          error={errors.password?.message}
          onValueChange={() => clearFeedback("password")}
        />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Account role</span>
          <select
            aria-invalid={errors.role?.message ? "true" : "false"}
            className={[
              "w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200",
              errors.role?.message
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
            ].join(" ")}
            {...registerField("role")}
          >
            <option value="business">Business</option>
            <option value="government">Government</option>
          </select>

          <div
            className={`grid transition-all duration-200 ${
              errors.role?.message ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <span className="overflow-hidden text-sm text-red-600">{errors.role?.message ?? ""}</span>
          </div>
        </label>

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
              <span>Creating account...</span>
            </>
          ) : (
            "Register"
          )}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-blue-600 transition-colors hover:text-blue-700" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
