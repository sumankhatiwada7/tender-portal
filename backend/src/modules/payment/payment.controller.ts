import dotenv from "dotenv";
import paymentModel from "./payment.model";
import { Request, Response } from "express";
import { stripe } from "../../core/stripe/stripe.config";
import {apitype} from "../../core/types/apitype";

dotenv.config();

function getStripeWebhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET || process.env.stripe_webhook_secret;
}

function getFrontendBaseUrl() {
    return String(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
}

function sanitizeReturnPath(value: unknown) {
    const returnPath = String(value || "").trim();
    if (!returnPath.startsWith("/") || returnPath.startsWith("//")) {
        return null;
    }

    return returnPath;
}

export async function createpaymentSession(req: Request, res: Response){
    try{
        const {type, quantity: rawQuantity, returnPath: rawReturnPath}=req.body;
        const user=(req as any).user?.id;
        if (!user) {
            const payload: apitype = {
                message: "Authenticated user not found",
                sucess: false,
            };
            return res.status(401).json(payload);
        }

        if (type !== "bid" && type !== "tender") {
            const payload: apitype = {
                message: "Payment type must be bid or tender",
                sucess: false,
            };
            return res.status(400).json(payload);
        }

        const quantity = Number(rawQuantity ?? 1);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
            const payload: apitype = {
                message: "Quantity must be a whole number between 1 and 10",
                sucess: false,
            };
            return res.status(400).json(payload);
        }

        const unitAmount = 1;
        const amount = unitAmount * quantity;
        const frontendBaseUrl = getFrontendBaseUrl();
        const fallbackReturnPath = type === "bid" ? "/tenders" : "/government/create";
        const returnPath = sanitizeReturnPath(rawReturnPath) ?? fallbackReturnPath;
        const session= await stripe.checkout.sessions.create({
                mode:"payment",
                metadata:{
                    user,
                    type,
                    quantity: String(quantity),
                    returnPath,
                },
                line_items:[
                    {
                        price_data:{
                            currency:"usd",
                            product_data:{
                                name:type==="bid"?"Bid creation fee":"Tender creation fee",
                            },
                            unit_amount:unitAmount * 100,
                        },
                        quantity,
                    },
                ],
                success_url:`${frontendBaseUrl}${returnPath}${returnPath.includes("?") ? "&" : "?"}payment=success&type=${type}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url:`${frontendBaseUrl}${returnPath}${returnPath.includes("?") ? "&" : "?"}payment=cancelled&type=${type}`
        });

        const paymentRecord = new paymentModel({
            userId:user,
            type:type,
            amount:amount,
            quantity,
            remainingCredits: 0,
            stripeSessionId:session.id,
            status:"pending"
        });
        await paymentRecord.save();
        res.json({ sessionId: session.id, url: session.url });
    }
    catch(error){
        console.error("Failed to create payment session:", error);
        const payload :apitype={
            message:error instanceof Error ? error.message : "Failed to create payment session",
            sucess:false,
        }
        res.status(500).json(payload);
    }
}

export  async function webhookHandler(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
        const stripeWebhookSecret = getStripeWebhookSecret();
        if (!stripeWebhookSecret) {
            const payload :apitype={
                message:"Missing Stripe webhook secret",
                sucess:false,
            }
            return res.status(500).json(payload);
        }

        event=stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
        if(event.type==="checkout.session.completed"){
            const session=event.data.object as any;
            const{user,type, quantity} = session.metadata;
            const credits = Number(quantity ?? 1);
            const payment = await paymentModel.findOne({ stripeSessionId: session.id });
            if (payment && payment.status !== "completed") {
                payment.status = "completed";
                payment.remainingCredits = credits;
                await payment.save();
            }
            console.log(`Payment for user ${user} of type ${type} completed successfully.`);
        }
        const payload:apitype={
            message:"Webhook handled successfully",
            sucess:true,
        }
        res.json(payload);
    } catch (error) {
        const payload :apitype={
            message:"Failed to handle webhook",
            sucess:false,
        }
        return res.status(500).json(payload);
    }
}

export async function verifyPaymentSession(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        const sessionId = String(req.query.sessionId || "");

        if (!userId || !sessionId) {
            const payload: apitype = {
                message: "sessionId is required",
                sucess: false,
            };
            return res.status(400).json(payload);
        }

        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
        const payment = await paymentModel.findOne({ stripeSessionId: sessionId, userId });

        if (!payment) {
            const payload: apitype = {
                message: "Payment session not found",
                sucess: false,
            };
            return res.status(404).json(payload);
        }

        if (checkoutSession.payment_status === "paid" && payment.status !== "completed") {
            payment.status = "completed";
            payment.remainingCredits = payment.quantity;
            await payment.save();
        }

        return res.status(200).json({
            success: true,
            message: payment.status === "completed" ? "Payment verified successfully" : "Payment is still pending",
            status: payment.status,
        });
    } catch (_error) {
        const payload: apitype = {
            message: "Failed to verify payment session",
            sucess: false,
        };
        return res.status(500).json(payload);
    }
}

export async function getPaymentSummary(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        const type = String(req.query.type || "tender");

        if (!userId) {
            const payload: apitype = {
                message: "Authenticated user not found",
                sucess: false,
            };
            return res.status(401).json(payload);
        }

        if (type !== "bid" && type !== "tender") {
            const payload: apitype = {
                message: "Payment type must be bid or tender",
                sucess: false,
            };
            return res.status(400).json(payload);
        }

        const [creditRows, pendingPayments] = await Promise.all([
            paymentModel.find({
                userId,
                type,
                status: "completed",
                remainingCredits: { $gt: 0 },
            }).select("remainingCredits"),
            paymentModel.countDocuments({
                userId,
                type,
                status: "pending",
            }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Payment summary retrieved successfully",
            type,
            unitPriceUsd: 1,
            availableCredits: creditRows.reduce((total, payment) => total + Number(payment.remainingCredits ?? 0), 0),
            pendingPayments,
        });
    } catch (_error) {
        const payload: apitype = {
            message: "Failed to get payment summary",
            sucess: false,
        };
        return res.status(500).json(payload);
    }
}
