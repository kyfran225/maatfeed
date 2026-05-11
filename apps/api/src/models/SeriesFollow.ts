import mongoose, { model, Schema } from "mongoose";

const seriesFollowSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    seriesId: {
      type: Schema.Types.ObjectId,
      ref: "Series",
      required: true
    },
    followedAt: {
      type: Date,
      default: Date.now
    },
    notifications: {
      newEpisodes: {
        type: Boolean,
        default: true
      },
      seriesUpdates: {
        type: Boolean,
        default: false
      }
    },
    progress: {
      currentEpisode: {
        episodeId: {
          type: Schema.Types.ObjectId,
          ref: "SeriesEpisode"
        },
        episodeNumber: Number,
        seasonNumber: Number,
        watchedAt: Date
      },
      completedEpisodes: [{
        episodeId: {
          type: Schema.Types.ObjectId,
          ref: "SeriesEpisode"
        },
        episodeNumber: Number,
        seasonNumber: Number,
        completedAt: Date,
        watchDuration: Number
      }],
      totalWatchTime: {
        type: Number,
        default: 0
      },
      completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: {
      type: String,
      maxlength: 500
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
seriesFollowSchema.index({ userId: 1, seriesId: 1 }, { unique: true });
seriesFollowSchema.index({ userId: 1, followedAt: -1 });
seriesFollowSchema.index({ seriesId: 1, followedAt: -1 });
seriesFollowSchema.index({ "progress.completionPercentage": -1 });

export interface ISeriesFollow extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  seriesId: mongoose.Types.ObjectId;
  followedAt: Date;
  notifications: {
    newEpisodes: boolean;
    seriesUpdates: boolean;
  };
  progress: {
    currentEpisode?: {
      episodeId: mongoose.Types.ObjectId;
      episodeNumber: number;
      seasonNumber: number;
      watchedAt: Date;
    };
    completedEpisodes: Array<{
      episodeId: mongoose.Types.ObjectId;
      episodeNumber: number;
      seasonNumber: number;
      completedAt: Date;
      watchDuration: number;
    }>;
    totalWatchTime: number;
    completionPercentage: number;
  };
  rating?: number;
  notes?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const SeriesFollowModel = mongoose.models.SeriesFollow || model("SeriesFollow", seriesFollowSchema);
