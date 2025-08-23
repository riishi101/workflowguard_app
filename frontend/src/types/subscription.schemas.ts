import { z } from 'zod';

// Subscription schema
export const SubscriptionSchema = z.object({
  id: z.string(),
  planId: z.string(),
  planName: z.string(),
  price: z.number(),
  status: z.string(),
  currentPeriodStart: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  trialEndDate: z.string().optional(),
  nextBillingDate: z.string().optional(),
  razorpayCustomerId: z.string().optional(),
  razorpaySubscriptionId: z.string().optional(),
  features: z.array(z.string()).optional(),
  limits: z.object({
    workflows: z.number(),
    versionHistory: z.number(),
  }).optional(),
  usage: z.object({
    workflows: z.number(),
    versionHistory: z.number(),
  }).optional(),
  email: z.string().optional(),
  paymentMethod: z.object({
    brand: z.string(),
    last4: z.string(),
    exp: z.string(),
  }).optional(),
});

// Usage stats schema
export const UsageStatsSchema = z.object({
  workflows: z.object({
    used: z.number(),
    limit: z.number(),
    percentage: z.number().optional(),
  }),
  versionHistory: z.object({
    used: z.number(),
    limit: z.number(),
    percentage: z.number().optional(),
  }),
  storage: z.object({
    used: z.number(),
    limit: z.number(),
    percentage: z.number().optional(),
  }).optional(),
});

// Billing history item schema
export const BillingHistoryItemSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  planName: z.string(),
  description: z.string(),
  invoice: z.string().optional(),
});

// Billing history schema (array of items)
export const BillingHistorySchema = z.array(BillingHistoryItemSchema);

// Payment method schema
export const PaymentMethodSchema = z.object({
  id: z.string(),
  brand: z.string(),
  last4: z.string(),
  exp: z.string(),
  isDefault: z.boolean().optional(),
});

// Plan schema
export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string().default('INR'),
  interval: z.string().default('month'),
  features: z.array(z.string()),
  workflowLimit: z.number(),
  versionHistoryDays: z.number(),
  razorpayPlanId: z.string().optional(),
});

// Razorpay order schema
export const RazorpayOrderSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  receipt: z.string().optional(),
  status: z.string(),
});

// Razorpay payment confirmation schema
export const RazorpayPaymentConfirmationSchema = z.object({
  planId: z.string(),
  paymentId: z.string(),
  orderId: z.string(),
  signature: z.string(),
});

// Invoice schema
export const InvoiceSchema = z.object({
  id: z.string(),
  invoiceUrl: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  date: z.string(),
});

// Export types
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type UsageStats = z.infer<typeof UsageStatsSchema>;
export type BillingHistoryItem = z.infer<typeof BillingHistoryItemSchema>;
export type BillingHistory = z.infer<typeof BillingHistorySchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type RazorpayOrder = z.infer<typeof RazorpayOrderSchema>;
export type RazorpayPaymentConfirmation = z.infer<typeof RazorpayPaymentConfirmationSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
