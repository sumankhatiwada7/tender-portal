import axios from "axios";
import { API_BASE_URL } from "../auth/auth.config";
import { clearSession, loadSession } from "../auth/auth.utils";
import type {
  ApiMessageResponse,
  BidListResponse,
  TenderItem,
  TenderListResponse,
  TenderMutationInput,
  TenderResponse,
} from "./dashboard.types";
import { getApiErrorMessage } from "./dashboard.utils";

const TENDER_BASE_PATH = `${API_BASE_URL}/api/v1/tender`;
const BID_BASE_PATH = `${API_BASE_URL}/api/v1/bid`;

function getAuthorizedConfig() {
  const session = loadSession();

  if (!session?.token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  };
}

function normalizeApiFailure(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    clearSession();
  }

  return new Error(getApiErrorMessage(error, fallback));
}

export async function fetchTenders() {
  try {
    const response = await axios.get<TenderListResponse>(TENDER_BASE_PATH, getAuthorizedConfig());
    return response.data.tenders ?? [];
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to load tenders.");
  }
}

export async function createTender(input: TenderMutationInput) {
  try {
    const response = await axios.post<TenderResponse>(`${TENDER_BASE_PATH}/create`, input, getAuthorizedConfig());
    return response.data.tender as TenderItem;
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to create the tender.");
  }
}

export async function updateTender(id: string, input: TenderMutationInput) {
  try {
    const response = await axios.put<TenderResponse>(`${TENDER_BASE_PATH}/update/${id}`, input, getAuthorizedConfig());
    return response.data.tender as TenderItem;
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to update the tender.");
  }
}

export async function deleteTender(id: string) {
  try {
    await axios.post<ApiMessageResponse>(`${TENDER_BASE_PATH}/delete/${id}`, {}, getAuthorizedConfig());
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to delete the tender.");
  }
}

export async function fetchBidsForTender(tenderId: string) {
  try {
    const response = await axios.get<BidListResponse>(`${BID_BASE_PATH}/tender/${tenderId}`, getAuthorizedConfig());
    return response.data.bids ?? [];
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to load bids for this tender.");
  }
}

export async function acceptBid(tenderId: string, bidId: string) {
  try {
    await axios.post<ApiMessageResponse>(`${BID_BASE_PATH}/accept/${tenderId}/${bidId}`, {}, getAuthorizedConfig());
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to accept the bid.");
  }
}

export async function rejectBid(tenderId: string, bidId: string) {
  try {
    await axios.post<ApiMessageResponse>(`${BID_BASE_PATH}/reject/${tenderId}/${bidId}`, {}, getAuthorizedConfig());
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to reject the bid.");
  }
}
