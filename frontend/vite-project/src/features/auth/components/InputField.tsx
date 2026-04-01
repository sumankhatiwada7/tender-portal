import type { UseFormRegisterReturn } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: string;
};

function InputField({ label, type, placeholder, registration, error }: InputFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.95rem] text-stone-100/85">{label}</span>
      <input
        className={[
          "w-full rounded-2xl border bg-white/5 px-4 py-4 text-stone-100 outline-none transition",
          "placeholder:text-stone-100/35",
          error
            ? "border-rose-300/[0.6] focus:border-rose-300/[0.8] focus:ring-4 focus:ring-rose-300/[0.15]"
            : "border-white/[0.15] focus:border-teal-200/[0.9] focus:ring-4 focus:ring-teal-200/[0.15]",
        ].join(" ")}
        type={type}
        placeholder={placeholder}
        {...registration}
      />
      {error ? <span className="text-sm text-rose-200">{error}</span> : null}
    </label>
  );
}

export default InputField;
