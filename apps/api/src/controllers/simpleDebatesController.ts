import { Request, Response } from "express";
import { CommunityPostModel } from "../models/CommunityPost.js";
import type { CommunityPostDocument } from "../models/CommunityPost.js";
import { ContentModel } from "../models/Content.js";
import { ContentEnrichmentModel } from "../models/ContentEnrichment.js";
import { ContentClassificationModel } from "../models/ContentClassification.js";

type LeanDebatePost = Pick<
  CommunityPostDocument,
  | "_id"
  | "type"
  | "title"
  | "content"
  | "viralityScore"
  | "participantCount"
  | "tags"
  | "createdAt"
  | "lastActivityAt"
  | "isHidden"
  | "feedContentId"
  | "mediaUrl"
  | "mediaType"
>;

interface FeedContentSeed {
  _id: { toString(): string };
  title: string;
  description?: string | null;
  tags?: string[];
  mediaUrl?: string | null;
  mediaType?: "video" | "audio" | null;
  thumbnailUrl?: string | null;
}

interface FeedEnrichmentSeed {
  summary?: string;
  debatePrompt?: string;
  thematicTags?: string[];
}

interface FeedClassificationSeed {
  debateScore?: number;
}

function formatDebatePost(debate: LeanDebatePost) {
  const routeContentId = debate.feedContentId?.toString() || debate._id.toString();

  return {
    id: debate._id.toString(),
    contentId: routeContentId,
    title: debate.title,
    description: debate.content,
    isActive: !debate.isHidden,
    debateScore: debate.viralityScore || 0,
    participantCount: debate.participantCount || 0,
    topComments: [],
    tags: debate.tags || [],
    createdAt: debate.createdAt,
    updatedAt: debate.lastActivityAt || debate.createdAt,
    lastActivity: debate.lastActivityAt || debate.createdAt
  };
}

async function findDebateByRouteContentId(contentId: string): Promise<LeanDebatePost | null> {
  const directDebate = await CommunityPostModel.findOne({
    _id: contentId,
    type: "discussion",
    isHidden: false
  }).lean() as LeanDebatePost | null;

  if (directDebate) {
    return directDebate;
  }

  const linkedDebate = await CommunityPostModel.findOne({
    feedContentId: contentId,
    type: "discussion",
    isHidden: false
  }).lean() as LeanDebatePost | null;

  return linkedDebate;
}

