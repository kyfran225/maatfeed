import { TrendSignalDocument, TrendSignal } from '../models/TrendSignal.js';
import { InteractionModel } from '../models/Interaction.js';
import { ContentScoreModel } from '../models/ContentScore.js';
import { ContentModel } from '../models/Content.js';
import { logger } from '../config/logger.js';

interface InteractionCounts {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  watches: number;
}

interface Interaction {
  contentId: string;
  actionType: 'like' | 'comment' | 'share' | 'view' | 'watch';
  createdAt: Date;
}

interface TrendMetrics {
  currentScore: number;
  previousScore: number;
  velocity: number;
  acceleration: number;
  momentum: number;
  engagementRate: number;
  growthRate: number;
  sustainability: number;
}

interface TrendThresholds {
  spikeThreshold: number; // minimum velocity for spike detection
  sustainedThreshold: number; // minimum duration for sustained trend
  declineThreshold: number; // negative velocity threshold
  confidenceThreshold: number; // minimum confidence for active trend
}

export class TrendEngine {
  private thresholds: TrendThresholds = {
    spikeThreshold: 0.5, // 50% score increase in short time
    sustainedThreshold: 0.3, // 30% sustained growth over 2 hours
    declineThreshold: -0.2, // 20% score decrease
    confidenceThreshold: 0.7 // 70% confidence required
  };

  /**
   * Analyze content for trend signals
   */
  async analyzeContentTrend(contentId: string): Promise<TrendMetrics | null> {
    try {
      // Get recent interaction data
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

      // Get interaction counts for different time windows
      const [currentInteractions, previousInteractions, baselineInteractions] = await Promise.all([
        this.getInteractionCounts(contentId, oneHourAgo, now),
        this.getInteractionCounts(contentId, twoHoursAgo, oneHourAgo),
        this.getInteractionCounts(contentId, sixHoursAgo, twoHoursAgo)
      ]);

      // Get current and previous scores
      const currentScore = await this.getCurrentScore(contentId);
      const previousScore = await this.getPreviousScore(contentId, twoHoursAgo);

      if (!currentScore) {
        return null;
      }

      // Calculate trend metrics
      const metrics = await this.calculateTrendMetrics(
        currentScore,
        previousScore || 0,
        currentInteractions,
        previousInteractions,
        baselineInteractions
      );

      return metrics;
    } catch (error) {
      logger.error({ contentId }, 'Error analyzing content trend:');
      logger.error({ error });
      return null;
    }
  }

  /**
   * Detect trend signal type based on metrics
   */
  detectTrendSignal(metrics: TrendMetrics): 'spike' | 'sustained' | 'declining' | 'stable' {
    const { velocity, acceleration, sustainability } = metrics;

    // Spike detection: high velocity with positive acceleration
    if (velocity > this.thresholds.spikeThreshold && acceleration > 0) {
      return 'spike';
    }

    // Declining detection: negative velocity
    if (velocity < this.thresholds.declineThreshold) {
      return 'declining';
    }

    // Sustained detection: moderate velocity with high sustainability
    if (velocity > this.thresholds.sustainedThreshold && sustainability > 0.7) {
      return 'sustained';
    }

    return 'stable';
  }

  /**
   * Calculate trend confidence score
   */
  calculateTrendConfidence(metrics: TrendMetrics, signalType: string): number {
    let confidence = 0.5; // base confidence

    const { velocity, acceleration, momentum, engagementRate, growthRate, sustainability } = metrics;

    // Velocity confidence
    if (Math.abs(velocity) > 0.3) confidence += 0.2;
    if (Math.abs(velocity) > 0.6) confidence += 0.1;

    // Acceleration confidence
    if (signalType === 'spike' && acceleration > 0.2) confidence += 0.15;
    if (signalType === 'declining' && acceleration < -0.1) confidence += 0.15;

    // Momentum confidence
    if (momentum > 0.5) confidence += 0.1;
    if (momentum > 1.0) confidence += 0.1;

    // Engagement confidence
    if (engagementRate > 0.05) confidence += 0.1;
    if (engagementRate > 0.1) confidence += 0.1;

    // Sustainability confidence (for sustained trends)
    if (signalType === 'sustained' && sustainability > 0.8) confidence += 0.15;

    return Math.min(confidence, 1.0);
  }

  /**
   * Get interaction counts for a time window
   */
  private async getInteractionCounts(
    contentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ likes: number; comments: number; shares: number; views: number; watches: number }> {
    const interactions = await InteractionModel.find({
      contentId,
      createdAt: { $gte: startDate, $lt: endDate }
    });

    return interactions.reduce(
      (acc: { likes: number; comments: number; shares: number; views: number; watches: number }, interaction: any) => {
        switch (interaction.actionType) {
          case 'like':
            acc.likes++;
            break;
          case 'comment':
            acc.comments++;
            break;
          case 'share':
            acc.shares++;
            break;
          case 'view':
            acc.views++;
            break;
          case 'watch':
            acc.watches++;
            break;
        }
        return acc;
      },
      { likes: 0, comments: 0, shares: 0, views: 0, watches: 0 }
    );
  }

  /**
   * Get current content score
   */
  private async getCurrentScore(contentId: string): Promise<number | null> {
    const score = await ContentScoreModel.findOne({ contentId }).sort({ createdAt: -1 });
    return score ? score.finalScore : null;
  }

  /**
   * Get previous content score
   */
  private async getPreviousScore(contentId: string, beforeDate: Date): Promise<number | null> {
    const score = await ContentScoreModel.findOne({
      contentId,
      createdAt: { $lt: beforeDate }
    }).sort({ createdAt: -1 });
    return score ? score.finalScore : null;
  }

