import { Document } from "mongoose";
import types from "mongoose";

export type tenderStatus = "open" | "closed";


export interface tenderDocument extends Document{
    id:types.ObjectId,
    title:string,
    description:string,
    deadline:Date,
    budget:number,
    createdBy:string,
    status:tenderStatus
}
export type tenderlist ={
    id:string,
    title:string,
    description:string,
    deadline:Date,
    budget:number,
    createdBy:string,
    status:tenderStatus
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
