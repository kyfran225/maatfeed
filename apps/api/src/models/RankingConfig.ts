import mongoose, { model, Schema } from "mongoose";

const rankingConfigSchema = new Schema(
  {
    versionTag: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    contentMix: {
      educational: { type: Number, required: true },
      viral: { type: Number, required: true },
      deep: { type: Number, required: true }
    },
    weights: {
      likes: { type: Number, required: true },
      comments: { type: Number, required: true },
      views: { type: Number, required: true },
      debateScore: { type: Number, required: true },
      userInterestMatch: { type: Number, required: true }
    },
    diversityRules: {
      maxSameSourceInWindow: { type: Number, required: true },
      maxSameBucketRun: { type: Number, required: true }
    }
  },
  {
    timestamps: true
  }
);

rankingConfigSchema.index({ versionTag: 1 }, { unique: true });
rankingConfigSchema.index({ active: 1 });

export const RankingConfigModel = mongoose.models.RankingConfig || model("RankingConfig", rankingConfigSchema);
