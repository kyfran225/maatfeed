import mongoose, { model, Schema } from "mongoose";

const feedSnapshotSchema = new Schema(
  {
    scope: {
      type: String,
      enum: ["global", "user", "session"],
      required: true
    },
    scopeId: {
      type: String,
      required: true
    },
    contentIds: {
      type: [Schema.Types.ObjectId],
      required: true,
      default: []
    },
    nextCursor: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

feedSnapshotSchema.index({ scope: 1, scopeId: 1, createdAt: -1 });

export const FeedSnapshotModel = mongoose.models.FeedSnapshot || model("FeedSnapshot", feedSnapshotSchema);
