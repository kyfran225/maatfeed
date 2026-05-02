import mongoose, { model, Schema } from "mongoose";
import crypto from "crypto";

export interface IPasswordResetToken {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
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
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    expireAfterSeconds: 604800 // Auto-delete after 7 days
  }
);

// Compound indexes for efficient queries
passwordResetTokenSchema.index({ userId: 1, createdAt: -1 });
passwordResetTokenSchema.index({ tokenHash: 1, expiresAt: 1 });

export const PasswordResetTokenModel =
  mongoose.models.PasswordResetToken ||
  model<IPasswordResetToken>("PasswordResetToken", passwordResetTokenSchema);

// Helper functions for token generation and hashing
export function generatePasswordResetToken(): string {
  // Generate a 64-character random string (32 bytes = 64 hex chars)
  return crypto.randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Token expiry: 1 hour (best practice for security)
export const PASSWORD_RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;
