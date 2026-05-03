import mongoose, { model, Schema, type Types } from "mongoose";

export type LearningProgressStatus = "new" | "learned" | "review";

export interface LearningProgressDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  contentId: Types.ObjectId;
  status: LearningProgressStatus;
  quizAttempts: number;
  correctQuizAttempts: number;
  lastQuizResult?: boolean | null;
  lastReviewedAt?: Date | null;
  nextReviewAt?: Date | null;
  learnedAt?: Date | null;
  lastNotifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const learningProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true
    },
    status: {
      type: String,
      enum: ["new", "learned", "review"],
      default: "new",
      required: true
    },
    quizAttempts: {
      type: Number,
      default: 0
    },
    correctQuizAttempts: {
      type: Number,
      default: 0
    },
    lastQuizResult: {
      type: Boolean,
      default: null
    },
    lastReviewedAt: {
      type: Date,
      default: null
    },
    nextReviewAt: {
      type: Date,
      default: null
    },
    learnedAt: {
      type: Date,
      default: null,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true
  }
);

learningProgressSchema.index({ userId: 1, contentId: 1 }, { unique: true });
learningProgressSchema.index({ userId: 1, status: 1, nextReviewAt: 1 });

export const LearningProgressModel =
  mongoose.models.LearningProgress || model("LearningProgress", learningProgressSchema);
