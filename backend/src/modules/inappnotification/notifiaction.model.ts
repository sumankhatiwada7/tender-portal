import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
    recipient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

    },
    type:{
        type:String,
        enum:[
            "new_bid",          
            "bid_accepted",      
            "bid_rejected",    
            "new_tender",         
            "account_approved",  
            "account_rejected", 
        ],
        required: true
    },
        title:    { type: String, required: true },
    message:  { type: String, required: true },
    isRead:   { type: Boolean, default: false },
    link:     { type: String, default: null },  // frontend route to navigate on click
    meta: {
        tenderId: { type: mongoose.Schema.Types.ObjectId, ref: "Tender", default: null },
        bidId:    { type: mongoose.Schema.Types.ObjectId, ref: "Bid",    default: null },
        userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User",   default: null },
    },

},{timestamps:true});

export const Notification=mongoose.model("Notification",notificationSchema);
