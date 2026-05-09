import mongoose from "mongoose";
import { ContentModel } from "../models/Content.js";
import { ContentClassificationModel } from "../models/ContentClassification.js";
import { ContentEnrichmentModel } from "../models/ContentEnrichment.js";
import { ContentScoreModel } from "../models/ContentScore.js";
import { classifyContent } from "../ai/classificationEngine.js";
import { enrichContent } from "../ai/enrichmentEngine.js";
import { logger } from "../config/logger.js";
import { computeContentScore } from "./scoringService.js";
import { notifyContentPublished } from "./notificationService.js";

export async function classifyContentStep(input: { contentId: string }) {
  const contentId = new mongoose.Types.ObjectId(input.contentId);

  const content = await ContentModel.findById(contentId);
  if (!content) {
    throw new Error("Content not found.");
  }

  if (content.processingStatus !== "raw") {
    return { status: "skipped", reason: "not_raw", processingStatus: content.processingStatus };
  }

  const classification = await classifyContent({
    title: content.title,
    description: content.description,
    transcript: content.transcript,
    tags: content.tags
  });

  logger.info(
    {
      contentId: content._id.toString(),
      providerUsed: classification.meta.providerUsed,
      usedFallback: classification.meta.usedFallback,
      providerErrors: classification.meta.providerErrors,
      bucket: classification.bucket,
      confidence: classification.confidence
    },
    "Content classified"
  );

  await ContentClassificationModel.findOneAndUpdate(
    { contentId: content._id },
    {
      $set: {
        bucket: classification.bucket,
        debateScore: classification.debateScore,
        emotionScore: classification.emotionScore,
        educationScore: classification.educationScore,
        confidence: classification.confidence
      },
      $setOnInsert: {
        contentId: content._id
      }
    },
    { upsert: true, new: true }
  );

  content.processingStatus = "classified";
  await content.save();

  return {
    status: "ok",
    contentId: content._id.toString(),
    bucket: classification.bucket,
    processingStatus: content.processingStatus,
    providerUsed: classification.meta.providerUsed,
    usedFallback: classification.meta.usedFallback
  };
}

export async function enrichContentStep(input: { contentId: string }) {
  const contentId = new mongoose.Types.ObjectId(input.contentId);

  const content = await ContentModel.findById(contentId);
  if (!content) {
    throw new Error("Content not found.");
  }

  if (content.processingStatus !== "classified") {
    return { status: "skipped", reason: "not_classified", processingStatus: content.processingStatus };
  }

  const enrichment = await enrichContent({
    title: content.title,
    description: content.description,
    tags: content.tags
  });

  await ContentEnrichmentModel.findOneAndUpdate(
    { contentId: content._id },
    {
      $set: {
        summary: enrichment.summary,
        keyIdeas: enrichment.keyIdeas,
        debatePrompt: enrichment.debatePrompt,
        thematicTags: enrichment.thematicTags
      },
      $setOnInsert: {
        contentId: content._id
      }
    },
    { upsert: true, new: true }
  );

  // Compute and store the content score
  await computeContentScore({ contentId: content._id.toString() });

  content.processingStatus = "published";
  content.publishedAt = content.publishedAt ?? new Date();
  await content.save();
  await notifyContentPublished(content._id.toString());

  return {
    status: "ok",
    contentId: content._id.toString(),
    processingStatus: content.processingStatus
  };
}

export async function processContent(input: { contentId: string }) {
  const classification = await classifyContentStep({ contentId: input.contentId });
  if (classification.status === "ok") {
    return enrichContentStep({ contentId: input.contentId });
  }
  return classification;
}

export async function failContent(input: { contentId: string }) {
  const contentId = new mongoose.Types.ObjectId(input.contentId);
  await ContentModel.findByIdAndUpdate(contentId, {
    $set: {
      processingStatus: "failed"
    }
  });
}
