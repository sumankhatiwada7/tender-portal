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

export function loadSession(): SessionState | null {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function persistSession(session: SessionState) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
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
  return value === "name" || value === "email" || value === "password" || value === "role";
}
