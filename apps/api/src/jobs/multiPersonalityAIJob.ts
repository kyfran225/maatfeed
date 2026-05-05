import { Worker, Queue } from "bullmq";
import { logger } from "../config/logger.js";
import { createBullMqConnection, createRedisClient } from "../db/redis.js";
import { createAICommentForComment } from "../services/aiCommentService.js";
import { CommentModel } from "../models/Comment.js";
import { AIMemoryService } from "../services/aiMemoryService.js";

export interface MultiPersonalityAIJobData {
  contentId: string;
  maxComments?: number;
  forceResponse?: boolean;
  personalityId?: string;
}

export const MULTI_PERSONALITY_AI_QUEUE = "multi-personality-ai";

export async function createMultiPersonalityAIJob(data: MultiPersonalityAIJobData, options?: { delay?: number }) {
  const redisClient = createRedisClient();
  const queue = new Queue<MultiPersonalityAIJobData>(MULTI_PERSONALITY_AI_QUEUE, {
    connection: redisClient,
  });

  return queue.add("multi-personality-ai", data, options);
}

export async function runMultiPersonalityAIWorker() {
  const connection = createBullMqConnection();
  
  const worker = new Worker<MultiPersonalityAIJobData>(
    MULTI_PERSONALITY_AI_QUEUE,
    async (job) => {
      const { contentId, maxComments = 3, forceResponse = false, personalityId } = job.data;
      
      logger.info({ 
        contentId, 
        maxComments, 
        forceResponse, 
        personalityId,
        jobId: job.id 
      }, "Processing multi-personality AI job");

      try {
        // Get recent comments without AI responses
        const recentComments = await CommentModel.find({
          contentId,
          aiGenerated: { $ne: true },
          isDeleted: false,
          hidden: false,
          moderationStatus: "approved"
        })
        .sort({ createdAt: -1 })
        .limit(maxComments)
        .lean()
        .exec();

        if (recentComments.length === 0) {
          logger.info({ contentId }, "No recent comments found for AI processing");
          return { processed: 0, responses: 0 };
        }

        let processedCount = 0;
        let responseCount = 0;

        for (const comment of recentComments) {
          try {
            processedCount++;

            // Check if AI already responded
            const existingAIResponse = await CommentModel.findOne({
              inReplyToCommentId: (comment._id as any),
              aiGenerated: true
            });

            if (existingAIResponse) {
              logger.debug({ 
                commentId: comment._id,
                existingResponseId: existingAIResponse._id 
              }, "AI already responded to comment");
              continue;
            }

            // Get discussion context
            const responseContext = await AIMemoryService.getResponseContext(
              contentId,
              "maat_sage" // Default personality
            );

            // Generate AI response
            const aiCommentId = await createAICommentForComment(
              (comment._id as any).toString(),
              {
                recentCommentCount: recentComments.length,
                discussionActive: true,
                lastAIResponses: responseContext.previousAIResponses.map((_, index) => ({
                  personalityId: "maat_sage" as any,
                  timestamp: Date.now() - (index * 60000) // Mock timestamps
                })),
                discussionContext: responseContext.discussionContext,
                previousAIResponses: responseContext.previousAIResponses
              }
            );

            if (aiCommentId) {
              responseCount++;
              
              // Store in memory
              const aiComment = await CommentModel.findById(aiCommentId);
              if (aiComment) {
                await AIMemoryService.storeAIResponse(
                  aiCommentId,
                  aiComment.aiPersona as any,
                  aiComment.body,
                  responseContext.recentTopics,
                  { positive: 0.5, negative: 0.3, neutral: 0.2 },
                  (comment._id as any).toString(),
                  contentId
                );
              }

              logger.info({ 
                commentId: comment._id,
                aiCommentId,
                personality: aiComment?.aiPersona 
              }, "AI response generated successfully");
            } else {
              logger.debug({ commentId: comment._id }, "AI response not generated (filtered out)");
            }

            // Add small delay between responses to seem more natural
            if (responseCount < maxComments) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }

          } catch (error) {
            logger.warn({ 
              err: error, 
              commentId: comment._id 
            }, "Failed to generate AI response for comment");
          }
        }

        logger.info({ 
          contentId, 
          processed: processedCount, 
          responses: responseCount 
        }, "Multi-personality AI job completed");

        return { 
          processed: processedCount, 
          responses: responseCount,
          contentId 
        };

      } catch (error) {
        logger.error({ 
          err: error, 
          contentId, 
          jobId: job.id 
        }, "Multi-personality AI job failed");
        throw error;
      }
    },
    {
      connection,
      concurrency: 2, // Limit concurrent AI jobs
      limiter: {
        max: 10,
        duration: 60000 // 10 jobs per minute
      }
    }
  );

  worker.on("completed", (job) => {
    logger.info({ 
      jobId: job.id, 
      result: job.returnvalue 
    }, "Multi-personality AI job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ 
      jobId: job?.id, 
      err 
    }, "Multi-personality AI job failed");
  });

  worker.on("error", (err) => {
    logger.error({ err }, "Multi-personality AI worker error");
  });

  return worker;
}
