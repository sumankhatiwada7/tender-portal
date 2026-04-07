import axios from "axios";
import { authStorageKey } from "../store/auth.store";

const explicitApiUrl = (import.meta.env.VITE_API_URL ?? "").trim();
const legacyBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");

const instance = axios.create({
  baseURL: explicitApiUrl || (legacyBaseUrl ? `${legacyBaseUrl}/api/v1` : "http://localhost:5000/api/v1"),
});

instance.interceptors.request.use((config) => {
  const raw = localStorage.getItem(authStorageKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { token?: string };
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      localStorage.removeItem(authStorageKey);
    }
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(authStorageKey);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
