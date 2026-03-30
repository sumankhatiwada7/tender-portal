import { Document } from "mongoose";
import { Types } from "mongoose";


export type status= "pending" | "accepted" | "rejected";

export interface BidDocument extends Document{
    id: string;
    tenderId: Types.ObjectId;
    businessId: Types.ObjectId;
    proposal: string;
    amount: number;
    status: status;
}
export type bidlist = {
    id: string;
    tenderId: string;
    businessId: string;
    proposal: string;
    amount: number;
    status: status;
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
