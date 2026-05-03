import mongoose, { model, Schema, type Types } from "mongoose";

export interface SavedAudioTrackDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  trackId: Types.ObjectId;
  lastListenPosition: number; // seconds
  completionRatio: number; // 0-1
  savedAt: Date;
  completedAt?: Date | null;
  updatedAt: Date;
}

const savedAudioTrackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    trackId: {
      type: Schema.Types.ObjectId,
      ref: "AudioTrack",
      required: true
    },
    lastListenPosition: {
      type: Number,
      default: 0
    },
    completionRatio: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

savedAudioTrackSchema.index({ userId: 1, trackId: 1 }, { unique: true });
savedAudioTrackSchema.index({ userId: 1, savedAt: -1 });
savedAudioTrackSchema.index({ userId: 1, completedAt: 1 });

export const SavedAudioTrackModel =
  mongoose.models.SavedAudioTrack || model("SavedAudioTrack", savedAudioTrackSchema);
