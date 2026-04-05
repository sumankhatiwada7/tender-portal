import { Document } from "mongoose";
import { Types } from "mongoose";


export type status= "pending" | "accepted" | "rejected";

export type uploadDocument = {
    url: string,
    originalname: string,
    uploadedAt: Date,
}

export interface BidDocument extends Document{
    id: string;
    tenderId: Types.ObjectId;
    businessId: Types.ObjectId;
    proposal: string;
    amount: number;
    status: status;
    documents: uploadDocument[];
}
export type bidlist = {
    id: string;
    tenderId: string;
    businessId: string;
    businessName?: string;
    businessEmail?: string;
    proposal: string;
    amount: number;
    status: status;
    documents: uploadDocument[];
}
export type bidlistResponse ={
    message:string,
    success:boolean,
    bid?:bidlist
}
export type bidListResponses ={
    message:string,
    success:boolean,
    bids?:bidlist[]
}
