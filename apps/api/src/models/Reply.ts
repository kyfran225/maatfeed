import mongoose, { model, Schema, type Types } from "mongoose";

export interface ReplyEditHistoryEntry {
  body: string;
  editedAt: Date;
}

export interface ReplyDocument {
  _id: Types.ObjectId;
  commentId: Types.ObjectId;
  parentReplyId: Types.ObjectId | null;
  userId: Types.ObjectId;
  body: string;
  likeCount: number;
  nestedReplyCount: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
  deleteReason: string | null;
  editHistory: ReplyEditHistoryEntry[];
  lastEditedAt: Date | null;
  mentions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const replyEditHistorySchema = new Schema(
  {
    body: { type: String, required: true },
    editedAt: { type: Date, required: true }
  },
  { _id: false }
);

const replySchema = new Schema(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
      index: true
    },
    parentReplyId: {
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
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    likeCount: {
      type: Number,
      default: 0
    },
    nestedReplyCount: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    deleteReason: {
      type: String,
      default: null
    },
    editHistory: {
      type: [replyEditHistorySchema],
      default: []
    },
    lastEditedAt: {
      type: Date,
      default: null
    },
    mentions: {
      type: [String],
      default: [],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
replySchema.index({ commentId: 1, parentReplyId: 1, isDeleted: 1, createdAt: 1 }, { name: "idx_comment_nested_active" });
replySchema.index({ parentReplyId: 1, isDeleted: 1, createdAt: 1 }, { name: "idx_parent_active_recent" });
replySchema.index({ userId: 1, isDeleted: 1, createdAt: -1 }, { name: "idx_user_active_replies" });

// Text index for search
replySchema.index({ body: "text" }, { name: "idx_body_text" });

export const ReplyModel = mongoose.models.Reply || model("Reply", replySchema);
