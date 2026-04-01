import type { ReactNode } from "react";

type FeedbackMessageProps = {
  tone: "info" | "success" | "error";
  children: ReactNode;
};

const toneClasses: Record<FeedbackMessageProps["tone"], string> = {
  info: "border-blue-300/[0.3] bg-blue-400/[0.12] text-blue-100",
  success: "border-emerald-300/[0.3] bg-emerald-400/[0.12] text-emerald-100",
  error: "border-rose-300/[0.3] bg-rose-400/[0.12] text-rose-100",
};

function FeedbackMessage({ tone, children }: FeedbackMessageProps) {
  return (
    <div className={`mb-3.5 rounded-2xl border px-4 py-3.5 leading-6 ${toneClasses[tone]}`}>
      {children}
    </div>
  );
}

export default FeedbackMessage;
