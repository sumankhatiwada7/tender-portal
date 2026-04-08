import Stripe from "stripe"
export const stripe = new (Stripe as any)(process.env.stripe_secrect_key as string, {
    apiVersion: "2023-10-16"
})