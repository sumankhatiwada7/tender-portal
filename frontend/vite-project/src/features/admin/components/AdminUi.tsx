import type { ReactNode } from "react";
import { DashboardIcon } from "../../dashboard/components/DashboardUi";
import type { AdminPaymentStatus, AdminUserStatus } from "../admin.types";

type ChartPoint = {
  label: string;
  value: number;
};

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={["rounded-lg border border-slate-200 bg-white shadow-sm", className].join(" ")}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "sky",
}: {
  label: string;
  value: string;
  detail: string;
  icon: "grid" | "gavel" | "building" | "cash";
  tone?: "sky" | "emerald" | "amber" | "slate";
}) {
  const tones = {
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return (
    <AdminCard className="p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className={["grid h-11 w-11 place-items-center rounded-lg ring-1", tones[tone]].join(" ")}>
          <DashboardIcon className="h-5 w-5" name={icon} />
        </div>
      </div>
    </AdminCard>
  );
}

export function StatusPill({ status }: { status: AdminUserStatus | AdminPaymentStatus }) {
  const tones = {
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    failed: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return (
    <span className={["inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset", tones[status]].join(" ")}>
      {status}
    </span>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative min-w-[220px] flex-1">
      <span className="sr-only">Search</span>
      <DashboardIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" name="search" />
      <input
        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function FilterSelect<TValue extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: TValue;
  onChange: (value: TValue) => void;
  options: Array<{ label: string; value: TValue }>;
}) {
  return (
    <label className="flex min-w-[160px] flex-col gap-1.5 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <select
        className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className="grid animate-pulse gap-4 border-b border-slate-100 p-4 last:border-b-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} key={rowIndex}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <div className="h-4 rounded bg-slate-100" key={columnIndex} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-white text-slate-500 shadow-sm">
        <DashboardIcon className="h-5 w-5" name="folder" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function AreaChart({ data, stroke = "#2563eb" }: { data: ChartPoint[]; stroke?: string }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 300 : (index / (data.length - 1)) * 600;
    const y = 180 - (item.value / maxValue) * 150;
    return `${x},${y}`;
  });
  const areaPath = `M${points.join(" L")} L600,190 L0,190 Z`;

  return (
    <div className="h-64">
      <svg className="h-full w-full overflow-visible" viewBox="0 0 600 220" role="img" aria-label="Area chart">
        <defs>
          <linearGradient id={`area-${stroke.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 8" />
        ))}
        <path d={areaPath} fill={`url(#area-${stroke.replace("#", "")})`} />
        <polyline fill="none" points={points.join(" ")} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        {data.map((item, index) => {
          const x = data.length === 1 ? 300 : (index / (data.length - 1)) * 600;
          const y = 180 - (item.value / maxValue) * 150;
          return (
            <g key={item.label}>
              <circle cx={x} cy={y} fill="#fff" r="5" stroke={stroke} strokeWidth="3" />
              <text fill="#64748b" fontSize="20" textAnchor="middle" x={x} y="216">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function BarChart({ data, color = "#0f766e" }: { data: ChartPoint[]; color?: string }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="flex h-64 items-end gap-3">
      {data.map((item) => (
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={item.label}>
          <div className="flex h-48 w-full items-end rounded-lg bg-slate-50 px-2">
            <div
              className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
              style={{
                backgroundColor: color,
                height: `${Math.max(6, (item.value / maxValue) * 100)}%`,
              }}
              title={`${item.label}: ${item.value}`}
            />
          </div>
          <span className="truncate text-xs font-medium text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ paid, pending, failed }: { paid: number; pending: number; failed: number }) {
  const total = Math.max(paid + pending + failed, 1);
  const paidDash = (paid / total) * 100;
  const pendingDash = (pending / total) * 100;

  return (
    <div className="flex items-center gap-6">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 42 42" role="img" aria-label="Payment status chart">
        <circle cx="21" cy="21" fill="none" r="15.915" stroke="#e2e8f0" strokeWidth="5" />
        <circle cx="21" cy="21" fill="none" r="15.915" stroke="#10b981" strokeDasharray={`${paidDash} ${100 - paidDash}`} strokeWidth="5" />
        <circle
          cx="21"
          cy="21"
          fill="none"
          r="15.915"
          stroke="#f59e0b"
          strokeDasharray={`${pendingDash} ${100 - pendingDash}`}
          strokeDashoffset={-paidDash}
          strokeWidth="5"
        />
        <circle
          cx="21"
          cy="21"
          fill="none"
          r="15.915"
          stroke="#e11d48"
          strokeDasharray={`${(failed / total) * 100} ${100 - (failed / total) * 100}`}
          strokeDashoffset={-(paidDash + pendingDash)}
          strokeWidth="5"
        />
      </svg>
      <div className="space-y-3 text-sm">
        {[
          ["Paid", paid, "bg-emerald-500"],
          ["Pending", pending, "bg-amber-500"],
          ["Failed", failed, "bg-rose-600"],
        ].map(([label, value, colorClass]) => (
          <div className="flex items-center gap-2" key={label}>
            <span className={["h-2.5 w-2.5 rounded-full", colorClass].join(" ")} />
            <span className="font-medium text-slate-700">{label}</span>
            <span className="text-slate-500">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
