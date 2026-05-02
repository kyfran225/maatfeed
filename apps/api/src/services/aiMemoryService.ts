import { CommentModel } from "../models/Comment.js";
import { logger } from "../config/logger.js";
import { getCache, setCache } from "./cacheService.js";
import type { AIPersonalityId } from "./personalityRouterService.js";

export interface AIMemoryEntry {
  commentId: string;
  personalityId: AIPersonalityId;
  content: string;
  topics: string[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  timestamp: number;
  responseTo?: string;
  threadId?: string;
}

export interface DiscussionContext {
  threadId: string;
  contentId: string;
  participants: string[];
  recentComments: Array<{
    id: string;
    userId: string | null;
    aiGenerated: boolean;
    personalityId?: AIPersonalityId;
    content: string;
    timestamp: number;
  }>;
  aiResponses: Array<{
    personalityId: AIPersonalityId;
    content: string;
    timestamp: number;
    responseTo: string;
  }>;
  topics: string[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  lastActivity: number;
}

const AI_MEMORY_CACHE_TTL_SECONDS = 60 * 60 * 2; // 2 hours
const DISCUSSION_CONTEXT_CACHE_TTL_SECONDS = 60 * 30; // 30 minutes

export class AIMemoryService {
  
  /**
   * Store an AI response in memory
   */
  static async storeAIResponse(
    commentId: string,
    personalityId: AIPersonalityId,
    content: string,
    topics: string[],
    sentiment: DiscussionContext['sentiment'],
    responseTo?: string,
    threadId?: string
  ): Promise<void> {
    try {
      const memoryEntry: AIMemoryEntry = {
        commentId,
        personalityId,
        content,
        topics,
        sentiment,
        timestamp: Date.now(),
        responseTo,
        threadId
      };

      // Store in cache with personality-specific key
      const cacheKey = `ai:memory:${personalityId}:${commentId}`;
      await setCache(cacheKey, memoryEntry, AI_MEMORY_CACHE_TTL_SECONDS);

      // Also store in thread-specific memory
      if (threadId) {
        const threadKey = `ai:thread:${threadId}:${personalityId}`;
        const threadMemory = await getCache<AIMemoryEntry[]>(threadKey) || [];
        threadMemory.push(memoryEntry);
        
        // Keep only last 10 entries per thread per personality
        if (threadMemory.length > 10) {
          threadMemory.splice(0, threadMemory.length - 10);
        }
        
        await setCache(threadKey, threadMemory, AI_MEMORY_CACHE_TTL_SECONDS);
      }

      logger.debug({ 
        commentId, 
        personalityId, 
        topics: topics.length, 
        threadId 
      }, "AI response stored in memory");
    } catch (error) {
      logger.warn({ err: error, commentId, personalityId }, "Failed to store AI response in memory");
    }
  }

  /**
   * Get recent AI responses for a specific personality
   */
  static async getPersonalityMemory(
    personalityId: AIPersonalityId,
    limit: number = 5
  ): Promise<AIMemoryEntry[]> {
    try {
      const cachePattern = `ai:memory:${personalityId}:*`;
      // Note: In a real implementation, you'd use Redis SCAN or similar
      // For now, we'll get thread-specific memories
      
      // Get all thread memories for this personality
      const threadMemories: AIMemoryEntry[] = [];
      const threadKeys = await this.getPersonalityThreadKeys(personalityId);
      
      for (const threadKey of threadKeys) {
        const memories = await getCache<AIMemoryEntry[]>(threadKey) || [];
        threadMemories.push(...memories);
      }

      // Sort by timestamp and limit
      return threadMemories
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      logger.warn({ err: error, personalityId }, "Failed to get personality memory");
      return [];
    }
  }

