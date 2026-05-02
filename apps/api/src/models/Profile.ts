import mongoose, { model, Schema, type Types } from "mongoose";

const profileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    interests: {
      type: Map,
      of: Number,
      default: {}
    },
    mutedTopics: {
      type: [String],
      default: []
    },
    savedContentIds: {
      type: [Schema.Types.ObjectId],
      default: []
    },
    preferences: {
      contentMix: {
        viral: { type: Number, default: 0.3, min: 0, max: 1 },
        educational: { type: Number, default: 0.4, min: 0, max: 1 },
        deep: { type: Number, default: 0.3, min: 0, max: 1 }
      }
    },
    avatar: {
      type: String,
      default: null
    },
    profileImageUrl: {
      type: String,
      default: null
    },
    communityProfile: {
      debate: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      contributions: { type: Number, default: 0 },
      reports: { type: Number, default: 0 },
      lastInteractionAt: { type: Date, default: null }
    },
    categoryScores: {
      type: Map,
      of: Number,
      default: {}
    },
    learningEvolution: {
      type: Schema.Types.Mixed,
      default: {}
    },
    learningRecommendations: {
      type: [Schema.Types.Mixed],
      default: []
    },
    learningScore: {
      type: Number,
      default: 0
    },
    lastLearningUpdate: {
      type: Date,
      default: null
    },
    lastRecommendationUpdate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

profileSchema.index({ userId: 1 }, { unique: true });

export interface ProfileDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  displayName: string;
  avatar?: string | null;
  profileImageUrl?: string | null;
  onboardingCompleted?: boolean;
  interests?: Map<string, number>;
  mutedTopics?: string[];
  savedContentIds?: Types.ObjectId[];
  preferences?: {
    contentMix: {
      viral: number;
      educational: number;
      deep: number;
    };
  };
  communityProfile?: {
    debate: number;
    education: number;
    contributions: number;
    reports: number;
    lastInteractionAt?: Date | null;
  };
  categoryScores?: Record<string, number>;
  learningEvolution?: Record<string, unknown> & {
    lastWeek?: {
      totalInteractions?: number;
      averageQuality?: number;
      [key: string]: unknown;
    };
  };
  learningRecommendations?: unknown[];
  learningScore?: number;
  lastLearningUpdate?: Date | null;
  lastRecommendationUpdate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProfileModel = mongoose.models.Profile || model("Profile", profileSchema);
