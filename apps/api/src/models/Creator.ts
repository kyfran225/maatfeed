import mongoose, { model, Schema, type Types } from "mongoose";

export type CreatorStatus = "pending" | "verified" | "active" | "suspended";
export type CreatorTier = "basic" | "pro" | "premium";

export interface ICreator {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  displayName: string;
  bio: string;
  avatar?: string;
  coverImage?: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  status: CreatorStatus;
  tier: CreatorTier;
  verificationBadge?: {
    isVerified: boolean;
    verifiedAt?: Date;
    verificationMethod?: string;
  };
  stats: {
    totalFollowers: number;
    totalContent: number;
    totalViews: number;
    totalEngagement: number;
    avgWatchTime: number;
    followerGrowth: number; // percentage
  };
  settings: {
    allowComments: boolean;
    allowCollaboration: boolean;
    contentVisibility: "public" | "followers" | "private";
    notificationSettings: {
      newFollowers: boolean;
      comments: boolean;
      mentions: boolean;
      analytics: boolean;
    };
  };
  monetization: {
    isEnabled: boolean;
    paystackAccountId?: string;
    sponsorSettings: {
      acceptsSponsors: boolean;
      minimumAmount: number;
      sponsorTiers: Array<{
        name: string;
        amount: number;
        benefits: string[];
      }>;
    };
  };
  aiAssistance: {
    isEnabled: boolean;
    autoSummaries: boolean;
    contentSuggestions: boolean;
    audienceInsights: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const creatorSchema = new Schema<ICreator>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    bio: {
      type: String,
      required: true,
      maxlength: 500
    },
    avatar: {
      type: String,
      default: null
    },
    coverImage: {
      type: String,
      default: null
    },
    socialLinks: {
      website: { type: String, default: null },
      twitter: { type: String, default: null },
      instagram: { type: String, default: null },
      youtube: { type: String, default: null },
      linkedin: { type: String, default: null }
    },
    status: {
      type: String,
      enum: ["pending", "verified", "active", "suspended"],
      default: "pending"
    },
    tier: {
      type: String,
      enum: ["basic", "pro", "premium"],
      default: "basic"
    },
    verificationBadge: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
      verificationMethod: { type: String, default: null }
    },
    stats: {
      totalFollowers: { type: Number, default: 0 },
      totalContent: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      totalEngagement: { type: Number, default: 0 },
      avgWatchTime: { type: Number, default: 0 },
      followerGrowth: { type: Number, default: 0 }
    },
    settings: {
      allowComments: { type: Boolean, default: true },
      allowCollaboration: { type: Boolean, default: true },
      contentVisibility: { 
        type: String, 
        enum: ["public", "followers", "private"], 
        default: "public" 
      },
      notificationSettings: {
        newFollowers: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        analytics: { type: Boolean, default: true }
      }
    },
    monetization: {
      isEnabled: { type: Boolean, default: false },
      paystackAccountId: { type: String, default: null },
      sponsorSettings: {
        acceptsSponsors: { type: Boolean, default: false },
        minimumAmount: { type: Number, default: 1000 }, // in FCFA
        sponsorTiers: [{
          name: { type: String, required: true },
          amount: { type: Number, required: true },
          benefits: [{ type: String, required: true }]
        }]
      }
    },
    aiAssistance: {
      isEnabled: { type: Boolean, default: true },
      autoSummaries: { type: Boolean, default: true },
      contentSuggestions: { type: Boolean, default: true },
      audienceInsights: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
creatorSchema.index({ userId: 1 }, { unique: true });
creatorSchema.index({ status: 1 });
creatorSchema.index({ tier: 1 });
creatorSchema.index({ "stats.totalFollowers": -1 });
creatorSchema.index({ "stats.totalViews": -1 });
creatorSchema.index({ createdAt: -1 });

// Virtual for follower count
creatorSchema.virtual('followerCount', {
  ref: 'CreatorFollow',
  localField: '_id',
  foreignField: 'creatorId',
  count: true
});

// Pre-save middleware to update stats
creatorSchema.pre('save', function(next) {
  if (this.isModified('stats.totalFollowers')) {
    // Calculate follower growth based on historical data
    // This would be implemented with actual historical tracking
  }
  next();
});

export const CreatorModel = mongoose.models.Creator || model<ICreator>("Creator", creatorSchema);