  /**
   * Calculate trend metrics
   */
  private async calculateTrendMetrics(
    currentScore: number,
    previousScore: number,
    currentInteractions: InteractionCounts,
    previousInteractions: InteractionCounts,
    baselineInteractions: InteractionCounts
  ): Promise<TrendMetrics> {
    // Calculate velocity (rate of score change)
    const velocity = previousScore > 0 ? (currentScore - previousScore) / previousScore : 0;

    // Calculate acceleration (change in velocity)
    const previousVelocity = baselineInteractions.likes > 0 ? 
      (previousInteractions.likes - baselineInteractions.likes) / baselineInteractions.likes : 0;
    const currentVelocity = previousInteractions.likes > 0 ? 
      (currentInteractions.likes - previousInteractions.likes) / previousInteractions.likes : 0;
    const acceleration = currentVelocity - previousVelocity;

    // Calculate momentum (combined force)
    const currentValues = Object.values(currentInteractions) as number[];
    const previousValues = Object.values(previousInteractions) as number[];
    const totalCurrentInteractions = currentValues.reduce((sum: number, count: number) => sum + count, 0);
    const totalPreviousInteractions = previousValues.reduce((sum: number, count: number) => sum + count, 0);
    const momentum = totalPreviousInteractions > 0 ? 
      (totalCurrentInteractions - totalPreviousInteractions) / totalPreviousInteractions : 0;

    // Calculate engagement rate
    const content = await ContentModel.findOne({ _id: currentScore });
    const engagementRate = content ? totalCurrentInteractions / Math.max(content.scores?.views || 0, 1) : 0;

    // Calculate growth rate
    const growthRate = previousScore > 0 ? (currentScore - previousScore) / previousScore : 0;

    // Calculate sustainability (consistency of growth)
    const interactionVariance = this.calculateInteractionVariance(currentInteractions, previousInteractions);
    const sustainability = Math.max(0, 1 - interactionVariance);

    return {
      currentScore,
      previousScore,
      velocity,
      acceleration,
      momentum,
      engagementRate,
      growthRate,
      sustainability
    };
  }

  /**
   * Calculate interaction variance for sustainability
   */
  private calculateInteractionVariance(current: any, previous: any): number {
    const keys = ['likes', 'comments', 'shares', 'views', 'watches'] as const;
    const variances = keys.map(key => {
      const curr = (current as any)[key] || 0;
      const prev = (previous as any)[key] || 0;
      return prev > 0 ? Math.abs((curr - prev) / prev) : 0;
    });

    return variances.reduce((sum: number, variance: number) => sum + variance, 0) / keys.length;
  }

  /**
   * Get top trending content by bucket
   */
  async getTopTrendingContent(bucket: 'viral' | 'educational' | 'deep', limit: number = 10): Promise<TrendSignalDocument[]> {
    return TrendSignal.find({
      bucket,
      isActive: true,
      confidence: { $gte: this.thresholds.confidenceThreshold }
    })
      .sort({ momentum: -1, confidence: -1 })
      .limit(limit)
      .populate('contentId')
      .exec();
  }

  /**
   * Update trend signal for content
   */
  async updateTrendSignal(contentId: string, bucket: string): Promise<TrendSignalDocument | null> {
    const metrics = await this.analyzeContentTrend(contentId);
    if (!metrics) {
      return null;
    }

    const signalType = this.detectTrendSignal(metrics);
    const confidence = this.calculateTrendConfidence(metrics, signalType);

    // Deactivate stable trends
    if (signalType === 'stable') {
      await TrendSignal.updateMany(
        { contentId, isActive: true },
        { isActive: false, lastUpdated: new Date() }
      );
      return null;
    }

    // Update or create trend signal
    const existingSignal = await TrendSignal.findOne({ contentId, isActive: true });

    if (existingSignal) {
      // Update existing signal
      existingSignal.signalType = signalType as any;
      existingSignal.velocity = metrics.velocity;
      existingSignal.acceleration = metrics.acceleration;
      existingSignal.momentum = metrics.momentum;
      existingSignal.currentScore = metrics.currentScore;
      existingSignal.peakScore = Math.max(existingSignal.peakScore, metrics.currentScore);
      existingSignal.confidence = confidence;
      existingSignal.lastUpdated = new Date();
      existingSignal.duration = Math.floor(
        (Date.now() - existingSignal.detectedAt.getTime()) / (60 * 1000) // minutes
      );

      return existingSignal.save();
    } else {
      // Create new signal
      const content = await ContentModel.findById(contentId);
      const interactions = await this.getInteractionCounts(
        contentId,
        new Date(Date.now() - 60 * 60 * 1000),
        new Date()
      );

      return TrendSignal.create({
        contentId,
        bucket: bucket as any,
        signalType: signalType as any,
        velocity: metrics.velocity,
        acceleration: metrics.acceleration,
        momentum: metrics.momentum,
        peakScore: metrics.currentScore,
        currentScore: metrics.currentScore,
        baselineScore: metrics.previousScore,
        confidence,
        contributors: interactions,
        metadata: {
          contentTags: content?.tags || []
        }
      });
    }
  }

  /**
   * Deactivate declining trends
   */
  async deactivateDecliningTrends(): Promise<void> {
    await TrendSignal.updateMany(
      {
        signalType: 'declining',
        isActive: true,
        lastUpdated: { $lt: new Date(Date.now() - 30 * 60 * 1000) } // 30 minutes ago
      },
      {
        isActive: false,
        lastUpdated: new Date()
      }
    );
  }
}
