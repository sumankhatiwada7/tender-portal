import {BidDocument,bidlist,bidlistResponse, bidListResponses} from "../../core/types/bidtype";
import type { apitype } from "../../core/types/apitype";
import { errorstype } from "../../core/types/errorstype";
import {bid} from "./bid.model";

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
        res.status(201).json(payload);
    } catch (error) {
        const payload:apitype = {
            message: "Internal server error",
            sucess: false,
        }
        res.status(500).json(payload);
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
        res.status(200).json(payload);
    } catch (error) {
        const payload:apitype = {
            message: "Internal server error",
            sucess: false,
        }
        res.status(500).json(payload);
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
        res.status(200).json(payload);
    }
    catch(error){
        const payload:apitype = {
            message: "Internal server error",
            sucess: false,
        }
        res.status(500).json(payload);
    }
}
