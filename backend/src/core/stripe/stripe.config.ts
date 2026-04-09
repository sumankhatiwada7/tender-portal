import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY ||
  process.env.stripe_secret_key ||
  process.env.stripe_secrect_key;

if (!stripeSecretKey) {
  throw new Error("Missing Stripe secret key. Set STRIPE_SECRET_KEY in backend/.env or container env.");
}

export const stripe = new (Stripe as any)(stripeSecretKey, {
  apiVersion: "2023-10-16",
});
