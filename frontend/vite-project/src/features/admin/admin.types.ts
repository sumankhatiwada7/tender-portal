import type { SessionState } from "../auth/auth.types";

export type AdminUserRole = "admin" | "government" | "business";
export type AdminUserStatus = "accepted" | "rejected" | "pending";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
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

export type AdminFieldErrors = Partial<Record<"name" | "email" | "password" | "role", string>>;

export type AdminCreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: Exclude<AdminUserRole, "admin">;
};

export type AdminCreateUserResponse = AdminApiMessage & {
  user?: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  };
};

export type AdminOutletContext = {
  session: SessionState;
  onLogout: () => void;
};
