#!/usr/bin/env tsx

import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { classifyContent } from "../ai/classificationEngine.js";
import { logger } from "../config/logger.js";
import { connectMongo } from "../db/mongo.js";
import { ContentModel } from "../models/Content.js";

type AuditRow = {
  contentId: string;
  title: string;
  providerUsed: string;
  usedFallback: boolean;
  bucket: string;
  confidence: number;
  educationScore: number;
  debateScore: number;
  emotionScore: number;
  spread: number;
  reasons: string[];
};

function parseLimit(argv: string[]): number {
  const raw = argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? argv[2];
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 30;
  }
  return Math.min(Math.round(parsed), 100);
}

function topTwoSpread(scores: number[]): number {
  const sorted = [...scores].sort((a, b) => b - a);
  return (sorted[0] ?? 0) - (sorted[1] ?? 0);
}

function detectReviewReasons(input: {
  usedFallback: boolean;
  confidence: number;
  spread: number;
  textLength: number;
}): string[] {
  const reasons: string[] = [];

  if (input.usedFallback) {
    reasons.push("fallback");
  }

  if (input.confidence < 0.6) {
    reasons.push("low_confidence");
  }

  if (input.spread < 12) {
    reasons.push("close_scores");
  }

  if (input.textLength < 80) {
    reasons.push("short_text");
  }

  return reasons;
}

async function auditClassificationPipeline(limit: number) {
  await connectMongo();

  const contents = await ContentModel.find(
    {
      $or: [
        { title: { $exists: true, $ne: "" } },
        { description: { $exists: true, $ne: "" } },
        { transcript: { $exists: true, $ne: "" } }
      ]
    },
    {
      title: 1,
      description: 1,
      transcript: 1,
      tags: 1,
      processingStatus: 1,
      sourceProvider: 1,
      createdAt: 1
    }
  )
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  if (contents.length === 0) {
    logger.warn("No content found for classification audit.");
    return {
      success: false,
      total: 0
    };
  }

  const providerCounts = new Map<string, number>();
  const bucketCounts = new Map<string, number>();
  const flaggedRows: AuditRow[] = [];
  let fallbackCount = 0;

  for (const content of contents) {
    const classification = await classifyContent({
      title: content.title ?? "",
      description: content.description ?? "",
      transcript: content.transcript ?? "",
      tags: content.tags ?? []
    });

    providerCounts.set(
      classification.meta.providerUsed,
      (providerCounts.get(classification.meta.providerUsed) ?? 0) + 1
    );
    bucketCounts.set(classification.bucket, (bucketCounts.get(classification.bucket) ?? 0) + 1);

    if (classification.meta.usedFallback) {
      fallbackCount += 1;
    }

    const textLength = `${content.title ?? ""} ${content.description ?? ""} ${content.transcript ?? ""}`.trim().length;
    const spread = topTwoSpread([
      classification.educationScore,
      classification.debateScore,
      classification.emotionScore
    ]);
    const reasons = detectReviewReasons({
      usedFallback: classification.meta.usedFallback,
      confidence: classification.confidence,
      spread,
      textLength
    });

    if (reasons.length > 0) {
      flaggedRows.push({
        contentId: String(content._id),
        title: (content.title ?? "").slice(0, 120),
        providerUsed: classification.meta.providerUsed,
        usedFallback: classification.meta.usedFallback,
        bucket: classification.bucket,
        confidence: classification.confidence,
        educationScore: classification.educationScore,
        debateScore: classification.debateScore,
        emotionScore: classification.emotionScore,
        spread,
        reasons
      });
    }
  }

  const summary = {
    total: contents.length,
    fallbackCount,
    fallbackRate: Number((fallbackCount / contents.length).toFixed(4)),
    providerCounts: Object.fromEntries(providerCounts),
    bucketCounts: Object.fromEntries(bucketCounts),
    flaggedCount: flaggedRows.length,
    flaggedSamples: flaggedRows.slice(0, 10)
  };

  logger.info(summary, "Classification audit summary");

  return {
    success: true,
    ...summary
  };
}

const isDirectExecution = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isDirectExecution) {
  const limit = parseLimit(process.argv);

  auditClassificationPipeline(limit)
    .then(async (result) => {
      console.log(JSON.stringify(result, null, 2));
      await mongoose.disconnect().catch(() => undefined);
      process.exit(result.success ? 0 : 1);
    })
    .catch(async (error) => {
      console.error(error);
      await mongoose.disconnect().catch(() => undefined);
      process.exit(1);
    });
}

export { auditClassificationPipeline };
