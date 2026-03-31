
import type { apitype } from "../../core/types/apitype";
import type { errorstype } from "../../core/types/errorstype";
import type { tenderDocument,tenderlist,tenderResponse,tenderListResponse,tenderStatus,updateTenderInput } from "./tendertype";
import Tender from "./tender.model";

function toTenderListItem(tender: tenderDocument): tenderlist {
    return{
        id:String((tender as any)._id),
        title:tender.title,
        description:tender.description,
        deadline:tender.deadline,
        budget:tender.budget,
        createdBy:String(tender.createdBy),
        status:tender.status,
        awardedto: tender.awardedto ? String(tender.awardedto) : undefined 
    }
}

export async function CreateTender(req: any, res: any) {

    try{
     const data = req.body || {};
     const title = data.title;
     const description = data.description;
     const deadline = data.deadline;
     const budget = data.budget;
     const createdBy = req.userId;
     const status:tenderStatus = "open";
     const errors: NonNullable<errorstype["errors"]> = [];
     if(!title)
        errors.push({field:"title",message:"Title is required"});
    if(!description)
        errors.push({field:"description",message:"Description is required"});
    if(!deadline)
        errors.push({field:"deadline",message:"Deadline is required"});
    if(!budget)
        errors.push({field:"budget",message:"Budget is required"});
    if(errors.length > 0){
        const payload:errorstype ={
            message:"Validation failed",
            sucess:false,
            errors,
        }
        res.status(400).json(payload);
    }
    const existingTender = await Tender.findOne({title:String(title).trim()});
    if(existingTender){
        const payload:apitype ={
            message:"Tender with this title already exists",
            sucess:false
        }
        res.status(409).json(payload);
    }
    const tendercreate = await Tender.create({
        title,
        description,
        deadline,
        budget,
        createdBy,
        status
    })
    const payload:tenderResponse ={
        message:"Tender created successfully",
        success:true,
        tender:toTenderListItem(tendercreate as unknown as tenderDocument)
    }



    }catch(error){
       const payload:apitype ={
        message:"Internal server error",
        sucess:false
       }
       res.status(500).json(payload);
    }
}

export async function GetTenderById(req: any, res: any) {
    try {
        const { id } = req.params;
        const tender = await Tender.findById(id);
        if (!tender) {
            const payload: apitype = {
                message: "Tender not found",
                sucess: false
            };
            res.status(404).json(payload);
            return;
        }
        const payload: tenderResponse = {
            message: "Tender found successfully",
            success: true,
            tender: toTenderListItem(tender as unknown as tenderDocument)
        };
        res.status(200).json(payload);
    } catch (error) {
        const payload: apitype = {
            message: "Internal server error",
            sucess: false
        };
        res.status(500).json(payload);
    }
}

export async function GetAllTenders(req: any, res: any) {
    try {
        const tenders = await Tender.find();
        if(!tenders || tenders.length === 0){
        const payload: apitype = {
            message: "No tenders found",
            sucess: false
        }
        res.status(404).json(payload);
    }
        const payload: tenderListResponse = {
            message: "Tenders found successfully",
            success: true,
            tenders: tenders.map((tender) => toTenderListItem(tender as unknown as tenderDocument))
        };
        res.status(200).json(payload);
    } catch (error) {
        const payload: apitype = {
            message: "Internal server error",
            sucess: false
        };
        res.status(500).json(payload);
    }
}

export async function UpdateTender(req: any, res: any) {
    try {
        const { id } = req.params;
        const data: updateTenderInput = req.body || {};
        const errors: NonNullable<errorstype["errors"]> = [];
        const existing= await Tender.findById(id);
        if(existing?.status === "awarded"){
            const payload: apitype = {
                message: "Cannot update an awarded tender",
                sucess: false
            }
            return res.status(400).json(payload);
        }


        if (Object.keys(data).length === 0) {
            const payload: errorstype = {
                message: "At least one field is required to update",
                sucess: false,
                errors: [{ message: "No update fields provided" }]
            };
            return res.status(400).json(payload);
        }

        if (data.status && !["open", "closed"].includes(data.status)) {
            errors.push({ field: "status", message: "Status must be open or closed" });
        }

        if (data.title !== undefined && !String(data.title).trim()) {
            errors.push({ field: "title", message: "Title cannot be empty" });
        }

        if (data.description !== undefined && !String(data.description).trim()) {
            errors.push({ field: "description", message: "Description cannot be empty" });
        }

        if (data.budget !== undefined && Number(data.budget) <= 0) {
            errors.push({ field: "budget", message: "Budget must be greater than 0" });
        }

        if (data.deadline !== undefined && Number.isNaN(new Date(data.deadline).getTime())) {
            errors.push({ field: "deadline", message: "Deadline must be a valid date" });
        }

        if (errors.length > 0) {
            const payload: errorstype = {
                message: "Validation failed",
                sucess: false,
                errors
            };
            return res.status(400).json(payload);
        }

        if (data.title) {
            const existingTender = await Tender.findOne({
                title: String(data.title).trim(),
                _id: { $ne: id }
            });

            if (existingTender) {
                const payload: apitype = {
                    message: "Tender with this title already exists",
                    sucess: false
                };
                return res.status(409).json(payload);
            }
        }

        const updateData: updateTenderInput = {};

        if (data.title !== undefined) updateData.title = String(data.title).trim();
        if (data.description !== undefined) updateData.description = String(data.description).trim();
        if (data.deadline !== undefined) updateData.deadline = new Date(data.deadline);
        if (data.budget !== undefined) updateData.budget = Number(data.budget);
        if (data.status !== undefined) updateData.status = data.status;

        const tender1 = await Tender.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!tender1) {
            const payload: apitype = {
                message: "Tender not found",
                sucess: false
            };
            return res.status(404).json(payload);
        }

        const payload: tenderResponse = {
            message: "Tender updated successfully",
            success: true,
            tender: toTenderListItem(tender1 as unknown as tenderDocument)
        };

        return res.status(200).json(payload);
    } catch (_error) {
        const payload: apitype = {
            message: "Internal server error",
            sucess: false
        };
        return res.status(500).json(payload);
    }
}

export async function DeleteTender(req: any, res: any) {
    try{
         const { id } = req.params;
         const tender = await Tender.findByIdAndDelete(id);
         if(!tender){
            const payload: apitype = {
                message: "Tender not found",
                sucess: false
            };
            return res.status(404).json(payload);
        }
        const payload: apitype = {
            message: "Tender deleted successfully",
            sucess: true
        };

    }catch(_error)
    {
        const payload: apitype = {
            message: "Internal server error",
            sucess: false
        };
        return res.status(500).json(payload);
    }
}