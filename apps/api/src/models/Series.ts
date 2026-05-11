import mongoose, { model, Schema } from "mongoose";

const seriesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    coverImage: {
      type: String,
      required: true
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ["education", "entertainment", "news", "culture", "technology", "business", "health", "sports", "other"]
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 30
    }],
    language: {
      type: String,
      required: true,
      default: "fr"
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    episodeCount: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    followerCount: {
      type: Number,
      default: 0
    },
    playCount: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    status: {
      type: String,
      enum: ["ongoing", "completed", "hiatus"],
      default: "ongoing"
    },
    releaseSchedule: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "monthly", "irregular"],
      default: "weekly"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
seriesSchema.index({ creatorId: 1, isPublic: 1 });
seriesSchema.index({ category: 1, isPublic: 1 });
seriesSchema.index({ followerCount: -1 });
seriesSchema.index({ playCount: -1 });
seriesSchema.index({ "rating.average": -1 });
seriesSchema.index({ createdAt: -1 });
seriesSchema.index({ tags: 1 });
seriesSchema.index({ isVerified: 1, isPublic: 1 });

export interface ISeries extends mongoose.Document {
  title: string;
  description: string;
  coverImage: string;
  creatorId: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  language: string;
  isPublic: boolean;
  isVerified: boolean;
  episodeCount: number;
  totalDuration: number;
  followerCount: number;
  playCount: number;
  rating: {
    average: number;
    count: number;
  };
  status: 'ongoing' | 'completed' | 'hiatus';
  releaseSchedule: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'irregular';
  createdAt: Date;
  updatedAt: Date;
}

export const SeriesModel = mongoose.models.Series || model("Series", seriesSchema);
