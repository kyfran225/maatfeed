import mongoose, { model, Schema, type Types } from "mongoose";

export interface IContent {
  _id: Types.ObjectId;
  title: string;
  description: string;
  mediaType: "audio" | "video" | "text";
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  creatorId: Types.ObjectId;
  creatorName: string;
  creatorAvatar?: string;
  tags: string[];
  category: string;
  language: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Feed scoring
  score: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  
  // Content metadata
  sourceProvider: "internal" | "youtube" | "tiktok" | "community";
  externalId?: string;
  sourceUrl?: string;
  
  // Debate attachment
  debateId?: Types.ObjectId;
  hasDebate: boolean;
  
  // Moderation
  isReported: boolean;
  reportCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
}

const contentSchema = new Schema<IContent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  mediaType: {
    type: String,
    enum: ["audio", "video", "text"],
    required: true,
    default: "text"
  },
  mediaUrl: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: null
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  creatorName: {
    type: String,
    required: true,
    trim: true
  },
  creatorAvatar: {
    type: String,
    default: null
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 10;
      },
      message: 'Maximum 10 tags allowed'
    }
  },
  category: {
    type: String,
    required: true,
    enum: ["debate", "music", "podcast", "news", "education", "entertainment", "sports", "technology", "business", "health", "other"]
  },
  language: {
    type: String,
    required: true,
    default: "fr"
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  
  // Feed scoring fields
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: {
    type: Number,
    default: 0,
    min: 0
  },
  comments: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Source tracking
  sourceProvider: {
    type: String,
    enum: ["internal", "youtube", "tiktok", "community"],
    required: true,
    default: "internal"
  },
  externalId: {
    type: String,
    default: null
  },
  sourceUrl: {
    type: String,
    default: null
  },
  
  // Debate attachment
  debateId: {
    type: Schema.Types.ObjectId,
    ref: "Debate",
    default: null
  },
  hasDebate: {
    type: Boolean,
    default: false
  },
  
  // Moderation
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
contentSchema.index({ creatorId: 1, createdAt: -1 });
contentSchema.index({ category: 1, score: -1 });
contentSchema.index({ isPublished: 1, publishedAt: -1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ language: 1, score: -1 });
contentSchema.index({ hasDebate: 1, score: -1 });
contentSchema.index({ isDeleted: 1, createdAt: -1 });

// Text search index
contentSchema.index({
  title: "text",
  description: "text",
  tags: "text"
});

export const ContentModel = mongoose.models.Content || model<IContent>("Content", contentSchema);
