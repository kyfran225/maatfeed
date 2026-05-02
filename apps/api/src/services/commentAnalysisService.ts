import { createHash } from "node:crypto";
import { logger } from "../config/logger.js";
import { generateWithAIRouter } from "./aiRouterService.js";
import { getCache, setCache } from "./cacheService.js";

export interface CommentAnalysis {
  debateScore: number;
  questionScore: number;
  emotionScore: number;
  toxicityScore: number;
  spamScore: number;
  qualityScore: number;
}

const COMMENT_ANALYSIS_CACHE_TTL_SECONDS = 60 * 30;
const COMMENT_ANALYSIS_PROVIDER_ORDER = ["groq", "openrouter", "gemini"] as const;

const DEBATE_PATTERNS = [
  /\bmais\b/i,
  /\bcependant\b/i,
  /\bpourtant\b/i,
  /\bd'un autre côté\b/i,
  /\bje ne suis pas d'accord\b/i,
  /\bnuance\b/i,
  /\bargument\b/i,
  /\bdébat\b/i
];

const QUESTION_PATTERNS = [
  /\?+/,
  /^\s*(pourquoi|comment|quand|où|qui|quoi|est-ce que|peux-tu|pouvez-vous)\b/i
];

const EMOTION_PATTERNS = [
  /\b(j'adore|incroyable|magnifique|triste|honte|bravo|choqué|furieux|ému|passionnant)\b/i,
  /!{1,}/
];

const TOXIC_PATTERNS = [
  /\b(idiot|stupide|débile|abruti|imbécile|ferme-la|ta gueule|ordure)\b/i,
  /\b(hate you|shut up|moron|idiot)\b/i
];

const SPAM_PATTERNS = [
  /https?:\/\//i,
  /\b(gratuit|promo|promotion|argent facile|gagnez|abonne-toi|subscribe|bitcoin)\b/i,
  /(.)\1{6,}/,
  /\b\w+@\w+\.\w+\b/
];

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function parseJSONObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();

  try {
    const parsed = JSON.parse(candidate) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function sanitizeCommentText(text: string): string {
  return normalizeText(
    text
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
  );
}

function countPatternHits(text: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function regexFallbackAnalysis(text: string): CommentAnalysis {
  const normalized = normalizeText(text);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const urlCount = (normalized.match(/https?:\/\//gi) || []).length;
  const uppercaseRatio = normalized.length > 0
    ? normalized.replace(/[^A-ZÀ-ÖØ-Þ]/g, "").length / normalized.length
    : 0;

  const debateScore = clamp01((countPatternHits(normalized, DEBATE_PATTERNS) * 0.22) + (wordCount > 25 ? 0.15 : 0));
  const questionScore = clamp01((countPatternHits(normalized, QUESTION_PATTERNS) * 0.45) + (normalized.endsWith("?") ? 0.2 : 0));
  const emotionScore = clamp01((countPatternHits(normalized, EMOTION_PATTERNS) * 0.28) + (uppercaseRatio > 0.18 ? 0.2 : 0));
  const toxicityScore = clamp01((countPatternHits(normalized, TOXIC_PATTERNS) * 0.42) + (uppercaseRatio > 0.35 ? 0.12 : 0));
  const spamScore = clamp01(
    (countPatternHits(normalized, SPAM_PATTERNS) * 0.3) +
    (urlCount > 1 ? 0.35 : 0) +
    (wordCount > 0 && new Set(normalized.toLowerCase().split(/\s+/)).size / wordCount < 0.45 ? 0.2 : 0)
  );

  const qualityScore = clamp01(
    0.45 +
    Math.min(0.25, wordCount / 120) +
    (debateScore * 0.2) +
    (questionScore * 0.1) -
    (toxicityScore * 0.45) -
    (spamScore * 0.55)
  );

  return {
    debateScore,
    questionScore,
    emotionScore,
    toxicityScore,
    spamScore,
    qualityScore
  };
}

async function llmCommentAnalysis(text: string): Promise<Partial<CommentAnalysis> | null> {
  try {
    const routed = await generateWithAIRouter({
      providers: [...COMMENT_ANALYSIS_PROVIDER_ORDER],
      jsonMode: true,
      temperature: 0.1,
      maxTokens: 260,
      systemPrompt:
        "You score a single community comment. Return strict JSON only. Every score must be between 0 and 1. Do not add markdown or prose.",
      userPrompt: [
        "Schema:",
        '{"debateScore":0.4,"questionScore":0.8,"emotionScore":0.2,"toxicityScore":0.05,"spamScore":0.01,"qualityScore":0.78}',
        "Rules:",
        "- debateScore: disagreement, nuance, controversy, comparison, argumentation.",
        "- questionScore: direct question or explicit information request.",
        "- emotionScore: emotional intensity, not polarity.",
        "- toxicityScore: insult, aggression, harassment.",
        "- spamScore: promotion, links, repetitive noise, scams.",
        "- qualityScore: constructive and useful contribution.",
        `Comment: """${text}"""`
      ].join("\n")
    });

    const parsed = parseJSONObject(routed.text);
    if (!parsed) {
      throw new Error("Provider returned invalid JSON.");
    }

    const analysis: CommentAnalysis = {
      debateScore: clamp01(Number(parsed.debateScore ?? 0)),
      questionScore: clamp01(Number(parsed.questionScore ?? 0)),
      emotionScore: clamp01(Number(parsed.emotionScore ?? 0)),
      toxicityScore: clamp01(Number(parsed.toxicityScore ?? 0)),
      spamScore: clamp01(Number(parsed.spamScore ?? 0)),
      qualityScore: clamp01(Number(parsed.qualityScore ?? 0))
    };

    logger.info({ provider: routed.provider, analysis }, "LLM comment analysis completed");

    return analysis;
  } catch (error) {
    logger.warn({ err: error }, "LLM comment analysis failed, falling back to regex rules");
    return null;
  }
}

export async function analyzeComment(text: string): Promise<CommentAnalysis> {
  const sanitized = sanitizeCommentText(text);
  const cacheKey = `community:analysis:${createHash("sha1").update(sanitized).digest("hex")}`;
  const cached = await getCache<CommentAnalysis>(cacheKey);

  if (cached) {
    return cached;
  }

  const fallback = regexFallbackAnalysis(sanitized);
  const llm = await llmCommentAnalysis(sanitized);
  const merged: CommentAnalysis = {
    debateScore: clamp01(Math.max(llm?.debateScore ?? 0, fallback.debateScore)),
    questionScore: clamp01(Math.max(llm?.questionScore ?? 0, fallback.questionScore)),
    emotionScore: clamp01(Math.max(llm?.emotionScore ?? 0, fallback.emotionScore)),
    toxicityScore: clamp01(Math.max(llm?.toxicityScore ?? 0, fallback.toxicityScore)),
    spamScore: clamp01(Math.max(llm?.spamScore ?? 0, fallback.spamScore)),
    qualityScore: clamp01(llm?.qualityScore ?? fallback.qualityScore)
  };

  await setCache(cacheKey, merged, COMMENT_ANALYSIS_CACHE_TTL_SECONDS);

  return merged;
}

export async function detectDebate(text: string): Promise<number> {
  return (await analyzeComment(text)).debateScore;
}

export async function detectQuestion(text: string): Promise<number> {
  return (await analyzeComment(text)).questionScore;
}

export async function detectEmotion(text: string): Promise<number> {
  return (await analyzeComment(text)).emotionScore;
}

export async function detectToxicity(text: string): Promise<number> {
  return (await analyzeComment(text)).toxicityScore;
}

export async function detectSpam(text: string): Promise<number> {
  return (await analyzeComment(text)).spamScore;
}
