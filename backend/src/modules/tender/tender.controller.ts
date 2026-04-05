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
        category:tender.category,
        location:tender.location,
        documents:Array.isArray(tender.documents) ? tender.documents : [],
        createdBy:String(tender.createdBy),
        status:tender.status,
        awardedto: tender.awardedto ? String(tender.awardedto) : undefined 
    }
}

function normalizeDocuments(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((document) => String(document ?? "").trim())
        .filter(Boolean);
}

export async function CreateTender(req: any, res: any) {
    try{
     const data = req.body || {};
     const title = String(data.title ?? "").trim();
     const description = String(data.description ?? "").trim();
     const category = String(data.category ?? "").trim();
     const location = String(data.location ?? "").trim();
     const deadline = data.deadline;
     const parsedDeadline = new Date(deadline);
     const budget = Number(data.budget);
     const documents = normalizeDocuments(data.documents);
     const createdBy = req.user?.id;
     const status:tenderStatus = "open";
     const errors: NonNullable<errorstype["errors"]> = [];
     if(!title)
        errors.push({field:"title",message:"Title is required"});
    if(!description)
        errors.push({field:"description",message:"Description is required"});
    if(!category)
        errors.push({field:"category",message:"Category is required"});
    if(!location)
        errors.push({field:"location",message:"Location is required"});
    if(!deadline || Number.isNaN(parsedDeadline.getTime()))
        errors.push({field:"deadline",message:"Deadline is required"});
    if(!Number.isFinite(budget) || budget <= 0)
        errors.push({field:"budget",message:"Budget must be greater than 0"});
    if(!createdBy)
        errors.push({message:"Authenticated user not found"});
    if(errors.length > 0){
        const payload:errorstype ={
            message:"Validation failed",
            sucess:false,
            errors,
        }
        return res.status(400).json(payload);
    }
    const existingTender = await Tender.findOne({title});
    if(existingTender){
        const payload:apitype ={
            message:"Tender with this title already exists",
            sucess:false
        }
        return res.status(409).json(payload);
    }
    const tendercreate = await Tender.create({
        title,
        description,
        deadline: parsedDeadline,
        budget,
        category,
        location,
        documents,
        createdBy,
        status
    })
    const payload:tenderResponse ={
        message:"Tender created successfully",
        success:true,
        tender:toTenderListItem(tendercreate as unknown as tenderDocument)
    }

    return res.status(201).json(payload);
    }catch(_error){
       const payload:apitype ={
        message:"Internal server error",
        sucess:false
       }
       return res.status(500).json(payload);
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
            return res.status(404).json(payload);
        }
        const payload: tenderResponse = {
            message: "Tender found successfully",
            success: true,
            tender: toTenderListItem(tender as unknown as tenderDocument)
        };
        return res.status(200).json(payload);
    } catch (error) {
        const payload: apitype = {
            message: "Internal server error",
            sucess: false
        };
        return res.status(500).json(payload);
    }
}

export async function GetAllTenders(req: any, res: any) {
    try {
        const tenders = await Tender.find().sort({ createdAt: -1 });
        const payload: tenderListResponse = {
            message: tenders.length > 0 ? "Tenders found successfully" : "No tenders yet",
            success: true,
            tenders: tenders.map((tender) => toTenderListItem(tender as unknown as tenderDocument))
        };
        return res.status(200).json(payload);
    } catch (error) {
        const payload: apitype = {
            message: "Internal server error",
            sucess: false
        };
        return res.status(500).json(payload);
    }
}

export async function GetPublicTenders(_req: any, res: any) {
    try {
        const tenders = await Tender.find().sort({ createdAt: -1 });
        const payload: tenderListResponse = {
            message: tenders.length > 0 ? "Tenders found successfully" : "No tenders yet",
            success: true,
            tenders: tenders.map((tender) => toTenderListItem(tender as unknown as tenderDocument))
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

export async function UpdateTender(req: any, res: any) {
    try {
        const { id } = req.params;
        const data: updateTenderInput = req.body || {};
        const errors: NonNullable<errorstype["errors"]> = [];
        const existing= await Tender.findById(id);
        if (!existing) {
            const payload: apitype = {
                message: "Tender not found",
                sucess: false
            };
            return res.status(404).json(payload);
        }
        if (String(existing.createdBy) !== String(req.user?.id)) {
            const payload: apitype = {
                message: "You are not the owner of this tender",
                sucess: false
            };
            return res.status(403).json(payload);
        }
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

        if (data.category !== undefined && !String(data.category).trim()) {
            errors.push({ field: "category", message: "Category cannot be empty" });
        }

        if (data.location !== undefined && !String(data.location).trim()) {
            errors.push({ field: "location", message: "Location cannot be empty" });
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
        if (data.category !== undefined) updateData.category = String(data.category).trim();
        if (data.location !== undefined) updateData.location = String(data.location).trim();
        if (data.documents !== undefined) updateData.documents = normalizeDocuments(data.documents);

        const tender1 = await Tender.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

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
         const tender = await Tender.findById(id);
         if(!tender){
            const payload: apitype = {
                message: "Tender not found",
                sucess: false
            };
            return res.status(404).json(payload);
        }
        if (String(tender.createdBy) !== String(req.user?.id)) {
            const payload: apitype = {
                message: "You are not the owner of this tender",
                sucess: false
            };
            return res.status(403).json(payload);
        }
        await tender.deleteOne();
        const payload: apitype = {
            message: "Tender deleted successfully",
            sucess: true
        };
        return res.status(200).json(payload);

    }catch(_error)
    {
        const payload: apitype = {
            message: "Internal server error",
            sucess: false
        };
        return res.status(500).json(payload);
    }
}
