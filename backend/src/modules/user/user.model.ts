import mongoose from "mongoose";

const uploadedDocumentSchema = new mongoose.Schema(
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

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true 
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true,
        enum:["admin","government","business"],
        default:"business"
    },
    status:{
        type:String,
        enum:["approved","rejected","pending"],
        default:"pending"
    },
    profileImage: {
        type: String,
        default: null,
        trim: true,
    },
    verificationDocs: {
        type: [uploadedDocumentSchema],
        default: [],
    },
    businessInfo: {
        registrationNumber: {
            type: String,
            trim: true,
            default: "",
        },
        panNumber: {
            type: String,
            trim: true,
            default: "",
        },
    },
    governmentInfo: {
        officeAddress: {
            type: String,
            trim: true,
            default: "",
        },
        representative: {
            type: String,
            trim: true,
            default: "",
        },
    },
    refreshToken: {
        type: String,
        default: null,
    }
})

export const User = mongoose.model("User", userSchema)
