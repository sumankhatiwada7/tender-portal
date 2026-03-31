import {Request} from "express"


export enum roles {
    admin = "admin",
    government = "government",
    business = "business",
}

export interface jwtpayload{
    id:string,
    role:roles
}

export interface authrequest extends Request{
  user?:jwtpayload
}