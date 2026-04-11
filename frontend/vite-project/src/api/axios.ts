import axios from "axios";
import { authStorageKey } from "../store/auth.store";

const explicitApiUrl = (import.meta.env.VITE_API_URL ?? "").trim();
const legacyBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");

const instance = axios.create({
  baseURL: explicitApiUrl || (legacyBaseUrl ? `${legacyBaseUrl}/api/v1` : "http://localhost:5000/api/v1"),
  withCredentials: true,
});

function readStoredAuth() {
  const raw = localStorage.getItem(authStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { user?: unknown; token?: string };
  } catch {
    localStorage.removeItem(authStorageKey);
    return null;
  }
}

function persistAccessToken(token: string) {
  const parsed = readStoredAuth();
  if (!parsed?.user) {
    return;
  }

  const updated = { ...parsed, token };
  localStorage.setItem(authStorageKey, JSON.stringify(updated));
  localStorage.setItem("queue-system-auth", JSON.stringify(updated));
}

instance.interceptors.request.use((config) => {
  const parsed = readStoredAuth();
  if (parsed?.token) {
    config.headers.Authorization = `Bearer ${parsed.token}`;
  }

  config.withCredentials = true;
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;

    const requestUrl = String(originalRequest?.url ?? "");
    const isRefreshRequest = requestUrl.includes("/auth/refresh");

    if (status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await instance.post("/auth/refresh", {});
        const newToken =
          refreshResponse.data?.token ||
          refreshResponse.data?.accessToken ||
          refreshResponse.data?.accesstoken;

        if (!newToken) {
          throw new Error("No access token returned from refresh endpoint");
        }

        persistAccessToken(String(newToken));
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch {
        localStorage.removeItem(authStorageKey);
        localStorage.removeItem("queue-system-auth");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    if (status === 401 && isRefreshRequest) {
      localStorage.removeItem(authStorageKey);
      localStorage.removeItem("queue-system-auth");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
