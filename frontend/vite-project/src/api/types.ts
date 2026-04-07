export type ApiIssue = { field?: string; message: string };

export type ApiErrorResponse = {
  message?: string;
  errors?: ApiIssue[];
  success?: boolean;
  sucess?: boolean;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string[] | string;
  status: string;
  businessInfo?: {
    registrationNumber?: string;
    panNumber?: string;
  };
  governmentInfo?: {
    officeAddress?: string;
    representative?: string;
  };
  verificationDocs?: Array<{
    url: string;
    originalname: string;
    uploadedAt?: string;
  }>;
  createdAt?: string;
};

export type TenderStatus = "open" | "awarded" | "closed";

export type Tender = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  budget: number;
  category: string;
  location: string;
  documents: Array<{ url: string; originalname: string; uploadedAt?: string }>;
  createdBy: string;
  status: TenderStatus;
  awardedto?: string;
};

export type BidStatus = "pending" | "accepted" | "rejected";

export type Bid = {
  id: string;
  tenderId: string;
  businessId: string;
  businessName?: string;
  businessEmail?: string;
  proposal: string;
  amount: number;
  status: BidStatus;
  documents: Array<{ url: string; originalname: string; uploadedAt?: string }>;
};

export function getRoleList(role: string[] | string | undefined) {
  if (Array.isArray(role)) return role;
  if (typeof role === "string" && role) return [role];
  return [];
}

export function getPrimaryRole(role: string[] | string | undefined) {
  const roles = getRoleList(role);
  return roles[0] ?? "";
}
