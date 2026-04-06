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
    watch,
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
      registrationNumber: "",
      panNumber: "",
      officeAddress: "",
      representative: "",
      verificationDocs: null,
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

  const roleValue = watch("role");
  const verificationDocsRegistration = registerField("verificationDocs", {
    validate: (fileList) =>
      (fileList && fileList.length > 0) || "Verification documents are required",
  });

  async function onSubmit(values: AuthFormValues) {
    clearErrors();
    setFormError(null);
    setExtraErrors([]);

    try {
      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("email", values.email.trim());
      formData.append("password", values.password);
      formData.append("role", values.role);

      if (values.role === "business") {
        formData.append("registrationNumber", values.registrationNumber.trim());
        formData.append("panNumber", values.panNumber.trim());
      }

      if (values.role === "government") {
        formData.append("officeAddress", values.officeAddress.trim());
        formData.append("representative", values.representative.trim());
      }

      const files = Array.from(values.verificationDocs ?? []);
      for (const file of files) {
        formData.append("verificationDocs", file);
      }

      await axios.post<RegisterResponse>(`${AUTH_BASE_PATH}/register`, formData);

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
      description="Register your organization and complete verification to participate in Tender Nepal."
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
          <span className="mb-2 block text-sm font-medium text-text">Account role</span>
          <select
            aria-invalid={errors.role?.message ? "true" : "false"}
            className={[
              "w-full rounded-lg border bg-white px-4 py-3 text-sm text-text shadow-sm outline-none transition-all duration-200",
              errors.role?.message
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-border focus:border-green-main focus:ring-2 focus:ring-green-main",
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

        {roleValue === "business" ? (
          <>
            <InputField
              autoComplete="off"
              type="text"
              label="Business registration number"
              placeholder="REG-12345"
              registration={registerField("registrationNumber", { required: "Registration number is required" })}
              error={errors.registrationNumber?.message}
              onValueChange={() => clearFeedback("registrationNumber")}
            />

            <InputField
              autoComplete="off"
              type="text"
              label="PAN/VAT number"
              placeholder="PAN-987654"
              registration={registerField("panNumber", { required: "PAN/VAT number is required" })}
              error={errors.panNumber?.message}
              onValueChange={() => clearFeedback("panNumber")}
            />
          </>
        ) : null}

        {roleValue === "government" ? (
          <>
            <InputField
              autoComplete="street-address"
              type="text"
              label="Office address"
              placeholder="Main Secretariat, Kathmandu"
              registration={registerField("officeAddress", { required: "Office address is required" })}
              error={errors.officeAddress?.message}
              onValueChange={() => clearFeedback("officeAddress")}
            />

            <InputField
              autoComplete="name"
              type="text"
              label="Representative name"
              placeholder="Officer Jane Doe"
              registration={registerField("representative", { required: "Representative is required" })}
              error={errors.representative?.message}
              onValueChange={() => clearFeedback("representative")}
            />
          </>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text">Verification documents</span>
          <input
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-text shadow-sm outline-none transition-all duration-200 focus:border-green-main focus:ring-2 focus:ring-green-main"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            {...verificationDocsRegistration}
            onChange={(event) => {
              verificationDocsRegistration.onChange(event);
              clearFeedback("verificationDocs");
            }}
          />
          <p className="mt-2 text-xs text-muted">Upload up to 5 files, maximum 10MB each.</p>
          <div
            className={`grid transition-all duration-200 ${
              errors.verificationDocs?.message ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <span className="overflow-hidden text-sm text-red-600">{errors.verificationDocs?.message ?? ""}</span>
          </div>
        </label>

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
              <span>Creating account...</span>
            </>
          ) : (
            "Register"
          )}
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link className="font-semibold text-green-main transition-colors hover:text-green-dark" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
