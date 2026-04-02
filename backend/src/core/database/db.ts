import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const mongoUri = process.env.MONGODB_URI || "";

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not set");
        }

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        })
        console.log("MongoDB connected")
    } catch (error) {
        console.log("MongoDB connection failed:", error)
        throw error;
    }
}
