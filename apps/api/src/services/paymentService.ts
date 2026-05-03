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
import { UserModel } from "../models/User.js";
import { SubscriptionModel } from "../models/Subscription.js";

export const paymentPlans: Record<
  PaymentPlan,
  { id: PaymentPlan; name: string; amount: number; currency: "XOF"; interval: "month" | "one_time"; features: string[] }
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
  },
  donation_one_time: {
    id: "donation_one_time",
    name: "Soutien MAATFEED",
    amount: 1500,
    currency: "XOF",
    interval: "one_time",
    features: ["Don unique pour le projet", "Aide à la maintenance", "Support culturel francophone"]
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
  transaction: IPaymentTransaction
): Promise<{ providerReference: string; checkoutUrl: string; status: PaymentStatus }> {
  if (provider === "manual") {
    return {
      providerReference: createProviderReference(provider),
      checkoutUrl: buildFallbackCheckoutUrl(transaction._id.toString()),
      status: "pending"
    };
  }

  if (provider === "paystack") {
    if (!env.PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack secret key is not configured.");
    }

    const user = await UserModel.findById(transaction.userId);
    const email = user?.email || "support@maatfeed.com";
    const amountInKobo = transaction.amount * 100;

    const body = {
      email,
      amount: amountInKobo,
      currency: "XOF",
      callback_url: env.PAYMENT_SUCCESS_URL,
      metadata: {
        transactionId: transaction._id.toString(),
        provider: "paystack"
      }
    };

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok || !result?.data?.authorization_url || !result?.data?.reference) {
      logger.error({ provider, result }, "Paystack checkout initialization failed");
      throw new Error("Impossible d'initialiser le paiement Paystack.");
    }

    return {
      providerReference: result.data.reference,
      checkoutUrl: result.data.authorization_url,
      status: "pending"
    };
  }

  logger.warn(
    { provider },
    "Payment provider selected without a live adapter; returning pending checkout placeholder"
  );

  return {
    providerReference: createProviderReference(provider),
    checkoutUrl: buildFallbackCheckoutUrl(transaction._id.toString()),
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

  const providerCheckout = await createProviderCheckout(provider, transaction);

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

  const recurringPlans = ["premium_monthly", "creator_monthly"] as const;
  const isRecurring = recurringPlans.includes(transaction.plan as typeof recurringPlans[number]);

  if (isRecurring) {
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
  }

  return transaction;
}

export async function listUserTransactions(userId: string) {
  return PaymentTransactionModel.find({ userId }).sort({ createdAt: -1 }).limit(25);
}
