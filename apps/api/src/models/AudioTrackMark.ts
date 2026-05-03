import mongoose, { model, Schema, type Types } from "mongoose";

export interface AudioTrackMarkDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  trackId: Types.ObjectId;
  mark: "kept" | "review";
  createdAt: Date;
  updatedAt: Date;
}

const audioTrackMarkSchema = new Schema(
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
    mark: {
      type: String,
      enum: ["kept", "review"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index pour éviter les doublons et optimiser les requêtes
audioTrackMarkSchema.index({ userId: 1, trackId: 1 }, { unique: true });
audioTrackMarkSchema.index({ userId: 1, mark: 1 });
audioTrackMarkSchema.index({ userId: 1, updatedAt: -1 });

export const AudioTrackMarkModel =
  mongoose.models.AudioTrackMark || model("AudioTrackMark", audioTrackMarkSchema);
