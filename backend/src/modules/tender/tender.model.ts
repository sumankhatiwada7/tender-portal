import mongoose  from "mongoose";

const tenderSchema= new mongoose.Schema({

    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    deadline:{
        type:Date,
        required:true
    },
    budget:{
        type:Number,
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    status:{
        type:String,
        enum:["open","closed"],
        required:true
    }
},{timestamps:true});

export default mongoose.model("Tender",tenderSchema);