export async function getTopDebatesController(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const debates = await CommunityPostModel.find({
      type: "discussion",
      isHidden: false
    })
      .sort({ viralityScore: -1, participantCount: -1 })
      .limit(limit)
      .select("_id type title content viralityScore participantCount tags createdAt lastActivityAt isHidden feedContentId mediaUrl mediaType")
      .lean() as unknown as LeanDebatePost[];

    const formattedDebates = debates.map(formatDebatePost);

    res.json({
      success: true,
      data: formattedDebates,
      meta: {
        count: formattedDebates.length,
        limit,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("[SIMPLE] Erreur:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch top debates"
    });
  }
}

export async function getDebateThreadController(req: Request, res: Response) {
  try {
    const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;
    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }
    const debate = await findDebateByRouteContentId(contentId);

    if (!debate) {
      return res.status(404).json({
        success: false,
        error: "Debate thread not found"
      });
    }

    res.json({
      success: true,
      data: formatDebatePost(debate),
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("[SIMPLE] Erreur getDebateThread:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch debate thread"
    });
  }
}

export async function createDebateThreadController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const rawContentId = typeof req.body?.contentId === "string" ? req.body.contentId.trim() : "";
    const rawTitle = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const rawDescription = typeof req.body?.description === "string" ? req.body.description.trim() : "";
    const rawTags = Array.isArray(req.body?.tags)
      ? req.body.tags.map((tag: unknown) => String(tag).trim().toLowerCase()).filter(Boolean)
      : [];

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (rawContentId) {
      const existingLinkedDebate = await findDebateByRouteContentId(rawContentId);
      if (existingLinkedDebate) {
        return res.status(200).json({
          success: true,
          data: formatDebatePost(existingLinkedDebate),
          meta: {
            timestamp: new Date().toISOString(),
            created: false
          }
        });
      }

      const [content, enrichment, classification] = await Promise.all([
        ContentModel.findById(rawContentId)
          .select("_id title description tags mediaUrl mediaType thumbnailUrl creatorName")
          .lean() as Promise<FeedContentSeed | null>,
        ContentEnrichmentModel.findOne({ contentId: rawContentId })
          .select("summary debatePrompt thematicTags")
          .lean() as Promise<FeedEnrichmentSeed | null>,
        ContentClassificationModel.findOne({ contentId: rawContentId })
          .select("debateScore")
          .lean() as Promise<FeedClassificationSeed | null>
      ]);

      if (content) {
        const defaultDescription =
          rawDescription ||
          (typeof enrichment?.debatePrompt === "string" && enrichment.debatePrompt.trim()) ||
          (typeof enrichment?.summary === "string" && enrichment.summary.trim()) ||
          (typeof content.description === "string" && content.description.trim()) ||
          `Discussion ouverte autour de "${content.title}".`;

        const mergedTags = Array.from(
          new Set([
            ...rawTags,
            ...((Array.isArray(enrichment?.thematicTags) ? enrichment.thematicTags : []) as string[]),
            ...((Array.isArray(content.tags) ? content.tags : []) as string[])
          ].filter(Boolean).map((tag) => tag.toLowerCase()))
        ).slice(0, 8);

        const newDebate = new CommunityPostModel({
          type: "discussion",
          title: rawTitle || content.title,
          content: defaultDescription,
          author: userId,
          tags: mergedTags,
          upvotes: 0,
          participantCount: 1,
          viralityScore: 0,
          viralityStatus: "cold",
          badges: [],
          sentiment: "neutral",
          controversy: Math.max(0, Math.min(1, (classification?.debateScore || 0) / 100)),
          quality: 0.8,
          engagementMetrics: {
            views: 0,
            shares: 0,
            bookmarks: 0,
            averageReadTime: 0,
            bounceRate: 1.0,
            conversionRate: 0
          },
          transformedToFeed: false,
          transformationScore: 0,
          reports: 0,
          isHidden: false,
          lastActivityAt: new Date(),
          bumpedAt: new Date(),
          feedContentId: content._id,
          mediaUrl: content.thumbnailUrl || content.mediaUrl || null,
          mediaType: content.thumbnailUrl ? "image" : (content.mediaType === "audio" ? "audio" : "video")
        });

        await newDebate.save();

        return res.status(201).json({
          success: true,
          data: formatDebatePost(newDebate.toObject() as LeanDebatePost),
          meta: {
            timestamp: new Date().toISOString(),
            created: true
          }
        });
      }
    }

    if (!rawTitle || !rawDescription) {
      return res.status(400).json({
        success: false,
        error: "Title and description are required when no feed content is linked"
      });
    }

    const newDebate = new CommunityPostModel({
      type: "discussion",
      title: rawTitle,
      content: rawDescription,
      author: userId,
      tags: rawTags,
      upvotes: 0,
      participantCount: 1,
      viralityScore: 0,
      viralityStatus: "cold",
      badges: [],
      sentiment: "neutral",
      controversy: 0.5,
      quality: 0.8,
      engagementMetrics: {
        views: 0,
        shares: 0,
        bookmarks: 0,
        averageReadTime: 0,
        bounceRate: 1.0,
        conversionRate: 0
      },
      transformedToFeed: false,
      transformationScore: 0,
      reports: 0,
      isHidden: false,
      lastActivityAt: new Date(),
      bumpedAt: new Date()
    });

    await newDebate.save();

    res.status(201).json({
      success: true,
      data: formatDebatePost(newDebate.toObject() as LeanDebatePost),
      meta: {
        timestamp: new Date().toISOString(),
        created: true
      }
    });
  } catch (error) {
    console.error("[SIMPLE] Erreur création:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create debate thread"
    });
  }
}
