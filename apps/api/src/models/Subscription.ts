import mongoose, { model, Schema } from "mongoose";
import type { PaymentPlan } from "./PaymentTransaction.js";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired";

export interface ISubscription {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  plan: PaymentPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  providerReference?: string;
  latestTransactionId?: mongoose.Types.ObjectId;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    plan: {
      type: String,
      enum: ["premium_monthly", "creator_monthly"],
      required: true
    },
    status: {
      type: String,
      enum: ["trialing", "active", "past_due", "cancelled", "expired"],
      default: "active",
      index: true
    },
    currentPeriodStart: {
      type: Date,
      required: true
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      index: true
    },
    providerReference: {
      type: String,
      default: null
    },
    latestTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      default: null
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1, status: 1 });

export const SubscriptionModel =
  mongoose.models.Subscription ||
  model<ISubscription>("Subscription", subscriptionSchema);
