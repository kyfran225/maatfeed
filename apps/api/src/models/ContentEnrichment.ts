import mongoose, { model, Schema } from "mongoose";

const contentEnrichmentSchema = new Schema(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    keyIdeas: {
      type: [String],
      default: []
    },
    debatePrompt: {
      type: String,
      default: ""
    },
    thematicTags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

contentEnrichmentSchema.index({ contentId: 1 }, { unique: true });

export const ContentEnrichmentModel = mongoose.models.ContentEnrichment || model("ContentEnrichment", contentEnrichmentSchema);
