import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const styles: Record<Variant, string> = {
  primary:
    "bg-green-main hover:bg-green-dark text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50",
  outline:
    "border-[1.5px] border-green-main text-green-main py-3 rounded-lg text-sm font-medium hover:bg-green-light transition-colors disabled:opacity-50",
  danger:
    "border-[1.5px] border-red-300 text-red-600 py-3 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50",
};

export default function Button({ variant = "primary", children, className = "", ...props }: Props) {
  return (
    <button className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
