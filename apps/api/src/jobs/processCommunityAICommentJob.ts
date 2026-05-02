import type { Job } from "bullmq";
import { createAICommentForComment } from "../services/aiCommentService.js";

export async function processCommunityAICommentJob(job: Job<{ commentId: string }>) {
  const commentId = job.data?.commentId;

  if (!commentId) {
    throw new Error("Missing commentId in community AI job.");
  }

  const aiCommentId = await createAICommentForComment(commentId);

  return {
    commentId,
    aiCommentId
  };
}
