import mongoose, { model, Schema } from "mongoose";

const contentClassificationSchema = new Schema(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true
    },
    bucket: {
      type: String,
      enum: ["viral", "educational", "deep"],
      required: true
    },
    debateScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    emotionScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    educationScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    }
  },
  {
    timestamps: true
  }
);

contentClassificationSchema.index({ contentId: 1 }, { unique: true });
contentClassificationSchema.index({ bucket: 1 });

export const ContentClassificationModel = mongoose.models.ContentClassification || model("ContentClassification", contentClassificationSchema);
