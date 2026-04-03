import mongoose from "mongoose";

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
        enum:["accepted","rejected","pending"],
        default:"pending"
    }
})

export const User = mongoose.model("User", userSchema)
