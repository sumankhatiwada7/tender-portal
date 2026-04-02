import type { ReactNode } from "react";
import type { BidStatus, TenderStatus } from "../dashboard.types";
import { getBidStatusTone, getTenderStatusTone } from "../dashboard.utils";

type DashboardIconName =
  | "grid"
  | "plus"
  | "folder"
  | "gavel"
  | "user"
  | "logout"
  | "bell"
  | "menu"
  | "search"
  | "calendar"
  | "cash"
  | "map"
  | "upload"
  | "trash"
  | "edit"
  | "eye"
  | "check"
  | "x"
  | "building"
  | "briefcase"
  | "clock"
  | "filter"
  | "spark"
  | "shield";

export function DashboardIcon({
  name,
  className = "h-5 w-5",
}: {
  name: DashboardIconName;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
  } as const;

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <path
            d="M5.75 5.75h5v5h-5Zm7.5 0h5v5h-5Zm-7.5 7.5h5v5h-5Zm7.5 0h5v5h-5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path
            d="M4.75 8.25A1.5 1.5 0 0 1 6.25 6.75h4l1.75 1.75h5.75a1.5 1.5 0 0 1 1.5 1.5v7.75a1.5 1.5 0 0 1-1.5 1.5H6.25a1.5 1.5 0 0 1-1.5-1.5V8.25Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "gavel":
      return (
        <svg {...common}>
          <path
            d="m9.25 6.25 8.5 8.5M7 8.5l3.25-3.25 2.5 2.5L9.5 11Zm7.5 7.5 3.25-3.25 1.75 1.75-3.25 3.25ZM4.75 19.25h7.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path
            d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6.25 7.5a6.25 6.25 0 0 1 12.5 0"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 19.25H6.75a2 2 0 0 1-2-2V6.75a2 2 0 0 1 2-2H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M14 8.75 19.25 14 14 19.25M19 14H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path
            d="M12 5a4.25 4.25 0 0 0-4.25 4.25v2.28c0 .52-.16 1.03-.46 1.45l-1.04 1.47a.75.75 0 0 0 .61 1.18h10.28a.75.75 0 0 0 .61-1.18l-1.04-1.47a2.5 2.5 0 0 1-.46-1.45V9.25A4.25 4.25 0 0 0 12 5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path d="M10.25 18a1.75 1.75 0 0 0 3.5 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4.75 7.25h14.5M4.75 12h14.5M4.75 16.75h14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 3.25 3.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <path d="M8 4v3M16 4v3M5.75 7.25h12.5a1 1 0 0 1 1 1V18.5a1 1 0 0 1-1 1H5.75a1 1 0 0 1-1-1V8.25a1 1 0 0 1 1-1Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M4.75 10.5h14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "cash":
      return (
        <svg {...common}>
          <path d="M5.25 7.25h13.5a1.5 1.5 0 0 1 1.5 1.5v6.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-6.5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M12 14.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Zm-8.25-4A2.75 2.75 0 0 0 6.5 8m13.75 2.75A2.75 2.75 0 0 1 17.5 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M12 20s5.25-4.74 5.25-9A5.25 5.25 0 0 0 6.75 11c0 4.26 5.25 9 5.25 9Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <circle cx="12" cy="11" r="1.9" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V6m0 0-3.5 3.5M12 6l3.5 3.5M5 18.5v.75A1.75 1.75 0 0 0 6.75 21h10.5A1.75 1.75 0 0 0 19 19.25v-.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M5.75 7h12.5M9.5 7V5.75A.75.75 0 0 1 10.25 5h3.5a.75.75 0 0 1 .75.75V7m-7.5 0 .6 10.05A1.25 1.25 0 0 0 8.84 18.25h6.32a1.25 1.25 0 0 0 1.24-1.2L17 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="m5.5 18.5 3.25-.75L18 8.5 15.5 6 6.25 15.25l-.75 3.25ZM14.75 6.75l2.5 2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2.75 12S6.25 6.75 12 6.75 21.25 12 21.25 12 17.75 17.25 12 17.25 2.75 12 2.75 12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12.5 4.25 4.25L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4.75 19.25h14.5M7 19.25V6.75L12 4l5 2.75v12.5M9.75 10h.5m3.5 0h.5m-4 3h.5m3.5 0h.5m-7.5 6.25v-3.5h9v3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <path d="M8.25 7V5.75A1.75 1.75 0 0 1 10 4h4a1.75 1.75 0 0 1 1.75 1.75V7m-11 1h14.5a1 1 0 0 1 1 1v8.25a1 1 0 0 1-1 1H4.75a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm6.25 4h2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8.5v3.75l2.5 1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M4.75 6.25h14.5L14 12v5l-4 2v-7L4.75 6.25Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Zm6.25 11.75.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2ZM5 14l1 2.75L8.75 18 6 19l-1 2.75L4 19l-2.75-1L4 16.75 5 14Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3.75 6.75 5.5v5.25c0 4.06 2.4 7.78 6.13 9.48a.3.3 0 0 0 .24 0c3.73-1.7 6.13-5.42 6.13-9.48V5.5L12 3.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="m9.5 12.25 1.65 1.65 3.35-3.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
  }

  return null;
}

export function CardSurface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-[1.75rem] border border-slate-200/70 bg-white/92 shadow-[0_20px_60px_rgba(15,23,42,0.08)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "sky",
}: {
  label: string;
  value: string;
  detail: string;
  icon: DashboardIconName;
  tone?: "sky" | "emerald" | "slate" | "amber";
}) {
  const tones = {
    sky: "from-sky-500 to-blue-600 text-sky-50",
    emerald: "from-emerald-500 to-teal-600 text-emerald-50",
    slate: "from-slate-700 to-slate-900 text-slate-50",
    amber: "from-amber-500 to-orange-500 text-amber-50",
  };

  return (
    <CardSurface className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
        <div className={["grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br shadow-lg", tones[tone]].join(" ")}>
          <DashboardIcon className="h-6 w-6" name={icon} />
        </div>
      </div>
    </CardSurface>
  );
}

