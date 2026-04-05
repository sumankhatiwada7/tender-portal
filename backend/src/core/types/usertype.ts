import types from "mongoose"
import { apitype  } from "./apitype"

export type userrole = "admin" | "government" | "business";
export type userstatus = "approved" | "rejected" | "pending";

export type uploadedDocument = {
    url: string,
    originalname: string,
    uploadedAt: Date,
}

export type userdocument ={
    id:types.ObjectId,
    name:string,
    email:string,
    password:string,
    role:userrole
    status:userstatus
    profileImage?: string | null,
    verificationDocs?: uploadedDocument[],
    businessInfo?: {
        registrationNumber?: string,
        panNumber?: string,
    },
    governmentInfo?: {
        officeAddress?: string,
        representative?: string,
    },
}
export type userlist={
    id:string,
    name:string,
    email:string,
    role:userrole
    status:userstatus

}
export type usersresponse= apitype &{
    users:userlist[]
}
export type userresponse = apitype &{
    user:userlist
}
