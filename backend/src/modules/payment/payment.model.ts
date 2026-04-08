import mongoose, { Document } from "mongoose";

export interface Payment extends Document {
  userId: mongoose.Types.ObjectId;
  type: "bid" | "tender";
  amount: number;
  status: "pending" | "paid";
  stripeSessionId: string;
}

const paymentSchema = new mongoose.Schema<Payment>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  type: {
    type: String,
    enum: ["bid", "tender"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },
  stripeSessionId: {
    type: String
  }
},{timestamps:true});

export default mongoose.model<Payment>("Payment", paymentSchema);