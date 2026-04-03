import types from "mongoose"
import { apitype  } from "./apitype"

export type userrole = "admin" | "government" | "business";
export type userstatus = "accepted" | "rejected" | "pending";

export type userdocument ={
    id:types.ObjectId,
    name:string,
    email:string,
    password:string,
    role:userrole
    status:userstatus
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
