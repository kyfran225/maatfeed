import { TrendEngine } from '../ai/trendEngine.js';
import { TrendSignal } from '../models/TrendSignal.js';
import { ContentModel } from '../models/Content.js';
import { queueTrendingNotification } from '../queues/pushNotificationQueue.js';
import { logger } from '../config/logger.js';

export class TrendService {
  private trendEngine: TrendEngine;

  constructor() {
    this.trendEngine = new TrendEngine();
  }

  /**
   * Refresh trend signals for all content
   */
  async refreshTrendSignals(): Promise<{ updated: number; created: number; deactivated: number }> {
    try {
      const startTime = Date.now();
      let updated = 0;
      let created = 0;
      let deactivated = 0;

      // Get all published content
      const publishedContent = await ContentModel.find({
        processingStatus: 'published'
      }).limit(1000); // Process in batches

      logger.info(`Starting trend signal refresh for ${publishedContent.length} content items`);

      // Process each content item
      for (const content of publishedContent) {
        try {
          const bucket = this.getContentBucket(content);
          const result = await this.trendEngine.updateTrendSignal(content._id.toString(), bucket);

          if (result) {
            if (result.isNew) {
              created++;
              // Queue push notification for new trending content
              await queueTrendingNotification(content._id.toString(), result.currentScore || result.peakScore || 100);
            } else {
              updated++;
              // Queue notification if score is very high (viral threshold)
              if ((result.currentScore || 0) > 200) {
                await queueTrendingNotification(content._id.toString(), result.currentScore);
              }
            }
          }
        } catch (error) {
          logger.error({ 
            contentId: content._id, 
            error: String(error) 
          }, 'Error processing trend signal for content:');
        }
      }

      // Deactivate declining trends
      await this.trendEngine.deactivateDecliningTrends();
      deactivated = await TrendSignal.countDocuments({ 
        isActive: false, 
        lastUpdated: { $gte: new Date(startTime) } 
      });

      logger.info(`Trend signal refresh completed: ${updated} updated, ${created} created, ${deactivated} deactivated`);

      return { updated, created, deactivated };
    } catch (error) {
      logger.error({ error }, 'Error in refreshTrendSignals:');
      throw error;
    }
  }

  /**
   * Get trending content by bucket
   */
  async getTrendingContent(bucket: 'viral' | 'educational' | 'deep', limit: number = 20) {
    try {
      const trendingSignals = await this.trendEngine.getTopTrendingContent(bucket, limit);
      
      return trendingSignals.map(signal => ({
        contentId: signal.contentId,
        signalType: signal.signalType,
        momentum: signal.momentum,
        confidence: signal.confidence,
        peakScore: signal.peakScore,
        currentScore: signal.currentScore,
        detectedAt: signal.detectedAt,
        duration: signal.duration,
        content: signal.contentId // Populated content
      }));
    } catch (error) {
      logger.error({ error }, 'Error getting trending content:');
      throw error;
    }
  }

  /**
   * Get trend analytics
   */
  async getTrendAnalytics() {
    try {
      const [
        totalActiveTrends,
        spikeTrends,
        sustainedTrends,
        decliningTrends,
        trendsByBucket
      ] = await Promise.all([
        TrendSignal.countDocuments({ isActive: true }),
        TrendSignal.countDocuments({ isActive: true, signalType: 'spike' }),
        TrendSignal.countDocuments({ isActive: true, signalType: 'sustained' }),
        TrendSignal.countDocuments({ isActive: true, signalType: 'declining' }),
        this.getTrendsByBucket()
      ]);

      return {
        totalActiveTrends,
        spikeTrends,
        sustainedTrends,
        decliningTrends,
        trendsByBucket,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error({ error }, 'Error getting trend analytics:');
      throw error;
    }
  }

  /**
   * Get trend signals for specific content
   */
  async getContentTrends(contentId: string) {
    try {
      const trends = await TrendSignal.find({ contentId })
        .sort({ detectedAt: -1 })
        .limit(10);

      return trends.map(trend => ({
        signalType: trend.signalType,
        momentum: trend.momentum,
        confidence: trend.confidence,
        peakScore: trend.peakScore,
        currentScore: trend.currentScore,
        detectedAt: trend.detectedAt,
        lastUpdated: trend.lastUpdated,
        duration: trend.duration,
        isActive: trend.isActive
      }));
    } catch (error) {
      logger.error({ error }, 'Error getting content trends:');
      throw error;
    }
  }

  /**
   * Manually trigger trend analysis for content
   */
  async analyzeContentTrend(contentId: string) {
    try {
      const content = await ContentModel.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      const bucket = this.getContentBucket(content);
      const result = await this.trendEngine.updateTrendSignal(contentId, bucket);

      return result;
    } catch (error) {
      logger.error({ error }, 'Error analyzing content trend:');
      throw error;
    }
  }

  /**
   * Get content bucket based on classification
   */
  private getContentBucket(content: any): 'viral' | 'educational' | 'deep' {
    // This should match the classification bucket logic
    // For now, use a simple heuristic based on tags and description
    const text = (content.title + ' ' + content.description + ' ' + content.tags.join(' ')).toLowerCase();
    
    if (text.includes('viral') || text.includes('trending') || text.includes('popular')) {
      return 'viral';
    }
    
    if (text.includes('education') || text.includes('learn') || text.includes('history') || text.includes('science')) {
      return 'educational';
    }
    
    return 'deep';
  }

  /**
   * Get trends breakdown by bucket
   */
  private async getTrendsByBucket() {
    const buckets = ['viral', 'educational', 'deep'];
    const results = {};

    for (const bucket of buckets) {
      const [total, spike, sustained, declining] = await Promise.all([
        TrendSignal.countDocuments({ bucket, isActive: true }),
        TrendSignal.countDocuments({ bucket, isActive: true, signalType: 'spike' }),
        TrendSignal.countDocuments({ bucket, isActive: true, signalType: 'sustained' }),
        TrendSignal.countDocuments({ bucket, isActive: true, signalType: 'declining' })
      ]);

      (results as any)[bucket] = {
        total,
        spike,
        sustained,
        declining
      };
    }

    return results;
  }

  /**
   * Clean up old inactive trends
   */
  async cleanupOldTrends(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await TrendSignal.deleteMany({
        isActive: false,
        lastUpdated: { $lt: thirtyDaysAgo }
      });

      logger.info(`Cleaned up ${result.deletedCount} old trend signals`);
      return result.deletedCount;
    } catch (error) {
      logger.error({ error }, 'Error cleaning up old trends:');
      throw error;
    }
  }
}
