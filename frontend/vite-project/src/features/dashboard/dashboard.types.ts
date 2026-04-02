import type { SessionState } from "../auth/auth.types";

export type TenderStatus = "open" | "closed" | "awarded";
export type BidStatus = "pending" | "accepted" | "rejected";

export type TenderItem = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  budget: number;
  category: string;
  location: string;
  documents: string[];
  createdBy: string;
  status: TenderStatus;
  awardedto?: string;
};

export type BidItem = {
  id: string;
  tenderId: string;
  businessId: string;
  businessName?: string;
  businessEmail?: string;
  proposal: string;
  amount: number;
  status: BidStatus;
};

export type TenderListResponse = {
  message: string;
  success: boolean;
  tenders?: TenderItem[];
};

export type TenderResponse = {
  message: string;
  success: boolean;
  tender?: TenderItem;
};

export type BidListResponse = {
  message: string;
  success: boolean;
  bids?: BidItem[];
};

export type ApiMessageResponse = {
  message?: string;
  success?: boolean;
  sucess?: boolean;
  errors?: Array<{ field?: string; message: string }>;
};

export type TenderFormValues = {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  location: string;
  status: "open" | "closed";
};

export type TenderMutationInput = {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
  location: string;
  documents: string[];
  status?: "open" | "closed";
};

export type GovernmentOutletContext = {
  session: SessionState;
  onLogout: () => void;
};
