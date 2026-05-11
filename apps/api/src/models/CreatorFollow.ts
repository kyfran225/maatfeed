import mongoose, { model, Schema, type Types } from "mongoose";

export interface ICreatorFollow {
  _id: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  followerId: mongoose.Types.ObjectId;
  followedAt: Date;
  notifications: {
    newContent: boolean;
    newEpisodes: boolean;
    liveStreams: boolean;
    updates: boolean;
  };
  tier?: "free" | "premium"; // For premium follows
  isActive: boolean;
}

const creatorFollowSchema = new Schema<ICreatorFollow>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "Creator",
      required: true
    },
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    followedAt: {
      type: Date,
      default: Date.now
    },
    notifications: {
      newContent: { type: Boolean, default: true },
      newEpisodes: { type: Boolean, default: true },
      liveStreams: { type: Boolean, default: false },
      updates: { type: Boolean, default: false }
    },
    tier: {
      type: String,
      enum: ["free", "premium"],
      default: "free"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate follows
creatorFollowSchema.index({ creatorId: 1, followerId: 1 }, { unique: true });
creatorFollowSchema.index({ creatorId: 1, isActive: 1 });
creatorFollowSchema.index({ followerId: 1, isActive: 1 });
creatorFollowSchema.index({ followedAt: -1 });

export const CreatorFollowModel = mongoose.models.CreatorFollow || model<ICreatorFollow>("CreatorFollow", creatorFollowSchema);
