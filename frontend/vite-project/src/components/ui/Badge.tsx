import type { ReactNode } from "react";

type BadgeVariant = "open" | "awarded" | "closed" | "pending" | "approved" | "accepted" | "rejected";

const classes: Record<BadgeVariant, string> = {
  open: "bg-green-light text-green-main text-xs font-semibold px-3 py-1 rounded-full",
  awarded: "bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full",
  closed: "bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full",
  pending: "bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full",
  approved: "bg-green-light text-green-main text-xs font-semibold px-3 py-1 rounded-full",
  accepted: "bg-green-light text-green-main text-xs font-semibold px-3 py-1 rounded-full",
  rejected: "bg-red-50 text-red-600 text-xs font-semibold px-3 py-1 rounded-full",
};

export default function Badge({ variant, children }: { variant: BadgeVariant | string; children: ReactNode }) {
  const resolved = classes[variant as BadgeVariant] ?? classes.closed;
  return <span className={resolved}>{children}</span>;
}
