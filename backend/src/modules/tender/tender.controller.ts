import type { apitype } from "../../core/types/apitype";
import type { errorstype } from "../../core/types/errorstype";
import { bid } from "../bid/bid.model";
import paymentModel from "../payment/payment.model";
import { User } from "../user/user.model";
import type { publicPlatformStatsResponse, tenderDocument,tenderlist,tenderResponse,tenderListResponse,tenderStatus,updateTenderInput, uploadDocument } from "./tendertype";
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

type uploadedFileInput = {
    path?: string;
    secure_url?: string;
    originalname?: string;
};

function normalizeDocuments(value: unknown): uploadDocument[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((document) => {
            if (typeof document !== "object" || !document) {
                return null;
            }

            const doc = document as uploadDocument;
            const url = String(doc.url ?? "").trim();
            const originalname = String(doc.originalname ?? "").trim();
            const uploadedAt = doc.uploadedAt ? new Date(doc.uploadedAt) : new Date();

            if (!url || !originalname || Number.isNaN(uploadedAt.getTime())) {
                return null;
            }

            return {
                url,
                originalname,
                uploadedAt,
            };
        })
        .filter((doc): doc is uploadDocument => Boolean(doc));
}

function mapUploadedDocuments(files: uploadedFileInput[]): uploadDocument[] {
    return files
        .map((file) => {
            const url = String(file.path || file.secure_url || "").trim();
            const originalname = String(file.originalname || "").trim();

            if (!url || !originalname) {
                return null;
            }

            return {
                url,
                originalname,
                uploadedAt: new Date(),
            };
        })
        .filter((doc): doc is uploadDocument => Boolean(doc));
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
      const uploadedFiles = (Array.isArray(req.files) ? req.files : []) as uploadedFileInput[];
      const documents = uploadedFiles.length > 0
          ? mapUploadedDocuments(uploadedFiles)
          : normalizeDocuments(data.documents);
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
    const availablePayment = await paymentModel.findOne({
        userId: createdBy,
        type: "tender",
        status: "completed",
        remainingCredits: { $gt: 0 },
    }).sort({ createdAt: 1 });

    if (!availablePayment) {
        const payload: apitype = {
            message: "A completed $1 tender payment is required before publishing.",
            sucess: false,
        };
        return res.status(402).json(payload);
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
    availablePayment.remainingCredits = Math.max(0, (availablePayment.remainingCredits ?? 0) - 1);
    if (availablePayment.remainingCredits === 0) {
        availablePayment.consumedAt = new Date();
    }
    availablePayment.consumedForTenderId = (tendercreate as any)._id;
    await availablePayment.save();
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

export async function GetPublicPlatformStats(_req: any, res: any) {
    try {
        const [totalTenders, openTenders, tenderBudget, registeredBusinesses, governmentOffices, totalBids] = await Promise.all([
            Tender.countDocuments(),
            Tender.countDocuments({ status: "open" }),
            Tender.aggregate([{ $group: { _id: null, total: { $sum: "$budget" } } }]),
            User.countDocuments({ role: "business", status: "approved" }),
            User.countDocuments({ role: "government", status: "approved" }),
            bid.countDocuments(),
        ]);

        const payload: publicPlatformStatsResponse = {
            message: "Public platform stats fetched successfully",
            success: true,
            stats: {
                totalTenders,
                openTenders,
                totalTenderValue: Number(tenderBudget[0]?.total ?? 0),
                registeredBusinesses,
                governmentOffices,
                totalBids,
            }
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
        const uploadedFiles = (Array.isArray(req.files) ? req.files : []) as uploadedFileInput[];
        if (uploadedFiles.length > 0) {
            updateData.documents = mapUploadedDocuments(uploadedFiles);
        } else if (data.documents !== undefined) {
            updateData.documents = normalizeDocuments(data.documents);
        }

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
