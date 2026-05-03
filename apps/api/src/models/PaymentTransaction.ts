import mongoose, { model, Schema } from "mongoose";

export type PaymentProvider = "manual" | "paystack" | "paydunya" | "fedapay" | "flutterwave" | "cinetpay" | "simiz";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "expired";
export type PaymentPlan = "premium_monthly" | "creator_monthly" | "donation_one_time";

export interface IPaymentTransaction {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  provider: PaymentProvider;
  plan: PaymentPlan;
  amount: number;
  currency: "XOF" | "USD" | "EUR";
  status: PaymentStatus;
  providerReference?: string;
  checkoutUrl?: string;
  idempotencyKey: string;
  metadata: Record<string, unknown>;
  paidAt?: Date;
  failedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: ["manual", "paystack", "paydunya", "fedapay", "flutterwave", "cinetpay", "simiz"],
      required: true,
      index: true
    },
    plan: {
      type: String,
      enum: ["premium_monthly", "creator_monthly"],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      enum: ["XOF", "USD", "EUR"],
      default: "XOF"
    },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed", "cancelled", "expired"],
      default: "pending",
      index: true
    },
    providerReference: {
      type: String,
      default: null,
      index: true
    },
    checkoutUrl: {
      type: String,
      default: null
    },
    idempotencyKey: {
      type: String,
      required: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    paidAt: {
      type: Date,
      default: null
    },
    failedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ provider: 1, providerReference: 1 });
paymentTransactionSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });

export const PaymentTransactionModel =
  mongoose.models.PaymentTransaction ||
  model<IPaymentTransaction>("PaymentTransaction", paymentTransactionSchema);
