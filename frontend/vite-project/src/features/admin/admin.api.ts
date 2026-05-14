import axios from "axios";
import { API_BASE_URL } from "../auth/auth.config";
import { clearSession, loadSession } from "../auth/auth.utils";
import { getApiErrorMessage } from "../dashboard/dashboard.utils";
import type {
  AdminApiFieldError,
  AdminApiMessage,
  AdminCreateUserPayload,
  AdminCreateUserResponse,
  AdminFieldErrors,
  AdminOverviewResponse,
  AdminPayment,
  AdminPaymentsResponse,
  AdminUser,
  AdminUsersResponse,
} from "./admin.types";

const ADMIN_BASE_PATH = `${API_BASE_URL}/api/v1/admin`;

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

type AdminRequestError = Error & {
  fieldErrors?: AdminFieldErrors;
};

function toFieldErrors(rawErrors: unknown): AdminFieldErrors {
  const errorsArray = Array.isArray(rawErrors) ? (rawErrors as AdminApiFieldError[]) : [];
  const mapped: AdminFieldErrors = {};

  for (const item of errorsArray) {
    if (!item?.field || !item?.message) {
      continue;
    }

    if (
      item.field === "name" ||
      item.field === "email" ||
      item.field === "password" ||
      item.field === "role" ||
      item.field === "registrationNumber" ||
      item.field === "panNumber" ||
      item.field === "officeAddress" ||
      item.field === "representative"
    ) {
      mapped[item.field] = item.message;
    }
  }

  return mapped;
}

function normalizeApiFailure(error: unknown, fallback: string): AdminRequestError {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    clearSession();
  }

  const message = getApiErrorMessage(error, fallback);
  const normalizedError = new Error(message) as AdminRequestError;

  if (axios.isAxiosError(error)) {
    const raw = error.response?.data as { errors?: unknown } | undefined;
    const fieldErrors = toFieldErrors(raw?.errors);
    if (Object.keys(fieldErrors).length > 0) {
      normalizedError.fieldErrors = fieldErrors;
    }
  }

  return normalizedError;
}

function toAdminUser(raw: {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  businessInfo?: {
    registrationNumber?: string;
    panNumber?: string;
  };
  governmentInfo?: {
    officeAddress?: string;
    representative?: string;
  };
  verificationDocs?: Array<{
    url?: string;
    originalname?: string;
    uploadedAt?: string;
  }>;
  createdAt?: string;
}): AdminUser {
  const role = raw.role === "admin" || raw.role === "government" || raw.role === "business" ? raw.role : "business";
  const status = raw.status === "approved" || raw.status === "rejected" || raw.status === "pending" ? raw.status : "pending";

  return {
    id: raw.id ?? raw._id ?? "",
    name: raw.name ?? "Unknown user",
    email: raw.email ?? "N/A",
    role,
    status,
    createdAt: raw.createdAt,
    businessInfo: {
      registrationNumber: raw.businessInfo?.registrationNumber,
      panNumber: raw.businessInfo?.panNumber,
    },
    governmentInfo: {
      officeAddress: raw.governmentInfo?.officeAddress,
      representative: raw.governmentInfo?.representative,
    },
    verificationDocs: Array.isArray(raw.verificationDocs)
      ? raw.verificationDocs
          .filter((doc) => Boolean(doc?.url) && Boolean(doc?.originalname))
          .map((doc) => ({
            url: String(doc.url),
            originalname: String(doc.originalname),
            uploadedAt: doc.uploadedAt,
          }))
      : [],
  };
}

function toAdminPayment(raw: Partial<AdminPayment>): AdminPayment {
  const status = raw.status === "paid" || raw.status === "failed" || raw.status === "pending" ? raw.status : "pending";
  const type = raw.type === "tender" ? "tender" : "bid";
  const quantity = Number(raw.quantity ?? 1);

  return {
    id: String(raw.id ?? raw.transactionId ?? ""),
    companyName: raw.companyName ?? "Unknown company",
    companyEmail: raw.companyEmail ?? "N/A",
    companyType: raw.companyType === "government" || raw.companyType === "admin" ? raw.companyType : "business",
    creditPackage: raw.creditPackage ?? `${quantity} ${type === "tender" ? "Tender" : "Bid"} Credit${quantity === 1 ? "" : "s"}`,
    type,
    quantity,
    amount: Number(raw.amount ?? 0),
    paymentMethod: raw.paymentMethod ?? "Stripe",
    transactionId: raw.transactionId ?? String(raw.id ?? ""),
    purchaseDate: raw.purchaseDate ?? new Date().toISOString(),
    status,
  };
}

export async function fetchPendingUsers() {
  try {
    const response = await axios.get<AdminUsersResponse>(`${ADMIN_BASE_PATH}/users/pending`, getAuthorizedConfig());
    return (response.data.users ?? []).map(toAdminUser).filter((user) => user.id);
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to load pending users.");
  }
}

export async function fetchAllUsers() {
  try {
    const response = await axios.get<AdminUsersResponse>(`${ADMIN_BASE_PATH}/all-users`, getAuthorizedConfig());
    return (response.data.users ?? []).map(toAdminUser).filter((user) => user.id);
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to load all users.");
  }
}

export async function fetchAdminOverview() {
  try {
    const response = await axios.get<AdminOverviewResponse>(`${ADMIN_BASE_PATH}/overview`, getAuthorizedConfig());
    return response.data.overview ?? {
      totalTenders: 0,
      activeBids: 0,
      approvedCompanies: 0,
      revenue: 0,
    };
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to load dashboard analytics.");
  }
}

export async function fetchAdminPayments() {
  try {
    const response = await axios.get<AdminPaymentsResponse>(`${ADMIN_BASE_PATH}/payments`, getAuthorizedConfig());
    return (response.data.payments ?? []).map(toAdminPayment).filter((payment) => payment.id);
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to load payment history.");
  }
}

export async function approveUser(userId: string) {
  try {
    await axios.patch<AdminApiMessage>(`${ADMIN_BASE_PATH}/users/${userId}/approve`, {}, getAuthorizedConfig());
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to approve this user.");
  }
}

export async function rejectUser(userId: string) {
  try {
    await axios.patch<AdminApiMessage>(`${ADMIN_BASE_PATH}/users/${userId}/reject`, {}, getAuthorizedConfig());
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to reject this user.");
  }
}

export async function createManagedUser(payload: AdminCreateUserPayload) {
  try {
    const response = await axios.post<AdminCreateUserResponse>(
      `${ADMIN_BASE_PATH}/create-user`,
      payload,
      getAuthorizedConfig(),
    );

    if (!response.data.user) {
      throw new Error("User created but response payload is incomplete.");
    }

    return toAdminUser(response.data.user);
  } catch (error) {
    throw normalizeApiFailure(error, "Unable to create this account.");
  }
}
