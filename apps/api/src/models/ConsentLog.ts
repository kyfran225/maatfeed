import mongoose, { model, Schema, type Types } from "mongoose";

export type ConsentType = "cookies" | "data_processing" | "marketing" | "analytics" | "functional";

export interface IConsentLog {
  userId?: Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  consentType: ConsentType;
  consentGiven: boolean;
  preferences?: Record<string, boolean>;
  timestamp: Date;
  version: string;
  legalBasis: "explicit_consent" | "legitimate_interest" | "contractual_necessity";
  purpose?: string;
  retentionPeriod?: Date;
  withdrawnAt?: Date;
}

const consentLogSchema = new Schema<IConsentLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    consentType: {
      type: String,
      enum: ["cookies", "data_processing", "marketing", "analytics", "functional"],
      required: true
    },
    consentGiven: {
      type: Boolean,
      required: true
    },
    preferences: {
      type: Map,
      of: Boolean,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    },
    version: {
      type: String,
      required: true,
      default: "1.0"
    },
    legalBasis: {
      type: String,
      enum: ["explicit_consent", "legitimate_interest", "contractual_necessity"],
      required: true
    },
    purpose: {
      type: String,
      default: null
    },
    retentionPeriod: {
      type: Date,
      default: null
    },
    withdrawnAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index pour les requêtes RGPD
consentLogSchema.index({ userId: 1, timestamp: -1 });
consentLogSchema.index({ consentType: 1, timestamp: -1 });
consentLogSchema.index({ ipAddress: 1, timestamp: -1 });
consentLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 * 5 }); // 5 ans

export const ConsentLogModel = mongoose.models.ConsentLog || model<IConsentLog>("ConsentLog", consentLogSchema);
