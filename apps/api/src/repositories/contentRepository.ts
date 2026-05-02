import { ContentBucket } from "@maat/shared";
import { Types } from "mongoose";
import { ContentClassificationModel } from "../models/ContentClassification.js";
import { ContentEnrichmentModel } from "../models/ContentEnrichment.js";
import { ContentModel } from "../models/Content.js";
import { ContentScoreModel } from "../models/ContentScore.js";

export type ContentCardSource = {
  id: string;
  source: "youtube" | "tiktok" | "internal";
  sourceUrl: string;
  title: string;
  description: string;
  creatorName: string;
  mediaType: "video" | "audio";
  mediaUrl: string;
  thumbnailUrl?: string;
  bucket: ContentBucket;
  tags: string[];
  summary?: string;
  scores: {
    likes: number;
    comments: number;
    views: number;
    debateScore: number;
    recencyBoost: number;
    finalScore: number;
    scoreVersion: string;
  };
};

export async function createRawContent(input: {
  sourceProvider: "youtube" | "tiktok" | "internal";
  externalId: string;
  canonicalUrl: string;
  mediaType: "video" | "audio";
  mediaUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  creatorName: string;
  transcript?: string;
  tags?: string[];
}) {
  return ContentModel.findOneAndUpdate(
    {
      sourceProvider: input.sourceProvider,
      externalId: input.externalId
    },
    {
      $set: {
        canonicalUrl: input.canonicalUrl,
        mediaType: input.mediaType,
        mediaUrl: input.mediaUrl,
        thumbnailUrl: input.thumbnailUrl ?? null,
        title: input.title,
        description: input.description,
        creatorName: input.creatorName,
        transcript: input.transcript ?? "",
        tags: input.tags ?? [],
        processingStatus: "raw"
      },
      $setOnInsert: {
        sourceProvider: input.sourceProvider,
        externalId: input.externalId
      }
    },
    {
      new: true,
      upsert: true
    }
  );
}

export async function searchContent(query: string) {
  return ContentModel.find({
    $text: {
      $search: query
    }
  })
    .sort({ score: { $meta: "textScore" } })
    .limit(25)
    .lean();
}

export async function listFeedCandidates(limit = 60) {
  const contents = await ContentModel.find({
    processingStatus: {
      $in: ["classified", "enriched", "published"]
    }
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();

  return buildContentCards(contents.map((content) => (content._id as { toString(): string }).toString()));
}

export async function getContentCardById(contentId: string) {
  const [card] = await buildContentCards([contentId]);
  return card ?? null;
}

export async function buildContentCards(contentIds: string[]): Promise<ContentCardSource[]> {
  if (contentIds.length === 0) {
    return [];
  }

  const objectIds = contentIds.map((id) => new Types.ObjectId(id));
  const [contents, classifications, enrichments, scores] = await Promise.all([
    ContentModel.find({ _id: { $in: objectIds } }).lean(),
    ContentClassificationModel.find({ contentId: { $in: objectIds } }).lean(),
    ContentEnrichmentModel.find({ contentId: { $in: objectIds } }).lean(),
    ContentScoreModel.find({ contentId: { $in: objectIds } }).lean()
  ]);

  const classificationByContentId = new Map(
    classifications.map((item) => [item.contentId.toString(), item])
  );
  const enrichmentByContentId = new Map(enrichments.map((item) => [item.contentId.toString(), item]));
  const scoreByContentId = new Map(scores.map((item) => [item.contentId.toString(), item]));
  const contentById = new Map(contents.map((item) => [((item._id as { toString(): string }).toString()), item]));

  return contentIds
    .map((contentId) => {
      const content = contentById.get(contentId);
      const classification = classificationByContentId.get(contentId);
      const enrichment = enrichmentByContentId.get(contentId);
      const score = scoreByContentId.get(contentId);

      if (!content || !classification || !score) {
        return null;
      }

      // Ensure tags are plain strings (handle cases where tags might be objects from MongoDB)
      const tags = (content.tags || []).map((tag: any) => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object') {
          // Handle various object formats
          return tag.name || tag.text || tag.value || tag.toString();
        }
        return String(tag);
      }).filter((tag: string) => tag && tag.length > 0);

      const card: ContentCardSource = {
        id: (content._id as { toString(): string }).toString(),
        source: content.sourceProvider,
        sourceUrl: content.canonicalUrl,
        title: content.title,
        description: content.description,
        creatorName: content.creatorName,
        mediaType: content.mediaType,
        mediaUrl: content.mediaUrl,
        thumbnailUrl: content.thumbnailUrl ?? undefined,
        bucket: classification.bucket,
        tags,
        summary: enrichment?.summary ?? undefined,
        scores: {
          likes: score.likes,
          comments: score.comments,
          views: score.views,
          debateScore: score.debateScore,
          recencyBoost: score.recencyBoost,
          finalScore: score.finalScore,
          scoreVersion: score.scoreVersion
        }
      };

      return card;
    })
    .filter((item): item is ContentCardSource => item !== null);
}
