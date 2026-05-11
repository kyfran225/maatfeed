import mongoose, { model, Schema } from "mongoose";

export type SponsorshipType = "content" | "series" | "creator" | "event";
export type SponsorshipStatus = "pending" | "active" | "completed" | "cancelled" | "expired";
export type SponsorshipTier = "bronze" | "silver" | "gold" | "platinum";

export interface ISponsorship {
  _id: mongoose.Types.ObjectId;
  sponsorId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  type: SponsorshipType;
  tier: SponsorshipTier;
  amount: number;
  currency: string;
  duration: number; // in days
  message?: string;
  requirements?: string[];
  benefits?: string[];
  status: SponsorshipStatus;
  providerReference?: string;
  provider: string;
  metadata: Record<string, unknown>;
  startDate?: Date;
  endDate?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sponsorshipSchema = new Schema<ISponsorship>(
  {
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["content", "series", "creator", "event"],
      required: true,
      index: true
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 10000 // Minimum 100 FCFA
    },
    currency: {
      type: String,
      required: true,
      default: "XAF"
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 365 // Maximum 1 year
    },
    message: {
      type: String,
      maxlength: 1000,
      trim: true
    },
    requirements: [{
      type: String,
      maxlength: 200
    }],
    benefits: [{
      type: String,
      maxlength: 200
    }],
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled", "expired"],
      default: "pending",
      index: true
    },
    providerReference: {
      type: String,
      default: null,
      index: true
    },
    provider: {
      type: String,
      required: true,
      default: "paystack"
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
sponsorshipSchema.index({ sponsorId: 1, createdAt: -1 });
sponsorshipSchema.index({ creatorId: 1, createdAt: -1 });
sponsorshipSchema.index({ creatorId: 1, status: 1 });
sponsorshipSchema.index({ provider: 1, providerReference: 1 });
sponsorshipSchema.index({ endDate: 1, status: 1 });

export const SponsorshipModel =
  mongoose.models.Sponsorship ||
  model<ISponsorship>("Sponsorship", sponsorshipSchema);
