import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Queue } from "bullmq";
import { ingestQueue } from "../queues/ingestQueue.js";
import { ContentModel } from "../models/Content.js";
import { classifyQueue } from "../queues/classifyQueue.js";
import { enrichQueue } from "../queues/enrichQueue.js";
import { DeploymentReadinessService } from "../services/deploymentReadinessService.js";
import { scheduleAutoIngest, getSchedulerStatus, triggerImmediateIngest, stopAutoIngest } from "../scheduler/ingestScheduler.js";
import { logger } from "../config/logger.js";
import { getReadinessStatus } from "../services/readinessService.js";
import { getAdminDashboardSummary } from "../services/learningAnalyticsService.js";
import { getQueueConnection } from "../queues/queueFactory.js";
import { QUEUE_NAMES } from "../queues/queueNames.js";
import { env } from "../config/env.js";

function ensureAdmin(response: Response) {
  if (response.locals.auth?.role !== "admin") {
    response.status(403).json({
      success: false,
      error: "Admin access required"
    });
    return false;
  }

  return true;
}

export async function triggerIngestionController(request: Request, response: Response) {
  const keyword = String(request.body?.keyword ?? "").trim();
  const limitPerProvider = request.body?.limitPerProvider;

  if (!keyword) {
    response.status(400).json({ message: "keyword is required" });
    return;
  }

  const job = await ingestQueue.add(
    "ingest:keyword",
    {
      keyword,
      limitPerProvider: typeof limitPerProvider === "number" ? limitPerProvider : undefined
    },
    {
      removeOnComplete: 100,
      removeOnFail: 100
    }
  );

  response.status(202).json({
    status: "queued",
    jobId: job.id,
    keyword
  });
}

export async function requeueProcessingController(request: Request, response: Response) {
  const mode = String(request.body?.mode ?? "failed");
  const limit = typeof request.body?.limit === "number" ? request.body.limit : 50;
  const contentIds = Array.isArray(request.body?.contentIds)
    ? (request.body.contentIds.map((id: unknown) => String(id)).filter(Boolean) as string[])
    : [];

  const query =
    contentIds.length > 0
      ? { _id: { $in: contentIds } }
      : mode === "raw"
        ? { processingStatus: "raw" }
        : mode === "classified"
          ? { processingStatus: "classified" }
          : { processingStatus: "failed" };

  const docs = await ContentModel.find(query).limit(limit).select({ _id: 1, processingStatus: 1 }).lean();
  const typedDocs = docs as unknown as Array<{ _id: mongoose.Types.ObjectId; processingStatus: string }>;

  const docsWithStringIds = typedDocs.map((doc: { _id: mongoose.Types.ObjectId; processingStatus: string }) => ({
    ...doc,
    _id: doc._id.toString()
  }));

  const resetIds = docsWithStringIds
    .filter((doc: { _id: string; processingStatus: string }) => doc.processingStatus === "failed")
    .map((doc: { _id: string; processingStatus: string }) => doc._id);

  if (resetIds.length > 0) {
    await ContentModel.updateMany(
      { _id: { $in: resetIds } },
      {
        $set: {
          processingStatus: "raw"
        }
      }
    );
  }

  if (mode === "classified") {
    await Promise.all(
      docsWithStringIds.map((doc: { _id: string; processingStatus: string }) =>
        enrichQueue.add(
          "enrich:content",
          { contentId: doc._id },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 5_000 },
            removeOnComplete: 200,
            removeOnFail: 200
          }
        )
      )
    );
  } else {
    await Promise.all(
      docsWithStringIds.map((doc: { _id: string; processingStatus: string }) =>
        classifyQueue.add(
          "classify:content",
          { contentId: doc._id },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 5_000 },
            removeOnComplete: 200,
            removeOnFail: 200
          }
        )
      )
    );
  }

  response.status(202).json({
    status: "queued",
    matched: docsWithStringIds.length,
    resetFailedToRaw: resetIds.length,
    queued: mode === "classified" ? "enrich" : "classify"
  });
}

export async function deploymentReadinessController(request: Request, response: Response) {
  try {
    const deploymentReadinessService = new DeploymentReadinessService();
    const report = await deploymentReadinessService.evaluateReadiness();

    response.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: "Failed to evaluate deployment readiness"
    });
  }
}

export async function getAdminDashboardController(request: Request, response: Response) {
  try {
    const dashboard = await getAdminDashboardSummary();
    response.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch admin dashboard"
    });
  }
}

