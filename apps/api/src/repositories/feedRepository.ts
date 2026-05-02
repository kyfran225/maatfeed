import { FeedSnapshotModel } from "../models/FeedSnapshot.js";
import { Types } from "mongoose";

export async function storeFeedSnapshot(input: {
  scope: "global" | "user" | "session";
  scopeId: string;
  contentIds: string[] | Types.ObjectId[];
  nextCursor: string | null;
}) {
  return FeedSnapshotModel.findOneAndUpdate(
    {
      scope: input.scope,
      scopeId: input.scopeId
    },
    {
      $set: {
        contentIds: input.contentIds,
        nextCursor: input.nextCursor
      }
    },
    {
      upsert: true,
      new: true
    }
  );
}

export async function getLatestSnapshot(scope: "global" | "user" | "session", scopeId: string) {
  return FeedSnapshotModel.findOne({
    scope,
    scopeId
  }).sort({ updatedAt: -1 });
}
