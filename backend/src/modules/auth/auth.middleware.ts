import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import {jwtpayload,authrequest, roles} from "./authtype";
import  {apitype} from "../../core/types/apitype"
export const authMiddleware = (req: authrequest, res: Response, next: NextFunction) => {
    try{
     const authHeader = req.headers.authorization;
     if (!authHeader || !authHeader.startsWith("Bearer ")){
        const payload :apitype ={
            message:"Authorization header missing or invalid",
            sucess: false
        }
        return res.status(401).json(payload);
    }
        const token=authHeader.slice(7).trim();
        if(!token){
            const payload:apitype={
                message:"Token missing",
                sucess:false
            }
            return res.status(401).json(payload);
        }
        if(!process.env.jwtkey){
            const payload:apitype={
                message:"JWT secret not configured",
                sucess:false
            }
            return res.status(500).json(payload);
        }
        const decoded=Jwt.verify(token,process.env.jwtkey) as unknown as jwtpayload;
        req.user=decoded;
        next();

     }
    catch(_error)
    {
        console.log(_error);
        const payload:apitype={
            message:"Invalid token",
            sucess:false
        }
        return res.status(401).json(payload);
    }
}

export const authorizeRoles = (allowedRoles: roles[]) => {
    return(req: authrequest, res: Response, next: NextFunction)=>{
        try{
            const userRole = req.user?.role;
            if(!userRole){
                const payload:apitype={
                    message:"User role not found",
                    sucess:false
                }
                return res.status(403).json(payload);
            }
            if(!allowedRoles.includes(userRole as unknown as roles)){
                const payload:apitype={
                    message:'Access denied: insufficient permissions',
                    sucess:false
                }
                return res.status(403).json(payload);

            }
            next();

        }catch(_error){

        const payload:apitype={
            message:"Authorization error",
            sucess:false
        }
        return res.status(403).json(payload);
        }
    }
}
