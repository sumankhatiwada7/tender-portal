import mongoose, { Document } from "mongoose";

export interface Payment extends Document {
  userId: mongoose.Types.ObjectId;
  type: "bid" | "tender";
  amount: number;
  quantity: number;
  remainingCredits: number;
  status: "pending" | "completed";
  stripeSessionId: string;
  consumedAt?: Date | null;
  consumedForTenderId?: mongoose.Types.ObjectId | null;
}

const paymentSchema = new mongoose.Schema<Payment>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 1,
  },
  remainingCredits: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 1,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },
  stripeSessionId: {
    type: String
  },
  consumedAt: {
    type: Date,
    default: null,
  },
  consumedForTenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tender",
    default: null,
  }
},{timestamps:true});

export default mongoose.model<Payment>("Payment", paymentSchema);
