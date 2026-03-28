import {Request} from "express"

export type roles = ["admin", "government", "business"] 

export interface jwtpayload{
    id:string,
    role:roles;
}

export interface authrequest extends Request{

}