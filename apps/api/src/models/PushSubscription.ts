import mongoose, { model, Schema } from "mongoose";

export interface IPushSubscription {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | null; // null for anonymous users
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  platform?: "web" | "android" | "ios" | "desktop";
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    endpoint: {
      type: String,
      required: true,
      unique: true
    },
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: null
    },
    platform: {
      type: String,
      enum: ["web", "android", "ios", "desktop"],
      default: "web"
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
pushSubscriptionSchema.index({ userId: 1, isActive: 1 });
pushSubscriptionSchema.index({ createdAt: -1 });

export const PushSubscriptionModel =
  mongoose.models.PushSubscription ||
  model<IPushSubscription>("PushSubscription", pushSubscriptionSchema);
