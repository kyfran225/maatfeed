import mongoose, { model, Schema } from "mongoose";

const debateThreadSchema = new Schema(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    debateScore: {
      type: Number,
      default: 0
    },
    participantCount: {
      type: Number,
      default: 0
    },
    topComments: [{
      commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      },
      score: Number,
      position: Number
    }],
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

debateThreadSchema.index({ debateScore: -1, participantCount: -1 }, { name: "idx_debate_participant" });
debateThreadSchema.index({ isActive: 1, debateScore: -1 }, { name: "idx_active_debate" });

export const DebateThreadModel = mongoose.models.DebateThread || model("DebateThread", debateThreadSchema);
