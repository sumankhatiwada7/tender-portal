import { useId, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: string;
  autoComplete?: string;
  onValueChange?: () => void;
};

function InputField({
  label,
  type,
  placeholder,
  registration,
  error,
  autoComplete,
  onValueChange,
}: InputFieldProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const isPasswordField = type === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { onChange, ...fieldProps } = registration;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>

      <div className="relative">
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? "true" : "false"}
          autoComplete={autoComplete}
          className={[
            "w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200",
            "placeholder:text-slate-400",
            isPasswordField ? "pr-16" : "",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500"
              : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
          ].join(" ")}
          placeholder={placeholder}
          type={isPasswordField && isPasswordVisible ? "text" : type}
          {...fieldProps}
          onChange={(event) => {
            onChange(event);
            onValueChange?.();
          }}
        />

        {isPasswordField ? (
          <button
            className="absolute inset-y-0 right-3 my-auto inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold text-slate-500 transition-colors duration-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
          >
            {isPasswordVisible ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>

      <div
        className={`grid transition-all duration-200 ${
          error ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <span className="overflow-hidden text-sm text-red-600" id={error ? errorId : undefined}>
          {error ?? ""}
        </span>
      </div>
    </label>
  );
}

export default InputField;
