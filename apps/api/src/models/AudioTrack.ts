import mongoose, { model, Schema } from "mongoose";

const audioTrackSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    artist: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    mediaUrl: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in seconds
      required: true
    },
    coverImageUrl: {
      type: String
    },
    tags: [{
      type: String,
      trim: true
    }],
    genre: {
      type: String,
      enum: ["kemet", "spiritual", "educational", "debate", "ambient"],
      default: "kemet"
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content"
    },
    sourceProvider: {
      type: String,
      default: "internal"
    },
    sourcePageUrl: {
      type: String,
      default: null
    },
    externalSourceId: {
      type: String,
      default: null
    },
    contextUrl: {
      type: String,
      default: null
    },
    contextTitle: {
      type: String,
      default: null
    },
    contextType: {
      type: String,
      enum: ["video", "debate", "article", "reference"],
      default: null
    },
    playCount: {
      type: Number,
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: true
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
    }
  },
  {
    timestamps: true
  }
);

audioTrackSchema.index({ genre: 1, playCount: -1 });
audioTrackSchema.index({ contentId: 1 });
audioTrackSchema.index({ isPublic: 1, createdAt: -1 });
audioTrackSchema.index({ externalSourceId: 1 }, { sparse: true });
audioTrackSchema.index({ isDeleted: 1, createdAt: -1 });

export const AudioTrackModel = mongoose.models.AudioTrack || model("AudioTrack", audioTrackSchema);
