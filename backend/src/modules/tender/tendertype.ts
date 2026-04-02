import { Document, Types } from "mongoose";


export type tenderStatus = "open" | "closed" | "awarded" ;;


export interface tenderDocument extends Document{
    _id:Types.ObjectId,
    title:string,
    description:string,
    deadline:Date,
    budget:number,
    category:string,
    location:string,
    documents:string[],
    createdBy:string,
    status:tenderStatus
    awardedto?:Types.ObjectId
}
export type tenderlist ={
    id:string,
    title:string,
    description:string,
    deadline:Date,
    budget:number,
    category:string,
    location:string,
    documents:string[],
    createdBy:string,
    status:tenderStatus
    awardedto?:string
}
export type tenderResponse ={
    message:string,
    success:boolean,
    tender?:tenderlist
}

export type updateTenderInput = Partial<
    Pick<tenderlist, "title" | "description" | "deadline" | "budget" | "status" | "category" | "location" | "documents">
>;

export type tenderListResponse ={
    message:string,
    success:boolean,
    tenders?:tenderlist[]

}
