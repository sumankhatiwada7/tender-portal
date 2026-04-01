import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AUTH_BASE_PATH } from "../../features/auth/auth.config";
import { parseAuthError } from "../../features/auth/auth.utils";
import type { AuthFormValues, RegisterResponse } from "../../features/auth/auth.types";
import AuthLayout from "../../features/auth/components/AuthLayout";
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
    <AuthLayout
      title="Create your account"
      description="Set up a new account and choose the role that fits your workflow."
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
          label="Full name"
          type="text"
          placeholder="Alex Morgan"
          registration={register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />

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

        <label className="grid gap-2">
          <span className="text-[0.95rem] text-stone-100/85">Account role</span>
          <select
            className="w-full rounded-2xl border border-white/[0.15] bg-white/5 px-4 py-4 text-stone-100 outline-none transition focus:border-teal-200/[0.9] focus:ring-4 focus:ring-teal-200/[0.15]"
            {...register("role")}
          >
            <option value="business">Business</option>
            <option value="government">Government</option>
          </select>
        </label>

        <button
          className="mt-2 rounded-2xl bg-gradient-to-br from-teal-200 to-teal-500 px-4 py-4 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