export async function autoIngestController(request: Request, response: Response) {
  const cron = String(request.body?.cron ?? "0 */2 * * *");
  const limitPerProvider = typeof request.body?.limitPerProvider === "number" ? request.body.limitPerProvider : 10;
  const enabled = request.body?.enabled !== false;

  try {
    if (enabled) {
      const job = await scheduleAutoIngest(cron, limitPerProvider);
      response.status(200).json({
        success: true,
        message: "Auto-ingest scheduled",
        cron,
        limitPerProvider,
        jobId: job.id
      });
    } else {
      await stopAutoIngest();
      response.status(200).json({
        success: true,
        message: "Auto-ingest stopped"
      });
    }
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to schedule auto-ingest"
    });
  }
}

export async function autoIngestStatusController(request: Request, response: Response) {
  try {
    const status = await getSchedulerStatus();
    response.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get scheduler status"
    });
  }
}

export async function autoIngestTriggerController(request: Request, response: Response) {
  const keywords = Array.isArray(request.body?.keywords) ? request.body.keywords : undefined;
  const limitPerProvider = typeof request.body?.limitPerProvider === "number" ? request.body.limitPerProvider : 10;

  try {
    const job = await triggerImmediateIngest(keywords, limitPerProvider);
    response.status(202).json({
      success: true,
      message: "Immediate auto-ingest triggered",
      jobId: job.id,
      keywords,
      limitPerProvider
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to trigger auto-ingest"
    });
  }
}

export async function massIngestController(request: Request, response: Response) {
  const { getAllThematicKeywords } = await import("../services/keywordRotationService.js");
  const { ingestByKeyword } = await import("../services/contentIngestionService.js");

  const limitPerProvider = typeof request.body?.limitPerProvider === "number" ? request.body.limitPerProvider : 10;
  const allKeywords = getAllThematicKeywords();

  // Return immediately with job info - processing happens async
  response.status(202).json({
    success: true,
    message: "Mass ingestion started",
    totalKeywords: allKeywords.length,
    limitPerProvider,
    estimatedVideos: allKeywords.length * 2 * limitPerProvider, // 2 providers per keyword
    note: "Processing in background. Check logs for progress."
  });

  // Process asynchronously after response
  setImmediate(async () => {
    let totalPersisted = 0;
    let totalYouTube = 0;
    let totalTikTok = 0;

    for (const tk of allKeywords) {
      try {
        const result = await ingestByKeyword({ keyword: tk.keyword, limitPerProvider });
        totalPersisted += result.counts.persisted;
        totalYouTube += result.counts.youtube;
        totalTikTok += result.counts.tiktok;

        logger.info(
          { keyword: tk.keyword, persisted: result.counts.persisted, totalSoFar: totalPersisted },
          "Mass ingest progress"
        );

        // Small delay to avoid overwhelming APIs
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        logger.error({ err, keyword: tk.keyword }, "Mass ingest keyword failed");
      }
    }

    logger.info(
      { totalPersisted, totalYouTube, totalTikTok, keywordsProcessed: allKeywords.length },
      "Mass ingestion complete"
    );
  });
}

export async function contentStatsController(request: Request, response: Response) {
  try {
    const { getContentStats } = await import("../services/contentStatsService.js");
    const stats = await getContentStats();

    response.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error({ error }, "Failed to get content stats");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get content stats"
    });
  }
}

export async function queueStatusController(request: Request, response: Response) {
  try {
    const { getQueueStatus } = await import("../services/queueStatusService.js");
    const status = await getQueueStatus();

    response.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error({ error }, "Failed to get queue status");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get queue status"
    });
  }
}

export async function llmRateLimitStatusController(request: Request, response: Response) {
  try {
    const { llmRateLimiter } = await import("../ai/llmRateLimiter.js");
    const status = llmRateLimiter.getStatus();

    response.status(200).json({
      success: true,
      data: {
        ...status,
        utilizationPercent: Math.round(
          (status.tokensInLastMinute / status.maxTokensPerMinute) * 100
        )
      }
    });
  } catch (error) {
    logger.error({ error }, "Failed to get LLM rate limit status");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get rate limit status"
    });
  }
}

