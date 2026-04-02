import { createContext, useContext, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";

type ToastInput = {
  message: string;
  tone?: ToastTone;
  title?: string;
};

type ToastRecord = ToastInput & {
  id: number;
};

const ToastContext = createContext<{ showToast: (toast: ToastInput) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  function dismissToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast(toast: ToastInput) {
    const nextToast: ToastRecord = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      tone: "info",
      ...toast,
    };

    setToasts((current) => [...current, nextToast]);

    window.setTimeout(() => {
      dismissToast(nextToast.id);
    }, 4200);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            className={[
              "pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all",
              toast.tone === "success" ? "border-emerald-200 bg-emerald-50/95 text-emerald-900" : "",
              toast.tone === "error" ? "border-rose-200 bg-rose-50/95 text-rose-900" : "",
              toast.tone === "info" ? "border-sky-200 bg-white/95 text-slate-900" : "",
            ].join(" ")}
            key={toast.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
                <p className="text-sm leading-6">{toast.message}</p>
              </div>
              <button
                className="rounded-full px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-white/70 hover:text-slate-900"
                type="button"
                onClick={() => dismissToast(toast.id)}
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
