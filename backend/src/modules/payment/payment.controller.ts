import paymentModel, { Payment } from "./payment.model";
import { Request, Response } from "express";
import { stripe } from "../../core/stripe/stripe.config";
import {apitype} from "../../core/types/apitype";
export async function createpaymentSession(req: Request, res: Response){
    try{
        const {type}=req.body;
        const user=(req as any).user.id;
        const amount = type === "bid" ? 100 : 200; 
        const session= await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode:"payment",
                metadata:{
                    user,
                    type,
                },
                line_item:[
                    {
                        price_data:{
                            currency:"usd",
                            product_data:{
                                name:type==="bid"?"Extra tender":"Extra tender",
                            },
                            unit_amount:amount*100,
                        },
                        quantity:1,
                    },
                ],
                success_url:"http://localhost:5000/success",
                cancel_url:"http://localhost:5000/cancel"
        });
        const paymentRecord = new (paymentModel as any)({
            userid:user,
            type:type,
            amount:amount,
            stripeSessionId:session.id,
            status:"pending"
        });
        await paymentRecord.save();
        res.json({ sessionId: session.id });
    }
    catch(error){
        const payload :apitype={
            message:"Failed to create payment session",
            sucess:false,
        }
        res.status(500).json(payload);
    }
}

export  async function webhookHandler(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
        event=stripe.webhooks.constructEvent(req.body, sig, process.env.stripe_webhook_secret as string);
        if(event.type==="checkout.session.completed"){
            const session=event.data.object as any;
            const{user,type} = session.metadata;
            await paymentModel.findOneAndUpdate({stripeSessionId:session.id},{status:"completed"});
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