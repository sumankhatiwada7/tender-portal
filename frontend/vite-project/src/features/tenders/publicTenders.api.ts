import axios from "axios";
import { API_BASE_URL } from "../auth/auth.config";
import type { TenderItem, TenderListResponse } from "../dashboard/dashboard.types";
import { getApiErrorMessage } from "../dashboard/dashboard.utils";
import { clearSession, loadSession } from "../auth/auth.utils";

const PUBLIC_TENDER_PATH = `${API_BASE_URL}/api/v1/tender/public`;
const BID_BASE_PATH = `${API_BASE_URL}/api/v1/bid`;

type TenderResponse = {
  message: string;
  success: boolean;
  tender?: TenderItem;
};

export async function fetchPublicTenders() {
  try {
    const response = await axios.get<TenderListResponse>(PUBLIC_TENDER_PATH);
    return response.data.tenders ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load public tenders."));
  }
}

export async function fetchPublicTenderById(id: string) {
  try {
    const response = await axios.get<TenderResponse>(`${PUBLIC_TENDER_PATH}/${id}`);
    if (!response.data.tender) {
      throw new Error("Tender not found.");
    }

    return response.data.tender;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load tender details."));
  }
}

export async function submitBusinessBid(tenderId: string, payload: { proposal: string; amount: number }) {
  const session = loadSession();

  if (!session?.token) {
    throw new Error("Please sign in as a business user to place a bid.");
  }

  try {
    await axios.post(`${BID_BASE_PATH}/create/${tenderId}`, payload, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearSession();
    }

    throw new Error(getApiErrorMessage(error, "Unable to submit your bid."));
  }
}

export function sortOpenFirst(tenders: TenderItem[]) {
  const statusWeight: Record<TenderItem["status"], number> = {
    open: 0,
    closed: 1,
    awarded: 2,
  };

  return [...tenders].sort((a, b) => {
    const statusDiff = statusWeight[a.status] - statusWeight[b.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
  });
}
