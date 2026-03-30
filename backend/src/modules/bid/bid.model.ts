import mongoose from "mongoose";

const bidschema = new mongoose.Schema({
    tenderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tender",
        required: true
    },
    businessId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    proposal:{
        type: String,
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    status:{
        type:String,
        enum:["pending","accepted","rejected"],
        default:"pending"
    }


},{timestamps:true});

export const bid = mongoose.model("Bid",bidschema)