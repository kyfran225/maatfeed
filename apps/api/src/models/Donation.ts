import mongoose, { model, Schema } from "mongoose";

export type DonationType = "tip" | "donation" | "support";
export type DonationStatus = "pending" | "completed" | "failed" | "refunded";

export interface IDonation {
  _id: mongoose.Types.ObjectId;
  donorId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  type: DonationType;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  status: DonationStatus;
  providerReference?: string;
  provider: string;
  metadata: Record<string, unknown>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    donorId: {
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
      enum: ["tip", "donation", "support"],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 100, // Minimum 1 FCFA (100 kobo)
      max: 1000000 // Maximum 10,000 FCFA
    },
    currency: {
      type: String,
      required: true,
      default: "XAF"
    },
    message: {
      type: String,
      maxlength: 500,
      trim: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
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
donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ creatorId: 1, createdAt: -1 });
donationSchema.index({ creatorId: 1, status: 1 });
donationSchema.index({ provider: 1, providerReference: 1 });

export const DonationModel =
  mongoose.models.Donation ||
  model<IDonation>("Donation", donationSchema);
