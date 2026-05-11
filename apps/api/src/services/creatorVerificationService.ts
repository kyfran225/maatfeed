import { CreatorModel, type CreatorStatus } from "../models/Creator";
import { ProfileModel } from "../models/Profile";
import { ContentModel } from "../models/Content";
import { Types } from "mongoose";

export type VerificationMethod = "automatic" | "manual" | "community" | "admin";
export type VerificationCriteria = "content_quality" | "engagement" | "consistency" | "community_trust";

export interface VerificationRequest {
  creatorId: string;
  method: VerificationMethod;
  criteria: VerificationCriteria[];
  evidence: {
    contentSamples: string[];
    engagementMetrics: any;
    communityFeedback: any;
    consistencyScore: number;
  };
  requestedBy: string; // user ID
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface VerificationCriteriaResult {
  criteria: VerificationCriteria;
  score: number; // 0-100
  passed: boolean;
  details: string;
  evidence: any;
}

export interface VerificationResult {
  creatorId: string;
  overallScore: number;
  criteriaResults: VerificationCriteriaResult[];
  recommendation: "approve" | "reject" | "manual_review";
  reasoning: string;
  nextReviewDate?: Date;
}

class CreatorVerificationService {
  /**
   * Check if creator is eligible for verification
   */
  async checkVerificationEligibility(creatorId: string): Promise<{
    eligible: boolean;
    reasons: string[];
    requirements: {
      current: any;
      required: any;
    };
  }> {
    try {
      const creator = await CreatorModel.findById(creatorId).populate("userId");
      if (!creator) {
        throw new Error("Creator not found");
      }

      const requirements = {
        minimumContent: 5,
        minimumFollowers: 100,
        minimumEngagement: 50,
        minimumAge: 30, // days
        contentQualityThreshold: 0.7
      };

      const current = {
        totalContent: creator.stats.totalContent,
        totalFollowers: creator.stats.totalFollowers,
        totalEngagement: creator.stats.totalEngagement,
        accountAge: Math.floor((Date.now() - creator.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        avgContentQuality: await this.calculateContentQuality(creatorId)
      };

      const reasons = [];
      
      if (current.totalContent < requirements.minimumContent) {
        reasons.push(`Need at least ${requirements.minimumContent} pieces of content (have ${current.totalContent})`);
      }
      
      if (current.totalFollowers < requirements.minimumFollowers) {
        reasons.push(`Need at least ${requirements.minimumFollowers} followers (have ${current.totalFollowers})`);
      }
      
      if (current.totalEngagement < requirements.minimumEngagement) {
        reasons.push(`Need at least ${requirements.minimumEngagement} total engagement (have ${current.totalEngagement})`);
      }
      
      if (current.accountAge < requirements.minimumAge) {
        reasons.push(`Account must be at least ${requirements.minimumAge} days old (is ${current.accountAge} days)`);
      }
      
      if (current.avgContentQuality < requirements.contentQualityThreshold) {
        reasons.push(`Content quality score too low (${current.avgContentQuality.toFixed(2)} < ${requirements.contentQualityThreshold})`);
      }

      return {
        eligible: reasons.length === 0,
        reasons,
        requirements: { current, required: requirements }
      };
    } catch (error) {
      console.error("Error checking verification eligibility:", error);
      throw error;
    }
  }

  /**
   * Calculate content quality score for a creator
   */
  async calculateContentQuality(creatorId: string): Promise<number> {
    try {
      const content = await ContentModel.find({ creatorId });
      
      if (content.length === 0) return 0;

      let totalScore = 0;
      
      for (const item of content) {
        let score = 0;
        
        // View count score (0-30 points)
        const viewScore = Math.min(item.views / 1000, 30);
        score += viewScore;
        
        // Engagement score (0-30 points)
        const engagementScore = Math.min(item.engagement / 100, 30);
        score += engagementScore;
        
        // Completion rate score (0-20 points)
        const completionScore = (item.completionRate || 0) / 5; // Max 20 points at 100% completion
        score += Math.min(completionScore, 20);
        
        // Content length/quality score (0-20 points)
        const qualityScore = this.assessContentQuality(item);
        score += qualityScore;
        
        totalScore += score;
      }

      return totalScore / content.length / 100; // Normalize to 0-1
    } catch (error) {
      console.error("Error calculating content quality:", error);
      return 0;
    }
  }

  /**
   * Assess individual content quality
   */
  private assessContentQuality(content: any): number {
    let score = 0;
    
    // Description length (0-5 points)
    if (content.description && content.description.length > 100) {
      score += 5;
    } else if (content.description && content.description.length > 50) {
      score += 3;
    }
    
    // Has tags (0-5 points)
    if (content.tags && content.tags.length > 0) {
      score += 5;
    }
    
    // Has transcript (0-5 points)
    if (content.transcript) {
      score += 5;
    }
    
    // Has thumbnail (0-5 points)
    if (content.thumbnail) {
      score += 5;
    }
    
    return Math.min(score, 20);
  }

  /**
   * Run comprehensive verification analysis
   */
  async runVerificationAnalysis(creatorId: string): Promise<VerificationResult> {
    try {
      const creator = await CreatorModel.findById(creatorId).populate("userId");
      if (!creator) {
        throw new Error("Creator not found");
      }

      const criteriaResults: VerificationCriteriaResult[] = [];

      // Content Quality Analysis
      const contentQuality = await this.analyzeContentQuality(creatorId);
      criteriaResults.push(contentQuality);

      // Engagement Analysis
      const engagementAnalysis = await this.analyzeEngagement(creatorId);
      criteriaResults.push(engagementAnalysis);

      // Consistency Analysis
      const consistencyAnalysis = await this.analyzeConsistency(creatorId);
      criteriaResults.push(consistencyAnalysis);

      // Community Trust Analysis
      const communityTrust = await this.analyzeCommunityTrust(creatorId);
      criteriaResults.push(communityTrust);

      // Calculate overall score
      const overallScore = criteriaResults.reduce((sum, result) => sum + result.score, 0) / criteriaResults.length;

      // Make recommendation
      let recommendation: "approve" | "reject" | "manual_review";
      let reasoning = "";

      if (overallScore >= 80 && criteriaResults.every(r => r.passed)) {
        recommendation = "approve";
        reasoning = "Creator meets all verification criteria with high scores across all metrics.";
      } else if (overallScore >= 60 && criteriaResults.filter(r => r.passed).length >= 3) {
        recommendation = "manual_review";
        reasoning = "Creator shows potential but requires manual review due to mixed performance across criteria.";
      } else {
        recommendation = "reject";
        reasoning = "Creator does not meet minimum verification standards.";
      }

      // Set next review date if not approved
      let nextReviewDate: Date | undefined;
      if (recommendation !== "approve") {
        nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + 30); // Review again in 30 days
      }

      return {
        creatorId,
        overallScore,
        criteriaResults,
        recommendation,
        reasoning,
        nextReviewDate
      };
    } catch (error) {
      console.error("Error running verification analysis:", error);
      throw error;
    }
  }

  /**
   * Analyze content quality criteria
   */
  private async analyzeContentQuality(creatorId: string): Promise<VerificationCriteriaResult> {
    const qualityScore = await this.calculateContentQuality(creatorId);
    const threshold = 0.7;

    return {
      criteria: "content_quality",
      score: qualityScore * 100,
      passed: qualityScore >= threshold,
      details: `Content quality score: ${(qualityScore * 100).toFixed(1)}% (threshold: ${threshold * 100}%)`,
      evidence: {
        avgQuality: qualityScore,
        threshold,
        contentCount: await ContentModel.countDocuments({ creatorId })
      }
    };
  }

  /**
   * Analyze engagement criteria
   */
  private async analyzeEngagement(creatorId: string): Promise<VerificationCriteriaResult> {
    const creator = await CreatorModel.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    const engagementRate = creator.stats.totalFollowers > 0 
      ? creator.stats.totalEngagement / creator.stats.totalFollowers 
      : 0;

    const threshold = 0.1; // 10% engagement rate minimum
    const score = Math.min(engagementRate / threshold * 100, 100);

    return {
      criteria: "engagement",
      score,
      passed: engagementRate >= threshold,
      details: `Engagement rate: ${(engagementRate * 100).toFixed(2)}% (threshold: ${threshold * 100}%)`,
      evidence: {
        engagementRate,
        threshold,
        totalEngagement: creator.stats.totalEngagement,
        totalFollowers: creator.stats.totalFollowers
      }
    };
  }

  /**
   * Analyze consistency criteria
   */
  private async analyzeConsistency(creatorId: string): Promise<VerificationCriteriaResult> {
    const content = await ContentModel.find({ creatorId }).sort({ createdAt: 1 });
    
    if (content.length < 2) {
      return {
        criteria: "consistency",
        score: 0,
        passed: false,
        details: "Insufficient content to analyze consistency",
        evidence: { contentCount: content.length }
      };
    }

    // Calculate posting frequency
    const timeSpan = content[content.length - 1].createdAt.getTime() - content[0].createdAt.getTime();
    const daysSpan = timeSpan / (1000 * 60 * 60 * 24);
    const postingFrequency = content.length / Math.max(daysSpan, 1);

    // Calculate quality consistency
    const qualities = content.map(c => this.assessContentQuality(c));
    const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
    const qualityVariance = qualities.reduce((sum, q) => sum + Math.pow(q - avgQuality, 2), 0) / qualities.length;
    const consistencyScore = Math.max(0, 100 - qualityVariance);

    // Combined score
    const frequencyScore = Math.min(postingFrequency * 14 * 100, 50); // 50% weight, optimal is 1 post per week
    const finalScore = frequencyScore + (consistencyScore * 0.5); // 50% weight

    const threshold = 60;
    const passed = finalScore >= threshold && postingFrequency >= 0.5; // At least 1 post every 2 weeks

    return {
      criteria: "consistency",
      score: finalScore,
      passed,
      details: `Posting frequency: ${postingFrequency.toFixed(2)} posts/week, Quality consistency: ${consistencyScore.toFixed(1)}%`,
      evidence: {
        postingFrequency,
        consistencyScore: consistencyScore,
        contentCount: content.length,
        daysSpan
      }
    };
  }

  /**
   * Analyze community trust criteria
   */
  private async analyzeCommunityTrust(creatorId: string): Promise<VerificationCriteriaResult> {
    const creator = await CreatorModel.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    // Check for any reports or issues (placeholder for future moderation system)
    const hasReports = false; // Would check against moderation system
    const followerGrowthRate = creator.stats.followerGrowth;
    const avgEngagement = creator.stats.totalContent > 0 
      ? creator.stats.totalEngagement / creator.stats.totalContent 
      : 0;

    // Calculate trust score based on various factors
    let score = 50; // Base score

    // Follower growth (positive growth adds points)
    if (followerGrowthRate > 0) {
      score += Math.min(followerGrowthRate * 2, 30);
    } else if (followerGrowthRate < -10) {
      score -= 20; // Significant loss of followers reduces trust
    }

    // Engagement consistency
    if (avgEngagement > 10) {
      score += 20;
    }

    // No reports bonus
    if (!hasReports) {
      score += 20;
    }

    score = Math.max(0, Math.min(100, score));

    const threshold = 70;

    return {
      criteria: "community_trust",
      score,
      passed: score >= threshold && !hasReports,
      details: `Community trust score: ${score.toFixed(1)}% (threshold: ${threshold}%)`,
      evidence: {
        followerGrowthRate,
        avgEngagement,
        hasReports,
        totalFollowers: creator.stats.totalFollowers
      }
    };
  }

  /**
   * Approve creator verification
   */
  async approveVerification(creatorId: string, reviewedBy: string, method: VerificationMethod = "manual"): Promise<void> {
    try {
      await CreatorModel.findByIdAndUpdate(creatorId, {
        status: "verified",
        verificationBadge: {
          isVerified: true,
          verifiedAt: new Date(),
          verificationMethod: method
        }
      });

      console.log(`Creator ${creatorId} verified by ${reviewedBy} using ${method} method`);
    } catch (error) {
      console.error("Error approving verification:", error);
      throw error;
    }
  }

  /**
   * Reject creator verification
   */
  async rejectVerification(creatorId: string, reviewedBy: string, reason: string): Promise<void> {
    try {
      await CreatorModel.findByIdAndUpdate(creatorId, {
        status: "suspended",
        verificationBadge: {
          isVerified: false,
          verifiedAt: undefined,
          verificationMethod: undefined
        }
      });

      console.log(`Creator ${creatorId} verification rejected by ${reviewedBy}. Reason: ${reason}`);
    } catch (error) {
      console.error("Error rejecting verification:", error);
      throw error;
    }
  }

  /**
   * Get verification status and history
   */
  async getVerificationStatus(creatorId: string): Promise<{
    current: any;
    eligibility: any;
    lastAnalysis?: VerificationResult;
  }> {
    try {
      const creator = await CreatorModel.findById(creatorId).populate("userId");
      if (!creator) {
        throw new Error("Creator not found");
      }

      const eligibility = await this.checkVerificationEligibility(creatorId);

      return {
        current: {
          status: creator.status,
          isVerified: creator.verificationBadge.isVerified,
          verifiedAt: creator.verificationBadge.verifiedAt,
          verificationMethod: creator.verificationBadge.verificationMethod
        },
        eligibility
      };
    } catch (error) {
      console.error("Error getting verification status:", error);
      throw error;
    }
  }
}

export const creatorVerificationService = new CreatorVerificationService();
