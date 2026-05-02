import mongoose, { model, Schema, type Types } from "mongoose";

export interface EditHistoryEntry {
  body: string;
  editedAt: Date;
}

export interface CommentDocument {
  _id: Types.ObjectId;
  contentId: Types.ObjectId;
  userId: Types.ObjectId | null;
  aiGenerated?: boolean;
  aiPersona?: string | null;
  aiPersonaName?: string | null;
  aiPersonaAvatar?: string | null;
  inReplyToCommentId?: Types.ObjectId | null;
  replyToCommentId?: Types.ObjectId | null;
  replyToReplyId?: Types.ObjectId | null;
  replyMode?: "nested" | "flat" | null;
  body: string;
  debateScore: number;
  moderationStatus: "approved" | "blocked" | "hidden";
  moderationReason: string | null;
  hidden: boolean;
  hiddenAt: Date | null;
  hiddenBy: Types.ObjectId | null;
  adminOverride: boolean;
  reportCount: number;
  analysis: {
    debateScore: number;
    questionScore: number;
    emotionScore: number;
    toxicityScore: number;
    spamScore: number;
    qualityScore: number;
  };
  qualityScore: number;
  likeCount: number;
  replyCount: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
  deleteReason: string | null;
  editHistory: EditHistoryEntry[];
  lastEditedAt: Date | null;
  mentions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const editHistorySchema = new Schema(
  {
    body: { type: String, required: true },
    editedAt: { type: Date, required: true }
  },
  { _id: false }
);

const commentSchema = new Schema(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function(this: any) { return !this.aiGenerated; },
      index: true
    },
    // Champs pour les commentaires IA
    aiGenerated: {
      type: Boolean,
      default: false,
      index: true
    },
    aiPersona: {
      type: String,
      default: null
    },
    aiPersonaName: {
      type: String,
      default: null
    },
    aiPersonaAvatar: {
      type: String,
      default: null
    },
    inReplyToCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true
    },
    replyToCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true
    },
    replyToReplyId: {
      type: Schema.Types.ObjectId,
      ref: "Reply",
      default: null,
      index: true
    },
    replyMode: {
      type: String,
      enum: ["nested", "flat"],
      default: null,
      index: true
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    debateScore: {
      type: Number,
      default: 0
    },
    moderationStatus: {
      type: String,
      enum: ["approved", "blocked", "hidden"],
      default: "approved",
      index: true
    },
    moderationReason: {
      type: String,
      default: null
    },
    hidden: {
      type: Boolean,
      default: false,
      index: true
    },
    hiddenAt: {
      type: Date,
      default: null
    },
    hiddenBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    adminOverride: {
      type: Boolean,
      default: false
    },
    reportCount: {
      type: Number,
      default: 0
    },
    analysis: {
      debateScore: { type: Number, default: 0 },
      questionScore: { type: Number, default: 0 },
      emotionScore: { type: Number, default: 0 },
      toxicityScore: { type: Number, default: 0 },
      spamScore: { type: Number, default: 0 },
      qualityScore: { type: Number, default: 0 }
    },
    qualityScore: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    },
    replyCount: {
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
      type: [editHistorySchema],
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

// Compound indexes for efficient querying
commentSchema.index({ contentId: 1, isDeleted: 1, debateScore: -1, createdAt: -1 }, { name: "idx_content_active_debate" });
commentSchema.index({ contentId: 1, isDeleted: 1, createdAt: -1 }, { name: "idx_content_active_recent" });
commentSchema.index({ contentId: 1, isDeleted: 1, likeCount: -1, createdAt: -1 }, { name: "idx_content_active_popular" });
commentSchema.index({ contentId: 1, hidden: 1, moderationStatus: 1, createdAt: -1 }, { name: "idx_content_visible_status" });
commentSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 }, { name: "idx_user_active_comments" });
commentSchema.index({ mentions: 1, createdAt: -1 }, { name: "idx_mentions_recent" });

// Text index for search
commentSchema.index({ body: "text" }, { name: "idx_body_text" });

export const CommentModel = mongoose.models.Comment || model("Comment", commentSchema);
