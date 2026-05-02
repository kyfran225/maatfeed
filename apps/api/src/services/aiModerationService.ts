import { logger } from "../config/logger.js";
import { getCache, setCache } from "./cacheService.js";
import { analyzeComment, type CommentAnalysis } from "./commentAnalysisService.js";
import { classifyContent, type ContentClassification } from "./contentClassificationService.js";
import { createHash } from "node:crypto";

export interface ModerationResult {
  allowed: boolean;
  reason: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  flags: ModerationFlag[];
  confidence: number;
  recommendations: string[];
}

export interface ModerationFlag {
  type: "toxicity" | "spam" | "hate_speech" | "violence" | "adult_content" | "misinformation" | "harassment" | "self_harm";
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  details: string;
}

export interface ModerationConfig {
  thresholds: {
    toxicity: number;
    spam: number;
    hate_speech: number;
    violence: number;
    adult_content: number;
    misinformation: number;
    harassment: number;
    self_harm: number;
  };
  strictMode: boolean;
  aiInterventionAllowed: boolean;
  requireHumanReview: boolean;
}

const DEFAULT_CONFIG: ModerationConfig = {
  thresholds: {
    toxicity: 0.6,
    spam: 0.7,
    hate_speech: 0.7,
    violence: 0.8,
    adult_content: 0.8,
    misinformation: 0.6,
    harassment: 0.7,
    self_harm: 0.9
  },
  strictMode: false,
  aiInterventionAllowed: true,
  requireHumanReview: false
};

// Toxic patterns for regex-based detection
const TOXIC_PATTERNS = [
  {
    pattern: /\b(idiot|stupide|débile|abruti|imbécile|connard|salope|enculé|pute|fdp|ntm)\b/gi,
    type: "toxicity" as const,
    severity: "high" as const
  },
  {
    pattern: /\b(tuer|mort|meurtre|assassiner|éliminer|détruire)\b/gi,
    type: "violence" as const,
    severity: "medium" as const
  },
  {
    pattern: /\b(haine|détester|raciste|nazi|fasciste)\b/gi,
    type: "hate_speech" as const,
    severity: "high" as const
  },
  {
    pattern: /\b(sex|nue|porno|xxx|adulte)\b/gi,
    type: "adult_content" as const,
    severity: "medium" as const
  }
];

// Spam patterns
const SPAM_PATTERNS = [
  {
    pattern: /(https?:\/\/[^\s]+)/gi,
    type: "spam" as const,
    severity: "medium" as const,
    details: "Multiple URLs detected"
  },
  {
    pattern: /\b(gratuit|promo|promotion|argent facile|gagnez|abonne-toi|subscribe|bitcoin|crypto)\b/gi,
    type: "spam" as const,
    severity: "medium" as const,
    details: "Promotional content detected"
  },
  {
    pattern: /(.)\1{6,}/g,
    type: "spam" as const,
    severity: "low" as const,
    details: "Excessive repetition detected"
  },
  {
    pattern: /\b\w+@\w+\.\w+\b/g,
    type: "spam" as const,
    severity: "low" as const,
    details: "Email address detected"
  }
];

// Harassment patterns
const HARASSMENT_PATTERNS = [
  {
    pattern: /\b(suicide|se tuer|mourir|finir|en finir)\b/gi,
    type: "self_harm" as const,
    severity: "critical" as const,
    details: "Self-harm language detected"
  },
  {
    pattern: /\b(pourchasser|harceler|traquer|stalker)\b/gi,
    type: "harassment" as const,
    severity: "high" as const,
    details: "Harassment language detected"
  }
];

const MODERATION_CACHE_TTL_SECONDS = 60 * 15; // 15 minutes

export class AIModerationService {
  
  /**
   * Moderate content before AI intervention
   */
  static async moderateForAI(
    text: string,
    config: Partial<ModerationConfig> = {}
  ): Promise<ModerationResult> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const cacheKey = `moderation:ai:${createHash("sha1").update(text).digest("hex")}`;
    const cached = await getCache<ModerationResult>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const flags: ModerationFlag[] = [];
      let overallRiskLevel: "low" | "medium" | "high" | "critical" = "low";
      let overallConfidence = 0;

      // Get AI-based analysis
      const commentAnalysis = await analyzeComment(text);
      const contentClassification = await classifyContent(text);

