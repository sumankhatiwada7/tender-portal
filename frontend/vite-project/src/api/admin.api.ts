import api from "./axios";
import type { ApiUser } from "./types";

type UsersResponse = { users?: ApiUser[] };

export async function getAllUsers() {
  try {
    const response = await api.get<UsersResponse>("/admin/users");
    return response.data.users ?? [];
  } catch {
    const fallback = await api.get<UsersResponse>("/admin/all-users");
    return fallback.data.users ?? [];
  }
}

export async function getPendingUsers() {
  try {
    const response = await api.get<UsersResponse>("/admin/users/pending");
    return response.data.users ?? [];
  } catch {
    const fallback = await api.get<UsersResponse>("/admin/pending-users");
    return fallback.data.users ?? [];
  }
}

export function approveUser(id: string) {
  return api.patch(`/admin/users/${id}/approve`);
}

export function rejectUser(id: string) {
  return api.patch(`/admin/users/${id}/reject`);
}
