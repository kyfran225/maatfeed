import mongoose, { model, Schema, type Types } from "mongoose";

export interface ContentDocument {
  _id: Types.ObjectId;
  sourceProvider: "youtube" | "tiktok" | "internal" | "community";
  externalId: string;
  canonicalUrl: string;
  sourceUrl?: string | null;
  mediaType: "video" | "audio";
  mediaUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  description: string;
  creatorName: string;
  transcript: string;
  tags: string[];
  processingStatus: "raw" | "classified" | "enriched" | "published" | "failed";
  publishedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  deleteReason?: string | null;
  metadata?: {
    communityPostId?: Types.ObjectId | null;
    originalAuthor?: Types.ObjectId | null;
    transformationScore?: number;
    viralityStatus?: string;
  };
  contentType?: "video" | "article" | null;
  duration?: number | null;
  language?: string;
  globalFeedBoost?: number;
  lastBoostedAt?: Date | null;
  boostType?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema(
  {
    sourceProvider: {
      type: String,
      enum: ["youtube", "tiktok", "internal", "community"],
      required: true
    },
    externalId: {
      type: String,
      required: true
    },
    canonicalUrl: {
      type: String,
      required: true
    },
    sourceUrl: {
      type: String,
      default: null
    },
    mediaType: {
      type: String,
      enum: ["video", "audio"],
      required: true
    },
    mediaUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    creatorName: {
      type: String,
      required: true
    },
    transcript: {
      type: String,
      default: ""
    },
    tags: {
      type: [String],
      default: []
    },
    processingStatus: {
      type: String,
      enum: ["raw", "classified", "enriched", "published", "failed"],
      default: "raw"
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    isDeleted: {
      type: Boolean,
      default: false
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
    metadata: {
      communityPostId: {
        type: Schema.Types.ObjectId,
        ref: "CommunityPost",
        default: null
      },
      originalAuthor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
      },
      transformationScore: {
        type: Number,
        default: 0
      },
      viralityStatus: {
        type: String,
        default: null
      }
    },
    contentType: {
      type: String,
      enum: ["video", "article"],
      default: null
    },
    duration: {
      type: Number,
      default: null
    },
    language: {
      type: String,
      default: "fr"
    },
    globalFeedBoost: {
      type: Number,
      default: 0
    },
    lastBoostedAt: {
      type: Date,
      default: null
    },
    boostType: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

contentSchema.index({ sourceProvider: 1, externalId: 1 }, { unique: true });
contentSchema.index({ processingStatus: 1, publishedAt: -1 });
contentSchema.index({ title: "text", description: "text", tags: "text" });
contentSchema.index({ isDeleted: 1, createdAt: -1 });

export const ContentModel = mongoose.models.Content || model("Content", contentSchema);
