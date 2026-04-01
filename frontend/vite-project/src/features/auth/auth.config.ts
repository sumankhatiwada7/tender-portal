export const AUTH_STORAGE_KEY = "queue-system-auth";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const AUTH_BASE_PATH = `${API_BASE_URL}/api/v1/auth`;
