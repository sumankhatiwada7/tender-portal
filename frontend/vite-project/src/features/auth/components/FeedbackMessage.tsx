import type { ReactNode } from "react";

type FeedbackMessageProps = {
  tone: "info" | "success" | "error";
  children: ReactNode;
};

const toneClasses: Record<FeedbackMessageProps["tone"], string> = {
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700",
};

function FeedbackMessage({ tone, children }: FeedbackMessageProps) {
  return (
    <div
      className={[
        "rounded-xl border px-4 py-3 text-sm leading-6 shadow-sm transition-all duration-200",
        "[animation:fade-in-up_0.2s_ease-out]",
        toneClasses[tone],
      ].join(" ")}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export default FeedbackMessage;
