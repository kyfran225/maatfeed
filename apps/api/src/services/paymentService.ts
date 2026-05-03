import crypto from "node:crypto";
import { Types } from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import {
  PaymentTransactionModel,
  type IPaymentTransaction,
  type PaymentPlan,
  type PaymentProvider,
  type PaymentStatus
} from "../models/PaymentTransaction.js";
import { SubscriptionModel } from "../models/Subscription.js";

export const paymentPlans: Record<
  PaymentPlan,
  { id: PaymentPlan; name: string; amount: number; currency: "XOF"; interval: "month"; features: string[] }
> = {
  premium_monthly: {
    id: "premium_monthly",
    name: "Premium",
    amount: 5000,
    currency: "XOF",
    interval: "month",
    features: ["Feed personnalisé avancé", "Notifications prioritaires", "Expérience sans limitations beta"]
  },
  creator_monthly: {
    id: "creator_monthly",
    name: "Creator",
    amount: 10000,
    currency: "XOF",
    interval: "month",
    features: ["Outils créateur", "Statistiques avancées", "Visibilité communautaire renforcée"]
  }
};

export interface CreateCheckoutInput {
  userId: string;
  plan: PaymentPlan;
  provider?: PaymentProvider;
  idempotencyKey?: string;
}

export interface CheckoutResult {
  transaction: IPaymentTransaction;
  checkoutUrl: string;
  provider: PaymentProvider;
}

function getDefaultProvider(): PaymentProvider {
  return env.PAYMENT_PROVIDER as PaymentProvider;
}

function buildFallbackCheckoutUrl(transactionId: string) {
  const successUrl = new URL(env.PAYMENT_SUCCESS_URL);
  successUrl.searchParams.set("transactionId", transactionId);
  successUrl.searchParams.set("status", "pending");
  return successUrl.toString();
}

function createProviderReference(provider: PaymentProvider) {
  return `${provider}_${crypto.randomUUID()}`;
}

async function createProviderCheckout(
  provider: PaymentProvider,
  transactionId: string
): Promise<{ providerReference: string; checkoutUrl: string; status: PaymentStatus }> {
  if (provider === "manual") {
    return {
      providerReference: createProviderReference(provider),
      checkoutUrl: buildFallbackCheckoutUrl(transactionId),
      status: "pending"
    };
  }

  logger.warn(
    { provider },
    "Payment provider selected without a live adapter; returning pending checkout placeholder"
  );

  return {
    providerReference: createProviderReference(provider),
    checkoutUrl: buildFallbackCheckoutUrl(transactionId),
    status: "pending"
  };
}

export async function createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  const plan = paymentPlans[input.plan];

  if (!plan) {
    throw new Error("Unsupported payment plan");
  }

  const provider = input.provider || getDefaultProvider();
  const idempotencyKey = input.idempotencyKey || crypto.randomUUID();
  const userObjectId = new Types.ObjectId(input.userId);

  const existing = await PaymentTransactionModel.findOne({
    userId: userObjectId,
    idempotencyKey
  });

  if (existing?.checkoutUrl) {
    return {
      transaction: existing,
      checkoutUrl: existing.checkoutUrl,
      provider: existing.provider
    };
  }

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const transaction = await PaymentTransactionModel.create({
    userId: userObjectId,
    provider,
    plan: input.plan,
    amount: plan.amount,
    currency: plan.currency,
    status: "pending",
    idempotencyKey,
    expiresAt,
    metadata: {
      successUrl: env.PAYMENT_SUCCESS_URL,
      cancelUrl: env.PAYMENT_CANCEL_URL
    }
  });

  const providerCheckout = await createProviderCheckout(provider, transaction._id.toString());

  transaction.providerReference = providerCheckout.providerReference;
  transaction.checkoutUrl = providerCheckout.checkoutUrl;
  transaction.status = providerCheckout.status;
  await transaction.save();

  return {
    transaction,
    checkoutUrl: providerCheckout.checkoutUrl,
    provider
  };
}

export async function getCurrentSubscription(userId: string) {
  return SubscriptionModel.findOne({ userId }).sort({ currentPeriodEnd: -1 });
}

export async function markTransactionPaid(input: {
  provider: PaymentProvider;
  providerReference: string;
  metadata?: Record<string, unknown>;
}) {
  const transaction = await PaymentTransactionModel.findOneAndUpdate(
    {
      provider: input.provider,
      providerReference: input.providerReference
    },
    {
      status: "paid",
      paidAt: new Date(),
      metadata: input.metadata || {}
    },
    { new: true }
  );

  if (!transaction) {
    throw new Error("Payment transaction not found");
  }

  const now = new Date();
  const currentPeriodEnd = new Date(now);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  await SubscriptionModel.findOneAndUpdate(
    { userId: transaction.userId },
    {
      userId: transaction.userId,
      plan: transaction.plan,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd,
      providerReference: input.providerReference,
      latestTransactionId: transaction._id,
      cancelAtPeriodEnd: false
    },
    { upsert: true, new: true }
  );

  return transaction;
}

export async function listUserTransactions(userId: string) {
  return PaymentTransactionModel.find({ userId }).sort({ createdAt: -1 }).limit(25);
}
