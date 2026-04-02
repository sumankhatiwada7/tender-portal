import axios from "axios";
import type { BidItem, TenderItem, TenderStatus } from "./dashboard.types";

export function filterTendersForGovernment(tenders: TenderItem[], governmentId: string) {
  return tenders.filter((tender) => tender.createdBy === governmentId);
}

export function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<{ message?: string; errors?: Array<{ message: string }> }>(error)) {
    return fallback;
  }

  const responseMessage = error.response?.data?.message;
  if (responseMessage) {
    return responseMessage;
  }

  const firstIssue = error.response?.data?.errors?.[0]?.message;
  if (firstIssue) {
    return firstIssue;
  }

  if (!error.response) {
    return "Unable to reach the backend. Make sure the API server is running.";
  }

  return fallback;
}

export function getTenderStatusTone(status: TenderStatus) {
  switch (status) {
    case "open":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "closed":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "awarded":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
}

export function getBidStatusTone(status: BidItem["status"]) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "accepted":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 ring-rose-200";
  }
}

export function matchesSearch(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}