      // Check toxicity
      if (commentAnalysis.toxicityScore > finalConfig.thresholds.toxicity) {
        flags.push({
          type: "toxicity",
          severity: commentAnalysis.toxicityScore > 0.8 ? "critical" : 
                   commentAnalysis.toxicityScore > 0.7 ? "high" : "medium",
          confidence: commentAnalysis.toxicityScore,
          details: `Toxicity score: ${commentAnalysis.toxicityScore.toFixed(2)}`
        });
      }

      // Check spam
      if (commentAnalysis.spamScore > finalConfig.thresholds.spam) {
        flags.push({
          type: "spam",
          severity: commentAnalysis.spamScore > 0.8 ? "high" : "medium",
          confidence: commentAnalysis.spamScore,
          details: `Spam score: ${commentAnalysis.spamScore.toFixed(2)}`
        });
      }

      // Regex-based pattern detection
      flags.push(...this.detectPatterns(text, TOXIC_PATTERNS));
      flags.push(...this.detectPatterns(text, SPAM_PATTERNS));
      flags.push(...this.detectPatterns(text, HARASSMENT_PATTERNS));

      // Check sentiment for potential issues
      if (contentClassification.sentiment.negative > 0.8) {
        flags.push({
          type: "harassment",
          severity: "medium",
          confidence: contentClassification.sentiment.negative,
          details: "Highly negative sentiment detected"
        });
      }

      // Determine overall risk level
      const criticalFlags = flags.filter(f => f.severity === "critical");
      const highFlags = flags.filter(f => f.severity === "high");
      const mediumFlags = flags.filter(f => f.severity === "medium");

      if (criticalFlags.length > 0) {
        overallRiskLevel = "critical";
      } else if (highFlags.length > 0) {
        overallRiskLevel = "high";
      } else if (mediumFlags.length > 2) {
        overallRiskLevel = "high";
      } else if (mediumFlags.length > 0) {
        overallRiskLevel = "medium";
      }

      // Calculate overall confidence
      overallConfidence = flags.length > 0 
        ? Math.max(...flags.map(f => f.confidence))
        : 0;

      // Generate recommendations
      const recommendations = this.generateRecommendations(flags, overallRiskLevel);

      // Determine if AI should intervene
      const allowed = this.shouldAllowAIIntervention(flags, overallRiskLevel, finalConfig);

      const result: ModerationResult = {
        allowed,
        reason: this.generateModerationReason(flags, overallRiskLevel),
        riskLevel: overallRiskLevel,
        flags,
        confidence: overallConfidence,
        recommendations
      };

