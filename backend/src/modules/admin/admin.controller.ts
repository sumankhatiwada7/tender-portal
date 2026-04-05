import bcrypt from "bcryptjs";
import { User } from "../user/user.model";
import {apitype} from "../../core/types/apitype"
import type { userdocument, userlist, userresponse, usersresponse } from "../../core/types/usertype";
import {Notifier} from  "../../core/notification/notifier"
import {templates} from "../../core/notification/template"
import { EmailNotification } from "../emailnotification/email.notification";
import { errorstype } from "../../core/types/errorstype";

function tolistitem(user: userdocument): userlist {
    return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    };
}




export async function getPendingUsers(req:any, res:any){
    try{
       const users= await User.find({status:"pending"}).select("-password");
       const payload:usersresponse ={
        message:"pending users fetched successfully",
        sucess:true,
        users

       }
       return res.status(200).json(payload)
    }
    catch(error){
        const payload:apitype ={
            message:"An error occurred while fetching pending users",
            sucess:false
        }
        res.status(500).json(payload)
    }


}
export async function getallusers(req:any, res:any){
    try{
         const users= await User.find().select("-password");
         const payload:usersresponse={
            message:"all user retrived sucessfully ",
            sucess:true,
            users
         }
         return res.status(200).json(payload)
    }
    catch(error){
        const payload:apitype ={
            message:"An error occurred while fetching all users",
            sucess:false
        }
        res.status(500).json(payload)
    }
}

export async function approvedUser(req:any,res:any){
    try{
            const userid=req.params.id;
            const approvedUser = await User.findById(userid);

            if(!approvedUser){
        const payload:apitype={
               message:"user not found",
               sucess:false
        }
                return res.status(404).json(payload)
            }

            if(approvedUser.status=="accepted"){
                const payload:apitype={
                    message:"user is already approved",
                    sucess:false
                }
                return res.status(400).json(payload)
            }

            approvedUser.status="accepted"
            await approvedUser.save()

            const t = templates.accountApproved(approvedUser.name);
            await new Notifier(
                new EmailNotification(approvedUser.email,t.html,t.subject)
            ).send();

            const payload:apitype={
                message:"user approved successfully",
                sucess:true
            }
            return res.status(200).json(payload)
    }
    catch (error){
        const payload:apitype={
            message:"internal server error",
            sucess:false
        }
        return res.status(500).json(payload)
    }
}

export async function rejectUser(req: any, res: any) {
    try {
        const userid = req.params.id;
        const user = await User.findById(userid);
        if (!user) {
            const payload: apitype = { message: "User not found", sucess: false };
            return res.status(404).json(payload);
        }
        if (user.status === "rejected") {
            const payload: apitype = { message: "User already rejected", sucess: false };
            return res.status(400).json(payload);
        }

        user.status = "rejected";
        await user.save();

        // send rejection email
        const t = templates.accountRejected(user.name);
        await new Notifier(
            new EmailNotification(user.email, t.html, t.subject)
        ).send();
        
        const payload: apitype = { message: "User rejected successfully", sucess: true };
        return res.status(200).json(payload);
    } catch (error) {
        const payload: apitype = { message: "Internal server error", sucess: false };
        return res.status(500).json(payload);
    }
}


export async function createuser(req:any,res:any){

    try{
       const data = req.body || {};
              const name = data.name;
              const email = data.email;
              const password = data.password;
              const role = typeof data.role === "string" ? data.role.trim().toLowerCase() : "";
      
              const errors: NonNullable<errorstype["errors"]> = [];
      
              if (!name) errors.push({ field: "name", message: "Name is required" });
              if (!email) errors.push({ field: "email", message: "Email is required" });
              if (!password) errors.push({ field: "password", message: "Password is required" });
              if (String(password ?? "").length > 0 && String(password).length < 6) {
                  errors.push({ field: "password", message: "Password must be at least 6 characters" });
              }
              if (data.role !== undefined && role !== "government" && role !== "business") {
                  errors.push({ field: "role", message: "Role must be either government or business" });
              }
      
              if (errors.length > 0) {
                  const payload: errorstype = {
                      message: "Validation error",
                      sucess: false,
                      errors,
                  };
                  return res.status(400).json(payload);
              }
      
              const existinguser = await User.findOne({ email: String(email).trim() });
              if (existinguser) {
                  const payload: errorstype = {
                      message: "User already exists",
                      sucess: false,
                  };
                  return res.status(400).json(payload);
              }
      
              const hashedpassword = await bcrypt.hash(String(password), 10);
              const finalRole = role === "government" ? "government" : "business";
      
      
              const usercreate = await User.create({
                  name,
                  email: String(email).trim(),
                  password: hashedpassword,
                  role: finalRole,
                  status:"accepted"
              });
      
              const payload: userresponse = {
                  message: "User created successfully",
                  sucess: true,
                  user: tolistitem(usercreate as unknown as userdocument)
              };
              return res.status(201).json(payload);
    }
    catch(error){
        console.error("Error creating user:", error);
        const payload:apitype ={
            message:"An error occurred while creating user",
            sucess:false
        }
        return res.status(500).json(payload)
    }

}