export async function autoAIDiagnosticsController(_request: Request, response: Response) {
  try {
    const readiness = await getReadinessStatus();
    const communityAIQueue = new Queue(QUEUE_NAMES.communityAI, {
      connection: getQueueConnection()
    });

    const counts = await communityAIQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
      "paused"
    );

    await communityAIQueue.close();

    response.status(200).json({
      success: true,
      data: {
        readiness,
        queue: {
          name: QUEUE_NAMES.communityAI,
          waiting: counts.waiting || 0,
          active: counts.active || 0,
          completed: counts.completed || 0,
          failed: counts.failed || 0,
          delayed: counts.delayed || 0,
          paused: counts.paused || 0
        },
        providers: {
          groqConfigured: Boolean(env.GROQ_API_KEY),
          geminiConfigured: Boolean(env.GEMINI_API_KEY),
          openRouterConfigured: Boolean(env.OPENROUTER_API_KEY),
          classificationOrder: ["groq", "openrouter", "gemini"]
        },
        defaults: {
          sampleText:
            "Question sérieuse : quelles sources historiques fiables permettent de distinguer l'héritage spirituel de Kemet des lectures chrétiennes, juives ou islamiques plus tardives, sans tomber dans l'idéologie ?",
          recentCommentCount: 1,
          lastAIResponseMinutesAgo: 999
        }
      }
    });
  } catch (error) {
    logger.error({ error }, "Failed to get auto AI diagnostics");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get auto AI diagnostics"
    });
  }
}

export async function autoAICheckController(request: Request, response: Response) {
  try {
    const text = String(request.body?.text ?? "").trim();
    const recentCommentCountRaw = Number(request.body?.recentCommentCount ?? 1);
    const lastAIResponseMinutesAgoRaw = Number(request.body?.lastAIResponseMinutesAgo ?? 999);

    if (!text) {
      response.status(400).json({
        success: false,
        error: "text is required"
      });
      return;
    }

    const recentCommentCount = Number.isFinite(recentCommentCountRaw)
      ? Math.max(0, Math.floor(recentCommentCountRaw))
      : 1;
    const lastAIResponseMinutesAgo = Number.isFinite(lastAIResponseMinutesAgoRaw)
      ? Math.max(0, lastAIResponseMinutesAgoRaw)
      : 999;

    const { classifyContent, shouldAIIntervene } = await import("../services/contentClassificationService.js");

    const classification = await classifyContent(text);
    const lastAIResponseTime =
      lastAIResponseMinutesAgo <= 0
        ? Date.now()
        : Date.now() - lastAIResponseMinutesAgo * 60 * 1000;
    const intervention = await shouldAIIntervene(text, recentCommentCount, lastAIResponseTime);

    response.status(200).json({
      success: true,
      data: {
        input: {
          text,
          recentCommentCount,
          lastAIResponseMinutesAgo
        },
        classification,
        intervention
      }
    });
  } catch (error) {
    logger.error({ error }, "Failed to evaluate auto AI check");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to evaluate auto AI check"
    });
  }
}

