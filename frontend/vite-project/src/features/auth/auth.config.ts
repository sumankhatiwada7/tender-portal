export const AUTH_STORAGE_KEY = "queue-system-auth";

function normalizeApiBaseUrl() {
  const explicitApiUrl = String(import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
  const baseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");

  if (baseUrl) {
    return baseUrl;
  }

  if (explicitApiUrl.endsWith("/api/v1")) {
    return explicitApiUrl.slice(0, -"/api/v1".length);
  }

  if (explicitApiUrl.endsWith("/api")) {
    return explicitApiUrl.slice(0, -"/api".length);
  }

  return explicitApiUrl;
}

export const API_BASE_URL = normalizeApiBaseUrl();
export const AUTH_BASE_PATH = `${API_BASE_URL}/api/v1/auth`;
