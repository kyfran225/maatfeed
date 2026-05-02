import type { Request, Response, NextFunction } from "express";

// Common spam patterns
const SPAM_PATTERNS = [
  /\b(viagra|cialis|casino|lottery|prize|winner)\b/gi,
  /\b(click here|buy now|limited time|act now)\b/gi,
  /\b(make money|earn \$\d+|work from home)\b/gi,
  /\b(weight loss|diet pill|miracle cure)\b/gi,
  /\$\$+\s*(?:free|click|buy)/gi,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
  /https?:\/\/[^\s]+\.[^\s]{2,}/g // URLs
];

// Toxic/harmful patterns (basic profanity filter - production should use ML)
const TOXIC_PATTERNS = [
  /\b(stupid|idiot|moron|retard)\b/gi,
  /\b(dumb|worthless|pathetic)\b/gi
];

// Harassment indicators
const HARASSMENT_PATTERNS = [
  /\b(kill yourself|kys|die in a fire)\b/gi,
  /\b(ugly|fat|loser|nobody likes you)\b/gi
];

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  violations: string[];
  suggestions?: string[];
}

interface ModerationOptions {
  minLength?: number;
  maxLength?: number;
  checkSpam?: boolean;
  checkToxicity?: boolean;
  checkHarassment?: boolean;
  requireMeaningful?: boolean;
}

const DEFAULT_OPTIONS: Required<ModerationOptions> = {
  minLength: 2,
  maxLength: 2000,
  checkSpam: true,
  checkToxicity: true,
  checkHarassment: true,
  requireMeaningful: true
};

export function moderateContent(
  content: string,
  options: ModerationOptions = {}
): ModerationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const violations: string[] = [];
  const suggestions: string[] = [];

  // Length checks
  const trimmedContent = content.trim();

  if (trimmedContent.length < opts.minLength) {
    violations.push(`Content must be at least ${opts.minLength} characters long`);
    suggestions.push("Please add more detail to your message");
  }

  if (trimmedContent.length > opts.maxLength) {
    violations.push(`Content exceeds maximum length of ${opts.maxLength} characters`);
    suggestions.push("Please shorten your message");
  }

  // Check for repeated characters (e.g., "aaaaaa", "!!!!!!")
  const repeatedCharPattern = /(.)(\1{4,})/g;
  if (repeatedCharPattern.test(trimmedContent)) {
    violations.push("Content contains excessive repeated characters");
    suggestions.push("Please avoid excessive repetition");
  }

  // Check for ALL CAPS (if more than 50% of letters)
  const letters = trimmedContent.replace(/[^a-zA-Z]/g, "");
  const caps = letters.replace(/[^A-Z]/g, "");
  if (letters.length > 10 && caps.length / letters.length > 0.7) {
    violations.push("Excessive use of capital letters detected");
    suggestions.push("Please avoid typing in all caps");
  }

  // Spam check
  if (opts.checkSpam) {
    const spamMatches = SPAM_PATTERNS.filter(pattern => pattern.test(trimmedContent));
    if (spamMatches.length > 0) {
      violations.push("Content appears to be spam or promotional");
      suggestions.push("Please avoid promotional content or links");
    }
  }

  // Toxicity check
  if (opts.checkToxicity) {
    const toxicMatches = TOXIC_PATTERNS.filter(pattern => pattern.test(trimmedContent));
    if (toxicMatches.length > 0) {
      violations.push("Inappropriate language detected");
      suggestions.push("Please keep discussions respectful");
    }
  }

  // Harassment check
  if (opts.checkHarassment) {
    const harassmentMatches = HARASSMENT_PATTERNS.filter(pattern => pattern.test(trimmedContent));
    if (harassmentMatches.length > 0) {
      violations.push("Harassment or harmful content detected");
      suggestions.push("This type of content is not allowed on our platform");
    }
  }

  // Meaningful content check
  if (opts.requireMeaningful) {
    // Check for excessive emoji-only content
    const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojiCount = (trimmedContent.match(emojiPattern) || []).length;
    const textLength = trimmedContent.replace(emojiPattern, "").trim().length;

    if (emojiCount > 5 && textLength < 5) {
      violations.push("Content appears to be mostly emojis");
      suggestions.push("Please include more text in your message");
    }

    // Check for gibberish (random characters) - DISABLED for now due to false positives
    // This pattern can block valid words in various languages
    // const gibberishPattern = /\b([bcdfghjklmnpqrstvwxz]{5,}|([aeiou]{5,}))\b/gi;
    // if (gibberishPattern.test(trimmedContent)) {
    //   violations.push("Content appears to be gibberish or random characters");
    //   suggestions.push("Please write meaningful words");
    // }
  }

  return {
    isAllowed: violations.length === 0,
    reason: violations.length > 0 ? violations[0] : undefined,
    violations,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

// Express middleware for content moderation
export function contentModerationMiddleware(options: ModerationOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const content = req.body.body || req.body.content || req.body.text || "";

    if (!content || typeof content !== "string") {
      return res.status(400).json({
        success: false,
        error: "Content is required",
        field: "body"
      });
    }

    const result = moderateContent(content, options);

    if (!result.isAllowed) {
      return res.status(400).json({
        success: false,
        error: result.reason || "Content violates community guidelines",
        violations: result.violations,
        suggestions: result.suggestions,
        code: "CONTENT_MODERATION_FAILED"
      });
    }

    // Store moderation result for potential logging
    res.locals.moderationResult = result;

    next();
  };
}

// Specific middlewares for different content types
export const commentModeration = contentModerationMiddleware({
  minLength: 2,
  maxLength: 2000,
  checkSpam: true,
  checkToxicity: true,
  checkHarassment: true,
  requireMeaningful: true
});

export const replyModeration = contentModerationMiddleware({
  minLength: 1,
  maxLength: 1000,
  checkSpam: true,
  checkToxicity: true,
  checkHarassment: true,
  requireMeaningful: true
});

export const editModeration = contentModerationMiddleware({
  minLength: 2,
  maxLength: 2000,
  checkSpam: true,
  checkToxicity: true,
  checkHarassment: true,
  requireMeaningful: true
});

// Extract mentions from content
export function extractMentions(content: string): string[] {
  const mentionPattern = /@(\w+)/g;
  const matches = content.match(mentionPattern);
  if (!matches) return [];
  return matches.map(match => match.slice(1)); // Remove @ symbol
}

// Check if content contains profanity (for client-side preview)
export function containsProfanity(content: string): boolean {
  const lowerContent = content.toLowerCase();
  const profanityWords = [
    "shit", "fuck", "damn", "bitch", "asshole",
    "crap", "hell" // Mild words - extend as needed
  ];
  return profanityWords.some(word => lowerContent.includes(word));
}

// Get content preview (for preview before posting)
export function getContentPreview(content: string, maxLength: number = 100): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength - 3) + "...";
}

// Format mentions in content (convert @username to link format)
export function formatMentions(content: string, baseUrl: string = "/profile/"): string {
  return content.replace(/@(\w+)/g, (match, username) => {
    return `[${match}](${baseUrl}${username})`;
  });
}
