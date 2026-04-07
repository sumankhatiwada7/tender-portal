import api from "./axios";
import type { Bid } from "./types";

type BidResponse = { bid: Bid };
type BidListResponse = { bids?: Bid[] };

export async function create(tenderId: string, formData: FormData) {
  const response = await api.post<BidResponse>(`/tender/${tenderId}/bid`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.bid;
}

export async function getForTender(tenderId: string) {
  const response = await api.get<BidListResponse>(`/bid/tender/${tenderId}`);
  return response.data.bids ?? [];
}

export async function getById(tenderId: string, bidId: string) {
  const response = await api.get<BidResponse>(`/bid/tender/${tenderId}/${bidId}`);
  return response.data.bid;
}

export function accept(tenderId: string, bidId: string) {
  return api.post(`/bid/accept/${tenderId}/${bidId}`);
}

export function reject(tenderId: string, bidId: string) {
  return api.post(`/bid/reject/${tenderId}/${bidId}`);
}

export async function getMyBids() {
  const response = await api.get<BidListResponse>("/bid/my");
  return response.data.bids ?? [];
}
