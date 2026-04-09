import { createpaymentSession, getPaymentSummary, verifyPaymentSession, webhookHandler } from "./payment.controller";
import express from "express";
import { authMiddleware } from "../auth/auth.middleware";

const router = express.Router();
 

router.post("/create-session", authMiddleware, createpaymentSession);
router.get("/summary", authMiddleware, getPaymentSummary);
router.get("/verify-session", authMiddleware, verifyPaymentSession);

router.post("/webhook", express.raw({type:"application/json"}), webhookHandler);
export default router;
