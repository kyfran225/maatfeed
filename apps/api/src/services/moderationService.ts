import type { CommentAnalysis } from "./commentAnalysisService.js";

export type ModerationStatus = "approved" | "blocked" | "hidden";

export interface ModerationDecision {
  status: ModerationStatus;
  reason: string;
}

export class CommentModerationError extends Error {
  readonly statusCode: number;
  readonly moderation: ModerationDecision;

  constructor(moderation: ModerationDecision, statusCode = 422) {
    super(moderation.reason);
    this.name = "CommentModerationError";
    this.statusCode = statusCode;
    this.moderation = moderation;
  }
}

export function moderateComment(comment: string, analysis: CommentAnalysis): ModerationDecision {
  void comment;

  if (analysis.toxicityScore > 0.8) {
    return {
      status: "blocked",
      reason: "Comment blocked due to high toxicity score."
    };
  }

  if (analysis.spamScore > 0.7) {
    return {
      status: "hidden",
      reason: "Comment hidden pending review due to spam signals."
    };
  }

  return {
    status: "approved",
    reason: analysis.debateScore > 0.65
      ? "Comment approved. Strong debate detected without abusive patterns."
      : "Comment approved."
  };
}