  /**
   * Get discussion context for a content item
   */
  static async getDiscussionContext(
    contentId: string,
    limit: number = 10
  ): Promise<DiscussionContext | null> {
    try {
      const cacheKey = `discussion:context:${contentId}`;
      const cached = await getCache<DiscussionContext>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Get recent comments for this content
      const recentComments = await CommentModel.find({
        contentId,
        isDeleted: false,
        hidden: false,
        moderationStatus: "approved"
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

      if (recentComments.length === 0) {
        return null;
      }

      // Extract AI responses
      const aiResponses = recentComments
        .filter(comment => comment.aiGenerated && comment.aiPersona)
        .map(comment => ({
          personalityId: comment.aiPersona as AIPersonalityId,
          content: comment.body,
          timestamp: comment.createdAt.getTime(),
          responseTo: comment.inReplyToCommentId?.toString() || ""
        }));

      // Extract topics and sentiment
      const allTopics = new Set<string>();
      let totalSentiment = { positive: 0, negative: 0, neutral: 0 };
      let sentimentCount = 0;

      recentComments.forEach(comment => {
        if (comment.analysis) {
          // Extract topics from analysis (if available)
          Object.entries(comment.analysis).forEach(([key, value]: [string, any]) => {
            if (typeof value === 'number' && value > 0.5 && key !== 'qualityScore') {
              allTopics.add(key);
            }
          });
          
          // Aggregate sentiment (simplified)
          if (comment.analysis.qualityScore > 0.6) {
            totalSentiment.positive++;
          } else if (comment.analysis.toxicityScore > 0.3) {
            totalSentiment.negative++;
          } else {
            totalSentiment.neutral++;
          }
          sentimentCount++;
        }
      });

      const avgSentiment = sentimentCount > 0 ? {
        positive: totalSentiment.positive / sentimentCount,
        negative: totalSentiment.negative / sentimentCount,
        neutral: totalSentiment.neutral / sentimentCount
      } : { positive: 0.5, negative: 0.3, neutral: 0.2 };

      const context: DiscussionContext = {
        threadId: contentId, // Using contentId as threadId for now
        contentId,
        participants: [...new Set(recentComments.map(c => c.userId?.toString()).filter(Boolean))],
        recentComments: recentComments.map(comment => ({
          id: (comment._id as any).toString(),
          userId: (comment.userId as any)?.toString() || null,
          aiGenerated: comment.aiGenerated || false,
          personalityId: comment.aiPersona as AIPersonalityId | undefined,
          content: comment.body,
          timestamp: (comment.createdAt as any).getTime()
        })),
        aiResponses,
        topics: Array.from(allTopics),
        sentiment: avgSentiment,
        lastActivity: Math.max(...recentComments.map(c => c.createdAt.getTime()))
      };

      await setCache(cacheKey, context, DISCUSSION_CONTEXT_CACHE_TTL_SECONDS);
      return context;
    } catch (error) {
      logger.warn({ err: error, contentId }, "Failed to get discussion context");
      return null;
    }
  }

  /**
   * Check if AI has recently responded to similar content
   */
  static async hasRecentlyRespondedToSimilar(
    personalityId: AIPersonalityId,
    content: string,
    topics: string[],
    timeWindowMs: number = 30 * 60 * 1000 // 30 minutes
  ): Promise<boolean> {
    try {
      const recentMemories = await this.getPersonalityMemory(personalityId, 10);
      const now = Date.now();
      
      return recentMemories.some(memory => {
        // Check time window
        if (now - memory.timestamp > timeWindowMs) {
          return false;
        }
        
        // Check topic overlap
        const topicOverlap = memory.topics.some(topic => topics.includes(topic));
        if (topicOverlap) {
          return true;
        }
        
        // Simple content similarity (could be enhanced with embeddings)
        const contentSimilarity = this.calculateContentSimilarity(content, memory.content);
        return contentSimilarity > 0.7;
      });
    } catch (error) {
      logger.warn({ err: error, personalityId }, "Failed to check recent responses");
      return false;
    }
  }

  /**
   * Get AI response suggestions based on memory
   */
  static async getResponseSuggestions(
    personalityId: AIPersonalityId,
    currentTopics: string[],
    currentSentiment: DiscussionContext['sentiment']
  ): Promise<string[]> {
    try {
      const recentMemories = await this.getPersonalityMemory(personalityId, 5);
      const suggestions: string[] = [];
      
      // Analyze patterns in recent responses
      const topicResponses = new Map<string, string[]>();
      
      recentMemories.forEach(memory => {
        memory.topics.forEach(topic => {
          if (!topicResponses.has(topic)) {
            topicResponses.set(topic, []);
          }
          topicResponses.get(topic)!.push(memory.content);
        });
      });
      
      // Generate suggestions based on current topics
      currentTopics.forEach(topic => {
        const responses = topicResponses.get(topic);
        if (responses && responses.length > 0) {
          // Avoid repetition by suggesting different approaches
          const uniqueApproaches = new Set(responses);
          suggestions.push(...Array.from(uniqueApproaches).slice(0, 2));
        }
      });
      
      return suggestions.slice(0, 3); // Limit suggestions
    } catch (error) {
      logger.warn({ err: error, personalityId }, "Failed to get response suggestions");
      return [];
    }
  }

  /**
   * Clear old memory entries
   */
  static async cleanupOldEntries(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    // This would be implemented with Redis TTL or similar
    // For now, cache entries automatically expire
    logger.debug("AI memory cleanup completed (handled by cache TTL)");
  }

  // Helper methods
  private static async getPersonalityThreadKeys(personalityId: AIPersonalityId): Promise<string[]> {
    // In a real implementation, you'd use Redis SCAN with pattern
    // For now, return empty array - this would need Redis client access
    return [];
  }

  private static calculateContentSimilarity(content1: string, content2: string): number {
    // Simple word-based similarity (could be enhanced with embeddings)
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Get context for AI response generation
   */
  static async getResponseContext(
    contentId: string,
    personalityId: AIPersonalityId
  ): Promise<{
    discussionContext: string[];
    previousAIResponses: string[];
    recentTopics: string[];
    shouldAvoidRepetition: boolean;
  }> {
    const discussionContext = await this.getDiscussionContext(contentId, 5);
    const personalityMemory = await this.getPersonalityMemory(personalityId, 3);
    
    const discussionTexts = discussionContext?.recentComments
      .filter(c => !c.aiGenerated)
      .map(c => c.content) || [];
    
    const previousAIResponses = personalityMemory.map(m => m.content);
    const recentTopics = discussionContext?.topics || [];
    
    // Check if AI has been very active recently
    const recentAIResponses = discussionContext?.aiResponses || [];
    const veryRecentAI = recentAIResponses.filter(
      r => Date.now() - r.timestamp < 10 * 60 * 1000 // 10 minutes
    );
    const shouldAvoidRepetition = veryRecentAI.length >= 2;
    
    return {
      discussionContext: discussionTexts,
      previousAIResponses,
      recentTopics,
      shouldAvoidRepetition
    };
  }
}
