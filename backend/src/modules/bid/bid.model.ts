import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        originalname: {
            type: String,
            required: true,
            trim: true,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

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
    },
    documents: {
        type: [documentSchema],
        default: [],
    }


},{timestamps:true});

export const bid = mongoose.model("Bid",bidschema)