import {BidDocument,bidlist,bidlistResponse, bidListResponses} from "../../core/types/bidtype";
import type { apitype } from "../../core/types/apitype";
import { errorstype } from "../../core/types/errorstype";
import {bid} from "./bid.model";
import Tender from "../tender/tender.model";

function  tolistitem(bid:BidDocument):bidlist{
    return{
        id:String(bid.id),
        tenderId:String(bid.tenderId),
        businessId:String(bid.businessId),
        proposal:bid.proposal,
        amount:bid.amount,
        status:bid.status

    }
}

export async function createBid(req:any,res:any){
    try {
        const businessid=req.user.id;
        const tenderid=req.params.tenderid;
        const data=req.body || {};
        const proposal=data.proposal;
        const amount=data.amount;
        const errors: NonNullable<errorstype["errors"]> = [];
        if(!proposal) errors.push({field:"proposal",message:"Proposal is required"});
        if(!amount) errors.push({field:"amount",message:"Amount is required"});
        if(errors.length > 0) {
            return res.status(400).json({errors});
        }
        const existingBid = await bid.findOne({ businessId: businessid, tenderId: tenderid });
        if (existingBid) {
            const payload:apitype = {
                message: "Bid already exists for this tender",
                sucess: false,
            }
            return res.status(400).json(payload);
        }
        const newBid = new bid({ businessId: businessid, tenderId: tenderid, proposal, amount });
        await newBid.save();
        const payload:bidlistResponse = {
            message: "Bid created successfully",
            success: true,
            bid: tolistitem(newBid)
        }
        return res.status(201).json(payload);
    } catch (error) {
        const payload:apitype = {
            message: "Internal server error",
            sucess: false,
        }
        return res.status(500).json(payload);
    }
}
export async function getBidsForTender(req:any,res:any){
    try {
        const tenderid=req.params.tenderid;
        const bids=await bid.find({ tenderId: tenderid });
        if(!bids || bids.length === 0){
            const payload:apitype = {
                message: "No bids found for this tender",
                sucess: false,
            };
            return res.status(404).json(payload);

        }
        const payload:bidListResponses = {
            message: "Bids retrieved successfully",
            success: true,
            bids: bids.map(tolistitem)
        }
        return res.status(200).json(payload);
    } catch (error) {
        const payload:apitype = {
            message: "Internal server error",
            sucess: false,
        }
        return res.status(500).json(payload);
    }

}
export async function getBidsbyidfortender(req:any,res:any){
    try{
        const tenderid=req.params.tenderid;
        const bidid=req.params.bidid;
        const biddata=await bid.findOne({ _id: bidid, tenderId: tenderid });
        if(!biddata){
            const payload:apitype = {
                message: "Bid not found for this tender",
                sucess: false,
            };
            return res.status(404).json(payload);
        }
        const payload:bidlistResponse = {
            message: "Bid retrieved successfully",
            success: true,
            bid: tolistitem(biddata)
        }
        return res.status(200).json(payload);
    }
    catch(error){
        const payload:apitype = {
            message: "Internal server error",
            sucess: false,
        }
        return res.status(500).json(payload);
    }
}

export async function acceptbid(req:any,res:any){
    try {
         const tenderid=req.params.tenderid;
         const bidid=req.params.bidid;
         const tinderexisted=await Tender.findById(tenderid);
         const bidexisted=await bid.findById(bidid);
         if(!bidexisted){
            const payload:apitype = {
                message: "Bid not found",
                sucess: false,
            }
            return res.status(404).json(payload);
         }
         if(!tinderexisted){
            const payload:apitype = {
                message: "Tender not found",
                sucess: false,
         }
         return res.status(404).json(payload);

    }
    if(tinderexisted.status==="awarded"){
        const payload:apitype = {
            message: "Tender already awarded",
            sucess: false,
        }
        return res.status(400).json(payload);
    }
    if(String(tinderexisted.createdBy) !== String(req.user.id)){
        const payload:apitype = {
            message: "You are not the owner of this tender",
            sucess: false,
        }
        return res.status(403).json(payload);
    }
    // Update the bid status to accepted
    bidexisted.status = "accepted";
    await bidexisted.save();
    // Update the tender status to awarded and set the awardedto field
    tinderexisted.status = "awarded";
    tinderexisted.awardedto = bidexisted.businessId;
    await tinderexisted.save();
    await bid.updateMany({
         tenderId: tenderid, _id: 
         { $ne: bidid } }, 
         { status: "rejected" });
    const payload:apitype={
        message: "Bid accepted and tender awarded successfully",
        sucess: true,

    }
    return res.status(200).json(payload);

}
     catch (error) {
        const payload:apitype = {
            message: "Internal server error",
            sucess: false,
        }
        return res.status(500).json(payload);
    }
}