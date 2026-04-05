import mongoose  from "mongoose";

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
    category:{
        type:String,
        required:true,
        trim:true
    },
    location:{
        type:String,
        required:true,
        trim:true
    },
    documents:{
        type:[documentSchema],
        default:[]
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    status:{
        type:String,
        enum:["open","closed","awarded"],
        required:true
    },
    awardedto:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"business",
    }
},{timestamps:true});

export default mongoose.model("Tender",tenderSchema);