export function StatusBadge({ status }: { status: TenderStatus | BidStatus }) {
  const tone =
    status === "pending" || status === "accepted" || status === "rejected"
      ? getBidStatusTone(status)
      : getTenderStatusTone(status);

  return (
    <span className={["inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset", tone].join(" ")}>
      {status}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  icon = "folder",
  action,
}: {
  title: string;
  description: string;
  icon?: DashboardIconName;
  action?: ReactNode;
}) {
  return (
    <CardSurface className="p-10 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-slate-100 text-slate-600">
        <DashboardIcon className="h-7 w-7" name={icon} />
      </div>
      <h3 className="mt-5 text-2xl font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </CardSurface>
  );
}

export function LoadingBlock({ label = "Loading data..." }: { label?: string }) {
  return (
    <CardSurface className="p-8">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
        <div>
          <p className="text-lg font-semibold text-slate-900">{label}</p>
          <p className="text-sm text-slate-500">Please wait a moment.</p>
        </div>
      </div>
    </CardSurface>
  );
}

export function TableActionButton({
  label,
  icon,
  tone = "slate",
  onClick,
  disabled,
}: {
  label: string;
  icon: DashboardIconName;
  tone?: "slate" | "sky" | "rose" | "emerald";
  onClick: () => void;
  disabled?: boolean;
}) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950",
    sky: "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:text-sky-900",
    rose: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:text-rose-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:text-emerald-900",
  };

  return (
    <button
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all",
        tones[tone],
        disabled ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5",
      ].join(" ")}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      <DashboardIcon className="h-4 w-4" name={icon} />
      {label}
    </button>
  );
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <button
        aria-label="Close modal"
        className="absolute inset-0"
        type="button"
        onClick={onClose}
      />
      <CardSurface className="relative z-10 w-full max-w-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
          <button
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            type="button"
            onClick={onClose}
          >
            <DashboardIcon className="h-4 w-4" name="x" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </CardSurface>
    </div>
  );
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
