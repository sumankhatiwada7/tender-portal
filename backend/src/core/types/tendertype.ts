import { Document, Types } from "mongoose";


export type tenderStatus = "open" | "closed" | "awarded" ;;


export interface tenderDocument extends Document{
    _id:Types.ObjectId,
    title:string,
    description:string,
    deadline:Date,
    budget:number,
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
    Pick<tenderlist, "title" | "description" | "deadline" | "budget" | "status">
>;

export type tenderListResponse ={
    message:string,
    success:boolean,
    tenders?:tenderlist[]

}
