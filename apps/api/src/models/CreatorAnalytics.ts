import mongoose, { model, Schema, type Types } from "mongoose";

export interface ICreatorAnalytics {
  _id: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  date: Date; // Daily analytics
  period: "daily" | "weekly" | "monthly";
  
  // Content metrics
  content: {
    totalViews: number;
    uniqueViews: number;
    avgWatchTime: number; // in seconds
    completionRate: number; // percentage
    shares: number;
    downloads: number;
  };
  
  // Engagement metrics
  engagement: {
    likes: number;
    comments: number;
    replies: number;
    mentions: number;
    newFollowers: number;
    unfollows: number;
  };
  
  // Audience metrics
  audience: {
    totalFollowers: number;
    activeFollowers: number; // followers who engaged in period
    newFollowers: number;
    demographics: {
      ageGroups: Record<string, number>;
      gender: Record<string, number>;
      locations: Record<string, number>;
      interests: Record<string, number>;
    };
  };
  
  // Revenue metrics
  revenue: {
    total: number;
    fromSponsors: number;
    fromPremium: number;
    fromDonations: number;
    transactions: number;
  };
  
  // Content performance
  topContent: Array<{
    contentId: Types.ObjectId;
    title: string;
    views: number;
    engagement: number;
    completionRate: number;
  }>;
  
  // Growth metrics
  growth: {
    followerGrowthRate: number; // percentage
    viewGrowthRate: number; // percentage
    engagementGrowthRate: number; // percentage
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const creatorAnalyticsSchema = new Schema<ICreatorAnalytics>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "Creator",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true
    },
    content: {
      totalViews: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      avgWatchTime: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 }
    },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      replies: { type: Number, default: 0 },
      mentions: { type: Number, default: 0 },
      newFollowers: { type: Number, default: 0 },
      unfollows: { type: Number, default: 0 }
    },
    audience: {
      totalFollowers: { type: Number, default: 0 },
      activeFollowers: { type: Number, default: 0 },
      newFollowers: { type: Number, default: 0 },
      demographics: {
        ageGroups: { type: Schema.Types.Mixed, default: {} },
        gender: { type: Schema.Types.Mixed, default: {} },
        locations: { type: Schema.Types.Mixed, default: {} },
        interests: { type: Schema.Types.Mixed, default: {} }
      }
    },
    revenue: {
      total: { type: Number, default: 0 },
      fromSponsors: { type: Number, default: 0 },
      fromPremium: { type: Number, default: 0 },
      fromDonations: { type: Number, default: 0 },
      transactions: { type: Number, default: 0 }
    },
    topContent: [{
      contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
      title: { type: String, required: true },
      views: { type: Number, required: true },
      engagement: { type: Number, required: true },
      completionRate: { type: Number, required: true }
    }],
    growth: {
      followerGrowthRate: { type: Number, default: 0 },
      viewGrowthRate: { type: Number, default: 0 },
      engagementGrowthRate: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
creatorAnalyticsSchema.index({ creatorId: 1, date: -1 });
creatorAnalyticsSchema.index({ creatorId: 1, period: 1, date: -1 });
creatorAnalyticsSchema.index({ date: -1 });

// Ensure no duplicate analytics for same creator, date, and period
creatorAnalyticsSchema.index({ creatorId: 1, date: 1, period: 1 }, { unique: true });

export const CreatorAnalyticsModel = mongoose.models.CreatorAnalytics || model<ICreatorAnalytics>("CreatorAnalytics", creatorAnalyticsSchema);
