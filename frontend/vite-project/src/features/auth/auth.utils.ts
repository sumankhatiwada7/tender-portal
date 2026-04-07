import axios from "axios";
import type { FieldPath } from "react-hook-form";
import { AUTH_STORAGE_KEY } from "./auth.config";
import type {
  AppRole,
  ApiErrorResponse,
  AuthFormValues,
  ParsedAuthError,
  SessionState,
} from "./auth.types";

const NEW_AUTH_STORAGE_KEY = "tendernepal_auth";

function normalizeSession(raw: unknown): SessionState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const parsed = raw as {
    token?: string;
    user?: { id?: string; name?: string; email?: string; role?: string | string[] };
  };

  if (!parsed.token || !parsed.user?.id || !parsed.user.name || !parsed.user.email) {
    return null;
  }

  const role = Array.isArray(parsed.user.role) ? parsed.user.role[0] : parsed.user.role;
  if (!role) {
    return null;
  }

  return {
    token: parsed.token,
    user: {
      id: parsed.user.id,
      name: parsed.user.name,
      email: parsed.user.email,
      role: role as AppRole,
    },
  };
}

export function loadSession(): SessionState | null {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const normalized = normalizeSession(JSON.parse(raw));
      if (normalized) {
        return normalized;
      }
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  const newRaw = window.localStorage.getItem(NEW_AUTH_STORAGE_KEY);
  if (!newRaw) {
    return null;
  }

  try {
    const normalized = normalizeSession(JSON.parse(newRaw));
    if (!normalized) {
      window.localStorage.removeItem(NEW_AUTH_STORAGE_KEY);
      return null;
    }

    // Keep legacy key in sync for old dashboard shells.
    persistSession(normalized);
    return normalized;
  } catch {
    window.localStorage.removeItem(NEW_AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(NEW_AUTH_STORAGE_KEY);
}

export function persistSession(session: SessionState) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.setItem(
    NEW_AUTH_STORAGE_KEY,
    JSON.stringify({
      token: session.token,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: [session.user.role],
        status: "approved",
      },
    }),
  );
}

export function getHomeRouteForRole(role?: AppRole | string) {
  if (role === "government") {
    return "/government";
  }

  if (role === "admin") {
    return "/admin";
  }

  return "/";
}

export function getHomeRouteForSession(session: SessionState | null) {
  return getHomeRouteForRole(session?.user.role);
}

export function parseAuthError(error: unknown): ParsedAuthError {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      message: "Something went wrong. Please try again.",
      fieldErrors: [],
      extraErrors: [],
    };
  }

  if (!error.response) {
    return {
      message: "Unable to reach the backend. Make sure the API server is running.",
      fieldErrors: [],
      extraErrors: [],
    };
  }

  const data = error.response.data;
  const fieldErrors: Array<{ field: FieldPath<AuthFormValues>; message: string }> = [];
  const extraErrors: string[] = [];

  for (const issue of data.errors ?? []) {
    if (issue.field && isAuthField(issue.field)) {
      fieldErrors.push({ field: issue.field, message: issue.message });
      continue;
    }

    extraErrors.push(issue.message);
  }

  return {
    message: data.message ?? "Request failed. Please try again.",
    fieldErrors,
    extraErrors,
  };
}

function isAuthField(value: string): value is FieldPath<AuthFormValues> {
  return (
    value === "name" ||
    value === "email" ||
    value === "password" ||
    value === "role" ||
    value === "registrationNumber" ||
    value === "panNumber" ||
    value === "officeAddress" ||
    value === "representative" ||
    value === "verificationDocs"
  );
}
