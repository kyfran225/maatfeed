import { InteractionModel } from "../models/Interaction.js";

export async function createInteraction(input: {
  userId?: string | null;
  contentId: string;
  actionType:
    | "view"
    | "like"
    | "save"
    | "share"
    | "comment"
    | "reply"
    | "report"
    | "discussion_sort_selected"
    | "discussion_reply_opened"
    | "discussion_reply_mode_selected"
    | "discussion_reply_submitted";
  watchDurationMs?: number;
  completionRatio?: number;
  sessionId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return InteractionModel.create({
    userId: input.userId ?? null,
    contentId: input.contentId,
    actionType: input.actionType,
    watchDurationMs: input.watchDurationMs ?? 0,
    completionRatio: input.completionRatio ?? 0,
    sessionId: input.sessionId ?? null,
    metadata: input.metadata ?? null
  });
}

export async function checkUserInteraction(
  contentId: string,
  userId: string,
  actionType: "like" | "save" | "share"
): Promise<boolean> {
  if (!userId) return false;
  const interaction = await InteractionModel.findOne({
    contentId,
    userId,
    actionType
  });
  return !!interaction;
}

export async function deleteInteraction(
  contentId: string,
  userId: string,
  actionType: "like" | "save" | "share"
): Promise<boolean> {
  if (!userId) return false;
  const result = await InteractionModel.deleteOne({
    contentId,
    userId,
    actionType
  });
  return result.deletedCount > 0;
}

export async function aggregateEngagement(contentId: string, userId?: string) {
  const [
    likes,
    comments,
    views,
    shares,
    saves,
    userHasLiked,
    userHasSaved
  ] = await Promise.all([
    InteractionModel.countDocuments({ contentId, actionType: "like" }),
    InteractionModel.countDocuments({
      $or: [
        { contentId, actionType: "comment" },
        { contentId, actionType: "reply" }
      ]
    }),
    InteractionModel.countDocuments({ contentId, actionType: "view" }),
    InteractionModel.countDocuments({ contentId, actionType: "share" }),
    InteractionModel.countDocuments({ contentId, actionType: "save" }),
    userId ? checkUserInteraction(contentId, userId, "like") : false,
    userId ? checkUserInteraction(contentId, userId, "save") : false
  ]);

  return {
    likes,
    comments,
    views,
    shares,
    saves,
    userHasLiked,
    userHasSaved
  };
}
