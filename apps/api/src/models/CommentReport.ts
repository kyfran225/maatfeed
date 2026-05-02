import mongoose, { model, Schema, type Types } from "mongoose";

export type ReportReason = "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export interface CommentReportDocument {
  _id: Types.ObjectId;
  commentId: Types.ObjectId | null;
  replyId: Types.ObjectId | null;
  reporterId: Types.ObjectId;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  moderatorId: Types.ObjectId | null;
  moderatorNote: string;
  resolution: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentReportSchema = new Schema(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true
    },
    replyId: {
      type: Schema.Types.ObjectId,
      ref: "Reply",
      default: null,
      index: true
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    reason: {
      type: String,
      enum: ["spam", "harassment", "hate_speech", "misinformation", "inappropriate", "other"],
      required: true
    },
    description: {
      type: String,
      maxlength: 500,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending",
      index: true
    },
    moderatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    moderatorNote: {
      type: String,
      maxlength: 500,
      default: ""
    },
    resolution: {
      type: String,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
commentReportSchema.index({ status: 1, createdAt: -1 });
commentReportSchema.index({ reporterId: 1, createdAt: -1 });
commentReportSchema.index({ commentId: 1, reporterId: 1 }, { unique: true, sparse: true });
commentReportSchema.index({ replyId: 1, reporterId: 1 }, { unique: true, sparse: true });

// Validate that either commentId or replyId is set
commentReportSchema.pre("save", function(next) {
  if (!this.commentId && !this.replyId) {
    return next(new Error("Either commentId or replyId must be set"));
  }
  if (this.commentId && this.replyId) {
    return next(new Error("Cannot set both commentId and replyId"));
  }
  next();
});

export const CommentReportModel = mongoose.models.CommentReport || model("CommentReport", commentReportSchema);
