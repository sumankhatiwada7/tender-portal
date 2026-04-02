import types from "mongoose"
import { apitype  } from "./apitype"

export type userdocument ={
    id:types.ObjectId,
    name:string,
    email:string,
    password:string,
    role:string
}
export type userlist={
    id:string,
    name:string,
    email:string,
    role:string

}
export type usersresponse= apitype &{
    users:userlist[]
}
export type userresponse = apitype &{
    user:userlist
}
