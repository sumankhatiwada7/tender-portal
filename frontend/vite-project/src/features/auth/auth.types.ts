import type { FieldPath } from "react-hook-form";

export type RoleOption = "business" | "government";
export type AppRole = RoleOption | "admin";

export type AuthFormValues = {
  name: string;
  email: string;
  password: string;
  role: RoleOption;
  registrationNumber: string;
  panNumber: string;
  officeAddress: string;
  representative: string;
  verificationDocs: FileList | null;
};

export type ApiErrorResponse = {
  message?: string;
  sucess?: boolean;
  errors?: Array<{ field?: string; message: string }>;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
};

export type LoginResponse = {
  message: string;
  sucess: boolean;
  token: string;
  user: AuthUser;
};

export type RegisterResponse = {
  message: string;
  sucess: boolean;
  user: AuthUser;
};

export type SessionState = {
  token: string;
  user: AuthUser;
};

export type ParsedAuthError = {
  message: string;
  fieldErrors: Array<{ field: FieldPath<AuthFormValues>; message: string }>;
  extraErrors: string[];
};
