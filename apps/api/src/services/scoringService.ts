import mongoose from "mongoose";
import { ContentModel } from "../models/Content.js";
import { ContentClassificationModel } from "../models/ContentClassification.js";
import { ContentScoreModel } from "../models/ContentScore.js";
import { computeGlobalScore } from "@maat/shared";

export async function computeContentScore(input: { contentId: string }) {
  const contentId = new mongoose.Types.ObjectId(input.contentId);

  const content = await ContentModel.findById(contentId);
  if (!content) {
    throw new Error("Contenu non trouvé.");
  }

  const classification = await ContentClassificationModel.findOne({ contentId });
  if (!classification) {
    throw new Error("Classification non trouvée pour le contenu.");
  }

  // Base scores from classification
  const baseScores = {
    debateScore: classification.debateScore,
    emotionScore: classification.emotionScore,
    educationScore: classification.educationScore,
    confidence: classification.confidence
  };

  // Compute final score using shared utility
  const finalScore = computeGlobalScore({
    likes: 0, // Will be updated when interactions are recorded
    comments: 0, // Will be updated when interactions are recorded
    views: 0, // Will be updated when interactions are recorded
    debateScore: baseScores.debateScore,
    recencyBoost: getRecencyBoost(content.publishedAt || content.createdAt)
  });

  // Update or create score record
  await ContentScoreModel.findOneAndUpdate(
    { contentId },
    {
      $set: {
        likes: 0,
        comments: 0,
        views: 0,
        shares: 0,
        completionRate: 0,
        recencyBoost: getRecencyBoost(content.publishedAt || content.createdAt),
        debateScoreContribution: baseScores.debateScore,
        finalScore: finalScore,
        scoreVersion: "v1"
      }
    },
    { upsert: true, new: true }
  );

  return {
    status: "ok",
    contentId: content._id.toString(),
    finalScore: finalScore,
    bucket: classification.bucket
  };
}

export async function refreshScoresForContent(input: { contentId: string }) {
  return computeContentScore({ contentId: input.contentId });
}

export async function refreshAllScores() {
  const contents = await ContentModel.find({ 
    processingStatus: "published" 
  }).limit(100); // Process in batches

  const results = [];
  for (const content of contents) {
    try {
      const result = await computeContentScore({ contentId: content._id.toString() });
      results.push(result);
    } catch (error) {
      console.error(`Failed to refresh score for content ${content._id}:`, error);
    }
  }

  return {
    processed: results.length,
    results
  };
}

function getRecencyBoost(publishedAt: Date): number {
  const now = new Date();
  const hoursSincePublish = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
  
  if (hoursSincePublish < 1) return 1.5; // Very recent
  if (hoursSincePublish < 24) return 1.2; // Same day
  if (hoursSincePublish < 168) return 1.1; // Within week
  return 1.0; // No boost
}
