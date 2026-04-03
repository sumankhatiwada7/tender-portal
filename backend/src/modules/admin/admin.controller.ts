import { User } from "../user/user.model";
import {apitype} from "../../core/types/apitype"
import {usersresponse} from "../../core/types/usertype"
import {Notifier} from  "../../core/notification/notifier"
import {templates} from "../../core/notification/template"
import { EmailNotification } from "../emailnotification/email.notification";




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
        const userid = req.params.userid;
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


