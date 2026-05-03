import { getJson, postJson } from "./httpClient";

export type PaymentProvider = "manual" | "paystack" | "paydunya" | "fedapay" | "flutterwave" | "cinetpay" | "simiz";
export type PaymentPlanId = "premium_monthly" | "creator_monthly" | "donation_one_time";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "expired";

export interface PaymentPlan {
  id: PaymentPlanId;
  name: string;
  amount: number;
  currency: "XOF";
  interval: "month";
  features: string[];
}

export interface CheckoutTransaction {
  id: string;
  provider: PaymentProvider;
  plan: PaymentPlanId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  checkoutUrl: string;
  expiresAt?: string;
}

export interface Subscription {
  _id: string;
  plan: PaymentPlanId;
  status: "trialing" | "active" | "past_due" | "cancelled" | "expired";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export async function getPaymentPlans() {
  return getJson<{ plans: PaymentPlan[] }>("/api/payments/plans");
}

export async function createCheckout(input: {
  plan: PaymentPlanId;
  provider?: PaymentProvider;
  idempotencyKey?: string;
}) {
  return postJson<{ transaction: CheckoutTransaction }>("/api/payments/checkout", input);
}

export async function getCurrentSubscription() {
  return getJson<{ subscription: Subscription | null }>("/api/payments/subscription");
}

export async function getPaymentHistory() {
  return getJson<{ transactions: CheckoutTransaction[] }>("/api/payments/history");
}
