import mongoose, { model, Schema, type Types } from "mongoose";

export interface CommentLikeDocument {
  _id: Types.ObjectId;
  commentId: Types.ObjectId | null;
  replyId: Types.ObjectId | null;
  userId: Types.ObjectId;
  createdAt: Date;
}

const commentLikeSchema = new Schema(
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient lookups
commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true, sparse: true });
commentLikeSchema.index({ replyId: 1, userId: 1 }, { unique: true, sparse: true });
commentLikeSchema.index({ userId: 1, createdAt: -1 });

// Validate that either commentId or replyId is set, but not both
commentLikeSchema.pre("save", function(next) {
  if (!this.commentId && !this.replyId) {
    return next(new Error("Either commentId or replyId must be set"));
  }
  if (this.commentId && this.replyId) {
    return next(new Error("Cannot set both commentId and replyId"));
  }
  next();
});

export const CommentLikeModel = mongoose.models.CommentLike || model("CommentLike", commentLikeSchema);
