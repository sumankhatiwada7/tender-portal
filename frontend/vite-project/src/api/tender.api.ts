import api from "./axios";
import type { Tender } from "./types";

type TenderListResponse = { tenders?: Tender[]; tender?: Tender[] };
type TenderResponse = { tender: Tender };

export async function getAll(params?: Record<string, string>) {
  try {
    const response = await api.get<TenderListResponse>("/tender/public", { params });
    return response.data.tenders ?? [];
  } catch {
    const fallback = await api.get<TenderListResponse>("/tender", { params });
    return fallback.data.tenders ?? [];
  }
}

export async function getById(id: string) {
  try {
    const response = await api.get<TenderResponse>(`/tender/public/${id}`);
    return response.data.tender;
  } catch {
    const fallback = await api.get<TenderResponse>(`/tender/${id}`);
    return fallback.data.tender;
  }
}

export async function create(formData: FormData) {
  const response = await api.post<TenderResponse>("/tender", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.tender;
}

export async function update(id: string, data: Record<string, unknown>) {
  const response = await api.put<TenderResponse>(`/tender/update/${id}`, data);
  return response.data.tender;
}

export function remove(id: string) {
  return api.post(`/tender/delete/${id}`);
}
