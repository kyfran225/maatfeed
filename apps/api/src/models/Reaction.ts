import mongoose, { model, Schema, type Types } from "mongoose";

export interface IReaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  contentId: Types.ObjectId;
  debateId?: Types.ObjectId;
  type: "like" | "love" | "laugh" | "angry" | "sad" | "save" | "share";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  contentId: {
    type: Schema.Types.ObjectId,
    ref: "Content",
    required: function() {
      return !this.debateId;
    }
  },
  debateId: {
    type: Schema.Types.ObjectId,
    ref: "Debate",
    required: function() {
      return !this.contentId;
    }
  },
  type: {
    type: String,
    enum: ["like", "love", "laugh", "angry", "sad", "save", "share"],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for performance and uniqueness
reactionSchema.index({ userId: 1, contentId: 1, type: 1 }, { unique: true });
reactionSchema.index({ userId: 1, debateId: 1, type: 1 }, { unique: true });
reactionSchema.index({ contentId: 1, type: 1 });
reactionSchema.index({ debateId: 1, type: 1 });
reactionSchema.index({ userId: 1, isActive: 1 });
reactionSchema.index({ createdAt: -1 });

export const ReactionModel = mongoose.models.Reaction || model<IReaction>("Reaction", reactionSchema);
