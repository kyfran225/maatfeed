import mongoose, { model, Schema } from "mongoose";

const seriesEpisodeSchema = new Schema(
  {
    seriesId: {
      type: Schema.Types.ObjectId,
      ref: "Series",
      required: true
    },
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
    episodeNumber: {
      type: Number,
      required: true
    },
    seasonNumber: {
      type: Number,
      default: 1
    },
    audioUrl: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String
    },
    coverImage: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    transcript: {
      text: String,
      language: {
        type: String,
        default: "fr"
      }
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 30
    }],
    isPublic: {
      type: Boolean,
      default: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    },
    playCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
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
    metadata: {
      language: {
        type: String,
        default: "fr"
      },
      quality: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
      },
      format: {
        type: String,
        enum: ["audio", "video", "both"],
        default: "audio"
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
seriesEpisodeSchema.index({ seriesId: 1, episodeNumber: 1 });
seriesEpisodeSchema.index({ seriesId: 1, publishedAt: -1 });
seriesEpisodeSchema.index({ isPublic: 1, isPublished: 1 });
seriesEpisodeSchema.index({ playCount: -1 });
seriesEpisodeSchema.index({ publishedAt: -1 });
seriesEpisodeSchema.index({ tags: 1 });

// Ensure unique episode number within series
seriesEpisodeSchema.index({ seriesId: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });

export interface ISeriesEpisode extends mongoose.Document {
  seriesId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  episodeNumber: number;
  seasonNumber: number;
  audioUrl: string;
  videoUrl?: string;
  coverImage: string;
  duration: number;
  fileSize: number;
  transcript: {
    text?: string;
    language: string;
  };
  tags: string[];
  isPublic: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  playCount: number;
  likeCount: number;
  commentCount: number;
  rating: {
    average: number;
    count: number;
  };
  metadata: {
    language: string;
    quality: 'low' | 'medium' | 'high';
    format: 'audio' | 'video' | 'both';
  };
  createdAt: Date;
  updatedAt: Date;
}

export const SeriesEpisodeModel = mongoose.models.SeriesEpisode || model("SeriesEpisode", seriesEpisodeSchema);
