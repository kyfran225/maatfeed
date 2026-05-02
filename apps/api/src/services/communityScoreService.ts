import { CommentModel } from "../models/Comment.js";
import { CommunityPostModel } from "../models/CommunityPost.js";
import { ProfileModel } from "../models/Profile.js";

export interface CommunityScoreInput {
  upvotes: number;
  comments: number;
  debateScore: number;
  toxicityScore: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateCommunityScore(input: CommunityScoreInput): number {
  return (
    (input.upvotes * 2) +
    (input.comments * 3) +
    (input.debateScore * 5) -
    (input.toxicityScore * 10)
  );
}

function deriveViralityStatus(score: number): "cold" | "warm" | "hot" | "viral" | "trending" {
  if (score >= 80) return "trending";
  if (score >= 60) return "viral";
  if (score >= 35) return "hot";
  if (score >= 15) return "warm";
  return "cold";
}

function deriveBadges(score: number, commentCount: number) {
  const badges: Array<{ type: "trending" | "active" | "quality" | "viral" | "expert"; earnedAt: Date; level: number }> = [];

  if (score >= 80) {
    badges.push({ type: "trending", earnedAt: new Date(), level: 1 });
  }
  if (commentCount >= 8) {
    badges.push({ type: "active", earnedAt: new Date(), level: 1 });
  }
  if (score >= 60 && commentCount >= 5) {
    badges.push({ type: "viral", earnedAt: new Date(), level: 1 });
  }

  return badges;
}

export async function refreshCommunityDiscussionScore(contentId: string): Promise<number | null> {
  const post = await CommunityPostModel.findById(contentId) || await CommunityPostModel.findOne({
    feedContentId: contentId,
    type: "discussion",
    isHidden: false
  });
  if (!post) {
    return null;
  }

  const comments = await CommentModel.find({
    contentId,
    isDeleted: false,
    hidden: { $ne: true },
    moderationStatus: "approved"
  }).lean();

  const uniqueParticipants = new Set([
    post.author.toString(),
    ...comments.map((comment) => comment.userId?.toString()).filter(Boolean)
  ]);

  const averageDebate = comments.length > 0
    ? comments.reduce((sum, comment) => sum + (comment.analysis?.debateScore ?? 0), 0) / comments.length
    : 0;
  const averageToxicity = comments.length > 0
    ? comments.reduce((sum, comment) => sum + (comment.analysis?.toxicityScore ?? 0), 0) / comments.length
    : 0;
  const rawScore = calculateCommunityScore({
    upvotes: post.upvotes || 0,
    comments: comments.length,
    debateScore: averageDebate,
    toxicityScore: averageToxicity
  });
  const viralityScore = clamp(Math.round(rawScore), 0, 100);

  await CommunityPostModel.findByIdAndUpdate(contentId, {
    $set: {
      comments: comments.map((comment) => comment._id),
      participantCount: uniqueParticipants.size,
      viralityScore,
      viralityStatus: deriveViralityStatus(viralityScore),
      badges: deriveBadges(viralityScore, comments.length),
      reports: comments.reduce((sum, comment) => sum + (comment.reportCount || 0), 0),
      quality: clamp(1 - averageToxicity + (averageDebate * 0.35), 0, 1),
      controversy: clamp(averageDebate, 0, 1),
      lastActivityAt: new Date()
    }
  });

  return viralityScore;
}

export async function updateCommunityProfileSignals(
  userId: string,
  input: {
    debateIncrement?: number;
    educationIncrement?: number;
    contributionsIncrement?: number;
    reportsIncrement?: number;
  }
): Promise<void> {
  await ProfileModel.findOneAndUpdate(
    { userId },
    {
      $inc: {
        "communityProfile.debate": input.debateIncrement ?? 0,
        "communityProfile.education": input.educationIncrement ?? 0,
        "communityProfile.contributions": input.contributionsIncrement ?? 0,
        "communityProfile.reports": input.reportsIncrement ?? 0
      },
      $set: {
        "communityProfile.lastInteractionAt": new Date()
      }
    },
    {
      upsert: true,
      new: true
    }
  );
}
