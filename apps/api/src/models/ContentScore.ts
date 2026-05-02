import mongoose, { model, Schema } from "mongoose";

const contentScoreSchema = new Schema(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    debateScore: {
      type: Number,
      default: 0
    },
    recencyBoost: {
      type: Number,
      default: 0
    },
    finalScore: {
      type: Number,
      default: 0
    },
    scoreVersion: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

contentScoreSchema.index({ contentId: 1 }, { unique: true });
contentScoreSchema.index({ finalScore: -1 });

export const ContentScoreModel = mongoose.models.ContentScore || model("ContentScore", contentScoreSchema);
