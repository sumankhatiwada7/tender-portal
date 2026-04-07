import api from "./axios";
import type { ApiUser } from "./types";

type LoginPayload = { email: string; password: string };

type LoginResponse = {
  message: string;
  token: string;
  user: ApiUser;
};

export function register(formData: FormData) {
  return api.post("/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function login(data: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}
