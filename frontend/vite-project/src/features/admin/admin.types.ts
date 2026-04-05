import type { SessionState } from "../auth/auth.types";

export type AdminUserRole = "admin" | "government" | "business";
export type AdminUserStatus = "approved" | "rejected" | "pending";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  businessInfo?: {
    registrationNumber?: string;
    panNumber?: string;
  };
  governmentInfo?: {
    officeAddress?: string;
    representative?: string;
  };
  verificationDocs: Array<{
    url: string;
    originalname: string;
    uploadedAt?: string;
  }>;
};

export type AdminUsersResponse = {
  message?: string;
  success?: boolean;
  sucess?: boolean;
  users?: Array<{
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
  }>;
};

export type AdminApiMessage = {
  message?: string;
  success?: boolean;
  sucess?: boolean;
};

export type AdminApiFieldError = {
  field?: string;
  message: string;
};

export type AdminFieldErrors = Partial<Record<"name" | "email" | "password" | "role" | "registrationNumber" | "panNumber" | "officeAddress" | "representative", string>>;

export type AdminCreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: Exclude<AdminUserRole, "admin">;
  registrationNumber?: string;
  panNumber?: string;
  officeAddress?: string;
  representative?: string;
};

export type AdminCreateUserResponse = AdminApiMessage & {
  user?: {
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
  };
};

export type AdminOutletContext = {
  session: SessionState;
  onLogout: () => void;
};