export async function listRecentDebateCommentsController(request: Request, response: Response) {
  try {
    const contentId = String(request.body?.contentId ?? request.query?.contentId ?? "").trim();
    const limitRaw = Number(request.body?.limit ?? request.query?.limit ?? 10);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(20, Math.floor(limitRaw))) : 10;

    if (!contentId) {
      response.status(400).json({
        success: false,
        error: "contentId is required"
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      response.status(400).json({
        success: false,
        error: "contentId is invalid"
      });
      return;
    }

    const { CommentModel } = await import("../models/Comment.js");

    const recentCommentsRaw = await CommentModel.find({ contentId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select({
        _id: 1,
        body: 1,
        aiGenerated: 1,
        hidden: 1,
        moderationStatus: 1,
        replyMode: 1,
        inReplyToCommentId: 1,
        createdAt: 1,
        userId: 1
      })
      .populate("userId", "username")
      .lean();

    const recentComments = recentCommentsRaw as unknown as Array<{
      _id: { toString(): string };
      body: string;
      aiGenerated?: boolean;
      hidden?: boolean;
      moderationStatus?: string;
      replyMode?: "nested" | "flat" | null;
      inReplyToCommentId?: { toString(): string } | null;
      createdAt: Date;
      userId?: { username?: string } | null;
    }>;

    const parentIds = recentComments.map((comment) => comment._id);
    const existingAIRepliesRaw = await CommentModel.find({
      inReplyToCommentId: { $in: parentIds },
      aiGenerated: true
    })
      .select({ inReplyToCommentId: 1 })
      .lean();

    const repliedParentIds = new Set(
      (existingAIRepliesRaw as Array<{ inReplyToCommentId?: { toString(): string } | null }>)
        .map((entry) => entry.inReplyToCommentId?.toString())
        .filter(Boolean)
    );

    response.status(200).json({
      success: true,
      data: {
        contentId,
        comments: recentComments.map((comment) => {
          const id = comment._id.toString();
          const type = comment.replyMode === "flat" ? "flat_reply" : "root_comment";
          const eligible =
            !comment.aiGenerated &&
            !comment.hidden &&
            comment.moderationStatus === "approved" &&
            !repliedParentIds.has(id);

          return {
            id,
            body: comment.body,
            author: comment.aiGenerated ? "AI" : comment.userId?.username || "Utilisateur",
            aiGenerated: Boolean(comment.aiGenerated),
            hidden: Boolean(comment.hidden),
            moderationStatus: comment.moderationStatus || "unknown",
            type,
            createdAt: comment.createdAt,
            hasAIReply: repliedParentIds.has(id),
            eligible
          };
        })
      }
    });
  } catch (error) {
    logger.error({ error }, "Failed to list recent debate comments");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to list recent debate comments"
    });
  }
}

export async function triggerAutoAIReplyController(request: Request, response: Response) {
  try {
    const commentId = String(request.body?.commentId ?? "").trim();

    if (!commentId) {
      response.status(400).json({
        success: false,
        error: "commentId is required"
      });
      return;
    }

    const { CommentModel } = await import("../models/Comment.js");
    const { shouldAIRespondToComment, createAICommentForComment } = await import("../services/aiCommentService.js");

    const sourceCommentDoc = await CommentModel.findById(commentId)
      .select({
        _id: 1,
        body: 1,
        aiGenerated: 1,
        hidden: 1,
        moderationStatus: 1,
        contentId: 1,
        createdAt: 1
      })
      .lean();

    const sourceComment = sourceCommentDoc as
      | {
          _id: { toString(): string };
          body: string;
          aiGenerated: boolean;
          hidden: boolean;
          moderationStatus: string;
          contentId: { toString(): string };
          createdAt: Date;
        }
      | null;

    if (!sourceComment) {
      response.status(404).json({
        success: false,
        error: "Comment not found"
      });
      return;
    }

    const decision = await shouldAIRespondToComment(commentId);
    let aiCommentId: string | null = null;

    if (decision.shouldRespond) {
      aiCommentId = await createAICommentForComment(commentId);
    }

    response.status(200).json({
      success: true,
      data: {
        sourceComment: {
          id: sourceComment._id.toString(),
          body: sourceComment.body,
          aiGenerated: sourceComment.aiGenerated,
          hidden: sourceComment.hidden,
          moderationStatus: sourceComment.moderationStatus,
          contentId: sourceComment.contentId.toString(),
          createdAt: sourceComment.createdAt
        },
        decision,
        triggered: Boolean(aiCommentId),
        aiCommentId
      }
    });
  } catch (error) {
    logger.error({ error }, "Failed to trigger admin auto AI reply");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to trigger auto AI reply"
    });
  }
}

export async function syncAudioSourcesController(_request: Request, response: Response) {
  if (!ensureAdmin(response)) {
    return;
  }

  try {
    const { syncConfiguredAudioSources } = await import("../services/audioCatalogSyncService.js");
    const result = await syncConfiguredAudioSources();

    response.status(200).json({
      success: true,
      data: result,
      message: "Audio sources synchronized"
    });
  } catch (error) {
    logger.error({ error }, "Failed to sync audio sources");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync audio sources"
    });
  }
}

export async function refreshFeedCacheController(request: Request, response: Response) {
  if (!ensureAdmin(response)) {
    return;
  }

  const type = String(request.body?.type ?? "global").trim() as "global" | "user" | "session" | "all";
  const userId = String(request.body?.userId ?? "").trim() || undefined;
  const sessionId = String(request.body?.sessionId ?? "").trim() || undefined;
  const contentId = String(request.body?.contentId ?? "").trim() || undefined;

  try {
    const { triggerFeedCacheRefresh } = await import("../jobs/refreshFeedCacheJob.js");

    await triggerFeedCacheRefresh({
      type,
      userId,
      sessionId,
      contentId,
      reason: "admin_triggered"
    });

    response.status(202).json({
      success: true,
      message: `Feed cache refresh queued: ${type}`,
      data: {
        type,
        userId,
        sessionId,
        contentId,
        reason: "admin_triggered"
      }
    });
  } catch (error) {
    logger.error({ error, type }, "Failed to trigger feed cache refresh");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to trigger feed cache refresh"
    });
  }
}
