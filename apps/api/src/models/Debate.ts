import mongoose, { model, Schema, type Types } from "mongoose";

export interface IDebate {
  _id: Types.ObjectId;
  contentId: Types.ObjectId;
  title: string;
  description: string;
  creatorId: Types.ObjectId;
  creatorName: string;
  creatorAvatar?: string;
  
  // Debate settings
  isPublic: boolean;
  allowAnonymous: boolean;
  maxDuration?: number; // in hours
  endsAt?: Date;
  
  // Debate status
  status: "active" | "ended" | "paused" | "cancelled";
  participants: Types.ObjectId[];
  
  // Engagement metrics
  viewCount: number;
  responseCount: number;
  likeCount: number;
  shareCount: number;
  
  // Moderation
  isReported: boolean;
  reportCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const debateSchema = new Schema<IDebate>({
  contentId: {
    type: Schema.Types.ObjectId,
    ref: "Content",
    required: true
  },
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
    maxlength: 1000
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
  
  // Debate settings
  isPublic: {
    type: Boolean,
    default: true
  },
  allowAnonymous: {
    type: Boolean,
    default: true
  },
  maxDuration: {
    type: Number,
    default: 24, // 24 hours default
    min: 1,
    max: 168 // 1 week max
  },
  endsAt: {
    type: Date,
    default: null
  },
  
  // Debate status
  status: {
    type: String,
    enum: ["active", "ended", "paused", "cancelled"],
    default: "active"
  },
  participants: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    default: []
  },
  
  // Engagement metrics
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  responseCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  shareCount: {
    type: Number,
    default: 0,
    min: 0
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
debateSchema.index({ contentId: 1 });
debateSchema.index({ creatorId: 1, createdAt: -1 });
debateSchema.index({ status: 1, createdAt: -1 });
debateSchema.index({ isPublic: 1, status: 1, createdAt: -1 });
debateSchema.index({ isDeleted: 1, createdAt: -1 });
debateSchema.index({ participants: 1 });

export const DebateModel = mongoose.models.Debate || model<IDebate>("Debate", debateSchema);
