import mongoose, { model, Schema } from "mongoose";

const interactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      default: null,
      required: function (this: any) {
        return this.actionType !== "correction";
      }
    },
    actionType: {
      type: String,
      enum: [
        "view",
        "like",
        "save",
        "share",
        "comment",
        "reply",
        "report",
        "discussion_sort_selected",
        "discussion_reply_opened",
        "discussion_reply_mode_selected",
        "discussion_reply_submitted",
        "correction"
      ],
      required: true
    },
    watchDurationMs: {
      type: Number,
      default: 0
    },
    completionRatio: {
      type: Number,
      default: 0
    },
    sessionId: {
      type: String,
      default: null
    },
    engagedWith: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

interactionSchema.index({ contentId: 1, actionType: 1, createdAt: -1 });
interactionSchema.index({ userId: 1, contentId: 1, actionType: 1, createdAt: -1 });
interactionSchema.index({ contentId: 1, actionType: 1, "metadata.sortBy": 1, createdAt: -1 });
interactionSchema.index({ contentId: 1, actionType: 1, "metadata.replyMode": 1, createdAt: -1 });

export const InteractionModel = mongoose.models.Interaction || model("Interaction", interactionSchema);
