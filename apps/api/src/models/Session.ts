import mongoose, { model, Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    refreshTokenHash: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

sessionSchema.index({ userId: 1, expiresAt: 1 });
sessionSchema.index({ userId: 1, refreshTokenHash: 1 });

export const SessionModel = mongoose.models.Session || model("Session", sessionSchema);
