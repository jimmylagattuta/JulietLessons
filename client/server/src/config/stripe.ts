import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

// Export price IDs
export const STRIPE_PRICE_IDS = {
  ROMEO_MONTHLY: process.env.STRIPE_ROMEO_PRICE_ID || '',
  JULIET_MONTHLY: process.env.STRIPE_JULIET_PRICE_ID || '',
};

// Validate price IDs
if (!STRIPE_PRICE_IDS.ROMEO_MONTHLY || !STRIPE_PRICE_IDS.JULIET_MONTHLY) {
  throw new Error('Stripe price IDs are not properly configured in environment variables');
}

// Webhook secret for Stripe events
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''; 