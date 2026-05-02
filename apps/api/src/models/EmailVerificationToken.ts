import mongoose, { model, Schema } from "mongoose";
import crypto from "crypto";

export interface IEmailVerificationToken {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
}

const emailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    usedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    expireAfterSeconds: 604800 // Auto-delete after 7 days
  }
);

// Compound index for efficient queries
emailVerificationTokenSchema.index({ userId: 1, createdAt: -1 });
emailVerificationTokenSchema.index({ tokenHash: 1, expiresAt: 1 });

export const EmailVerificationTokenModel =
  mongoose.models.EmailVerificationToken ||
  model<IEmailVerificationToken>("EmailVerificationToken", emailVerificationTokenSchema);

// Helper functions for token generation and hashing
export function generateVerificationToken(): string {
  // Generate a 64-character random string
  return crypto.randomBytes(48).toString("hex");
}

export function hashVerificationToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Token expiry: 24 hours
export const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