      await setCache(cacheKey, result, MODERATION_CACHE_TTL_SECONDS);
      return result;

    } catch (error) {
      logger.warn({ err: error }, "Moderation analysis failed, allowing by default");
      
      // Fail-safe: allow but with warning
      return {
        allowed: true,
        reason: "Moderation analysis failed, allowing by default",
        riskLevel: "low",
        flags: [],
        confidence: 0,
        recommendations: ["Review content manually if possible"]
      };
    }
  }

  /**
   * Check if content is safe for AI response generation
   */
  static async isSafeForAIResponse(text: string): Promise<boolean> {
    const moderation = await this.moderateForAI(text);
    return moderation.allowed && moderation.riskLevel !== "critical";
  }

  /**
   * Get content safety score (0-1, higher is safer)
   */
  static async getSafetyScore(text: string): Promise<number> {
    const moderation = await this.moderateForAI(text);
    
    if (moderation.riskLevel === "critical") return 0;
    if (moderation.riskLevel === "high") return 0.2;
    if (moderation.riskLevel === "medium") return 0.5;
    if (moderation.riskLevel === "low") return 0.8;
    
    // Account for confidence
    return Math.max(0, 1 - moderation.confidence);
  }

  /**
   * Filter AI-generated content before posting
   */
  static async filterAIResponse(
    response: string,
    originalContext: string
  ): Promise<{
    allowed: boolean;
    filteredResponse?: string;
    reason: string;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    
    // Check if response is appropriate
    const moderation = await this.moderateForAI(response);
    
    if (!moderation.allowed) {
      return {
        allowed: false,
        reason: `AI response flagged: ${moderation.reason}`,
        warnings: moderation.recommendations
      };
    }

    // Additional checks for AI responses
    let filteredResponse = response;

    // Remove potential disclaimers about being AI
    filteredResponse = filteredResponse.replace(
      /(en tant qu'ia|je suis une ia|comme intelligence artificielle|ai assistant)/gi,
      ""
    ).trim();

    // Check for repetitive content
    if (this.isRepetitive(filteredResponse, originalContext)) {
      warnings.push("Response may be repetitive");
    }

    // Check for appropriate length
    if (filteredResponse.length > 500) {
      warnings.push("Response is quite long, consider being more concise");
    }

    // Check if response actually addresses the context
    if (!this.addressesContext(filteredResponse, originalContext)) {
      warnings.push("Response may not address the original comment");
    }

    return {
      allowed: true,
      filteredResponse,
      reason: moderation.reason,
      warnings
    };
  }

  // Helper methods
  private static detectPatterns(
    text: string, 
    patterns: Array<{
      pattern: RegExp;
      type: ModerationFlag["type"];
      severity: ModerationFlag["severity"];
      details?: string;
    }>
  ): ModerationFlag[] {
    const flags: ModerationFlag[] = [];
    
    patterns.forEach(({ pattern, type, severity, details }) => {
      const matches = text.match(pattern);
      if (matches) {
        flags.push({
          type,
          severity,
          confidence: Math.min(1, matches.length / 3), // Scale by number of matches
          details: details || `Pattern detected: ${pattern.source}`
        });
      }
    });
    
    return flags;
  }

  private static shouldAllowAIIntervention(
    flags: ModerationFlag[],
    riskLevel: ModerationResult["riskLevel"],
    config: ModerationConfig
  ): boolean {
    // Critical risk always blocks AI
    if (riskLevel === "critical") return false;
    
    // High risk blocks in strict mode
    if (riskLevel === "high" && config.strictMode) return false;
    
    // Check specific flag types
    const hasHarassment = flags.some(f => f.type === "harassment" || f.type === "hate_speech");
    const hasSelfHarm = flags.some(f => f.type === "self_harm");
    
    if (hasSelfHarm) return false;
    if (hasHarassment && riskLevel === "high") return false;
    
    return config.aiInterventionAllowed;
  }

  private static generateModerationReason(
    flags: ModerationFlag[],
    riskLevel: ModerationResult["riskLevel"]
  ): string {
    if (flags.length === 0) return "Content appears safe";
    
    const flagTypes = [...new Set(flags.map(f => f.type))];
    const typeNames = {
      toxicity: "contenu toxique",
      spam: "spam",
      hate_speech: "discours haineux",
      violence: "violence",
      adult_content: "contenu adulte",
      misinformation: "désinformation",
      harassment: "harcèlement",
      self_harm: "auto-danger"
    };
    
    const detectedTypes = flagTypes.map(type => typeNames[type] || type).join(", ");
    return `Content flagged: ${detectedTypes} (risk: ${riskLevel})`;
  }

  private static generateRecommendations(
    flags: ModerationFlag[],
    riskLevel: ModerationResult["riskLevel"]
  ): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === "critical") {
      recommendations.push("Immediate human review required");
      recommendations.push("Consider blocking user temporarily");
    } else if (riskLevel === "high") {
      recommendations.push("Human review recommended");
      recommendations.push("Monitor user activity");
    } else if (riskLevel === "medium") {
      recommendations.push("Monitor for escalation");
    }
    
    // Specific recommendations based on flag types
    const flagTypes = [...new Set(flags.map(f => f.type))];
    if (flagTypes.includes("toxicity")) {
      recommendations.push("Consider warning user about toxic language");
    }
    if (flagTypes.includes("spam")) {
      recommendations.push("Monitor for spam patterns");
    }
    if (flagTypes.includes("harassment")) {
      recommendations.push("Review for harassment policy violations");
    }
    
    return recommendations;
  }

  private static isRepetitive(response: string, context: string): boolean {
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    const contextWords = context.toLowerCase().split(/\s+/);
    
    const overlap = contextWords.filter(word => responseWords.has(word)).length;
    const overlapRatio = contextWords.length > 0 ? overlap / contextWords.length : 0;
    
    return overlapRatio > 0.7; // More than 70% word overlap
  }

  private static addressesContext(response: string, context: string): boolean {
    // Simple heuristic: check if response contains some context words
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    const contextWords = new Set(context.toLowerCase().split(/\s+/));
    
    // Check for at least some meaningful overlap
    const overlap = [...responseWords].filter(word => 
      contextWords.has(word) && word.length > 3 // Ignore very short words
    ).length;
    
    return overlap >= 2; // At least 2 meaningful words in common
  }
}
