import mongoose, { model, Schema } from "mongoose";

const audioInteractionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    trackId: {
      type: Schema.Types.ObjectId,
      ref: "AudioTrack",
      required: true
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      default: null
    },
    interactionType: {
      type: String,
      enum: ["play", "pause", "complete", "skip", "like", "share"],
      required: true
    },
    listenDurationMs: {
      type: Number,
      default: 0
    },
    stopPositionSeconds: {
      type: Number,
      default: 0
    },
    trackDurationSeconds: {
      type: Number,
      default: 0
    },
    completionRatio: {
      type: Number,
      default: 0
    },
    repeatCount: {
      type: Number,
      default: 0
    },
    sessionId: {
      type: String,
      default: null
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

audioInteractionSchema.index({ trackId: 1, interactionType: 1, createdAt: -1 });
audioInteractionSchema.index({ userId: 1, trackId: 1, createdAt: -1 });
audioInteractionSchema.index({ sessionId: 1, trackId: 1, createdAt: -1 });
audioInteractionSchema.index({ contentId: 1, interactionType: 1, createdAt: -1 });

export const AudioInteractionModel =
  mongoose.models.AudioInteraction || model("AudioInteraction", audioInteractionSchema);
