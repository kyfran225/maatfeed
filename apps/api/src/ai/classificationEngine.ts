import type { ContentBucket } from "@maat/shared";
import { logger } from "../config/logger.js";
import { generateWithAIProvider, type ProviderName } from "../services/aiRouterService.js";

export type ClassificationMeta = {
  providerUsed: ProviderName | "heuristic";
  usedFallback: boolean;
  providerErrors: string[];
};

type ClassificationScores = {
  bucket: ContentBucket;
  debateScore: number;
  emotionScore: number;
  educationScore: number;
  confidence: number;
};

export type ClassificationResult = ClassificationScores & {
  meta: ClassificationMeta;
};

type ProviderClassificationPayload = Partial<{
  bucket: unknown;
  confidence: unknown;
  debateScore: unknown;
  emotionScore: unknown;
  educationScore: unknown;
}>;

const BUCKET_LABELS: readonly ContentBucket[] = ["viral", "educational", "deep"];
const CLASSIFICATION_PROVIDER_ORDER: readonly ProviderName[] = ["groq", "openrouter", "gemini"];

const EDUCATION_KEYWORDS = [
  "explain",
  "explained",
  "learn",
  "lesson",
  "history",
  "science",
  "study",
  "analysis",
  "documentary",
  "education",
  "educational",
  "theory",
  "research",
  "guide",
  "tutorial",
  "philosophy",
  "archive",
  "facts",
  "cours",
  "explication",
  "histoire",
  "science",
  "analyse",
  "theorie",
  "recherche",
  "guide",
  "tutoriel",
  "philosophie",
  "cours",
  "documentaire"
];

const DEBATE_KEYWORDS = [
  "debate",
  "versus",
  "vs",
  "argument",
  "controversy",
  "controversial",
  "disagree",
  "reaction",
  "opinion",
  "responds",
  "critique",
  "clash",
  "discussion",
  "debunk",
  "contre",
  "debat",
  "debate",
  "opinion",
  "reaction",
  "critique",
  "polemique",
  "controverse",
  "discussion"
];

const EMOTION_KEYWORDS = [
  "shocking",
  "insane",
  "crazy",
  "emotional",
  "fear",
  "angry",
  "anger",
  "love",
  "hate",
  "amazing",
  "heartbreaking",
  "powerful",
  "outrage",
  "urgent",
  "incroyable",
  "choquant",
  "emouvant",
  "colere",
  "haine",
  "amour",
  "peur",
  "urgent",
  "bouleversant",
  "puissant"
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeScore(value: unknown, fallback: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  const normalized = numeric <= 1 ? numeric * 100 : numeric;
  return Math.round(clamp(normalized, 0, 100));
}

function normalizeConfidence(value: unknown, fallback: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  const normalized = numeric > 1 ? numeric / 100 : numeric;
  return clamp(normalized, 0, 1);
}

function scoreKeywords(text: string, keywords: string[], maxHits: number): number {
  const hits = keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
  return Math.round(clamp((hits / maxHits) * 100, 0, 100));
}

function deriveBucketFromScores(input: {
  educationScore: number;
  debateScore: number;
  emotionScore: number;
  textLength: number;
}): ContentBucket {
  if (input.emotionScore >= 88 && input.emotionScore >= input.educationScore + 10 && input.debateScore < 75) {
    return "viral";
  }

  if (input.debateScore >= 78 && input.debateScore + 5 >= input.educationScore) {
    return "deep";
  }

  if (input.educationScore >= 80 && input.debateScore <= 65 && input.emotionScore <= 75) {
    return "educational";
  }

  if (input.emotionScore >= 72 && input.educationScore < 55) {
    return "viral";
  }

  if (input.debateScore >= 70 || (input.educationScore >= 55 && input.textLength > 650)) {
    return "deep";
  }

  if (input.educationScore >= input.emotionScore && input.educationScore >= input.debateScore) {
    return "educational";
  }

  if (input.emotionScore >= input.debateScore) {
    return "viral";
  }

  return "deep";
}

function resolveBucket(
  rawBucket: ContentBucket | null,
  scores: { educationScore: number; debateScore: number; emotionScore: number; textLength: number }
): ContentBucket {
  const derivedBucket = deriveBucketFromScores(scores);
  if (!rawBucket) {
    return derivedBucket;
  }

  if (rawBucket === derivedBucket) {
    return rawBucket;
  }

  if (rawBucket === "educational" && derivedBucket === "deep" && scores.debateScore >= 78 && scores.debateScore + 5 >= scores.educationScore) {
    return "deep";
  }

  if (rawBucket === "educational" && derivedBucket === "viral" && scores.emotionScore >= 88 && scores.emotionScore >= scores.educationScore + 10) {
    return "viral";
  }

  if (rawBucket === "viral" && derivedBucket === "deep" && scores.debateScore >= 80 && scores.textLength > 120) {
    return "deep";
  }

  return rawBucket;
}

function buildHeuristicClassification(text: string): ClassificationResult {
  const normalized = text.toLowerCase();
  const educationScore = Math.max(
    scoreKeywords(normalized, EDUCATION_KEYWORDS, 6),
    normalized.length > 700 ? 62 : 0
  );
  const debateScore = Math.max(
    scoreKeywords(normalized, DEBATE_KEYWORDS, 5),
    normalized.includes("?") ? 30 : 0
  );
  const emotionScore = scoreKeywords(normalized, EMOTION_KEYWORDS, 5);

  const bucket = deriveBucketFromScores({
    educationScore,
    debateScore,
    emotionScore,
    textLength: normalized.length
  });

  const confidenceBase = Math.max(educationScore, debateScore, emotionScore);
  const confidence = clamp(0.4 + confidenceBase / 200, 0.4, 0.92);

  return {
    bucket,
    debateScore,
    emotionScore,
    educationScore,
    confidence,
    meta: {
      providerUsed: "heuristic",
      usedFallback: true,
      providerErrors: []
    }
  };
}

function tryParseJsonObject(raw: string): ProviderClassificationPayload | null {
  const candidates = [
    raw.trim(),
    raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "")
  ];

  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    candidates.push(objectMatch[0]);
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as ProviderClassificationPayload;
    } catch {
      continue;
    }
  }

  return null;
}

function normalizeProviderClassification(
  payload: ProviderClassificationPayload | null,
  fallback: ClassificationResult,
  textLength: number
): ClassificationScores | null {
  if (!payload) {
    return null;
  }

  const educationScore = normalizeScore(payload.educationScore, fallback.educationScore);
  const debateScore = normalizeScore(payload.debateScore, fallback.debateScore);
  const emotionScore = normalizeScore(payload.emotionScore, fallback.emotionScore);
  const confidence = normalizeConfidence(payload.confidence, fallback.confidence);

  const rawBucket = typeof payload.bucket === "string" ? payload.bucket.toLowerCase().trim() : "";
  const parsedBucket = BUCKET_LABELS.includes(rawBucket as ContentBucket) ? (rawBucket as ContentBucket) : null;
  const bucket = resolveBucket(parsedBucket, { educationScore, debateScore, emotionScore, textLength });

  const hasExplicitBucket = BUCKET_LABELS.includes(rawBucket as ContentBucket);
  const hasNumericScores =
    Number.isFinite(typeof payload.educationScore === "number" ? payload.educationScore : Number(payload.educationScore)) &&
    Number.isFinite(typeof payload.debateScore === "number" ? payload.debateScore : Number(payload.debateScore)) &&
    Number.isFinite(typeof payload.emotionScore === "number" ? payload.emotionScore : Number(payload.emotionScore));
  const hasConfidence = Number.isFinite(typeof payload.confidence === "number" ? payload.confidence : Number(payload.confidence));

  if (!hasExplicitBucket && !hasNumericScores && !hasConfidence) {
    return null;
  }

  return {
    bucket,
    debateScore,
    emotionScore,
    educationScore,
    confidence
  };
}

async function classifyWithProviders(text: string, fallback: ClassificationResult): Promise<ClassificationResult> {
  const errors: string[] = [];
  const systemPrompt = [
    "You classify content for a media feed.",
    "Return only a valid JSON object.",
    'Schema: {"bucket":"viral|educational|deep","confidence":0..1,"educationScore":0..100,"debateScore":0..100,"emotionScore":0..100}.',
    "Use semantic meaning, not just keywords.",
    "Scores must be integers.",
    "Bucket definitions:",
    "viral = highly emotional, sensational, reactive, attention-first.",
    "educational = explanatory, teaching-first, informative, not primarily a debate.",
    "deep = debate-heavy, analytical, ideological, or long-form reasoning even if educational.",
    "If debateScore is 75 or above and close to or above educationScore, prefer deep over educational."
  ].join(" ");
  const userPrompt = JSON.stringify({
    task: "classify_content",
    text
  });

  for (const provider of CLASSIFICATION_PROVIDER_ORDER) {
    try {
      const raw = await generateWithAIProvider(provider, {
        providers: [provider],
        jsonMode: true,
        temperature: 0.1,
        maxTokens: 220,
        systemPrompt,
        userPrompt
      });

      const parsed = tryParseJsonObject(raw);
      const normalized = normalizeProviderClassification(parsed, fallback, text.length);

      if (!normalized) {
        throw new Error("Provider returned unusable classification JSON.");
      }

      const result: ClassificationResult = {
        ...normalized,
        meta: {
          providerUsed: provider,
          usedFallback: false,
          providerErrors: [...errors]
        }
      };

      logger.info(
        {
          provider,
          usedFallback: false,
          previousProviderErrors: errors.length,
          bucket: result.bucket,
          confidence: result.confidence
        },
        "Content classification completed"
      );

      return result;
    } catch (error) {
      errors.push(`${provider}:${error instanceof Error ? error.message : String(error)}`);
      logger.warn({ provider, err: error }, "Classification provider failed, trying next provider");
    }
  }

  logger.warn({ errors }, "All LLM classification providers failed, using heuristic fallback");
  return {
    ...fallback,
    meta: {
      providerUsed: "heuristic",
      usedFallback: true,
      providerErrors: errors
    }
  };
}

export async function classifyContent(input: { title: string; description: string; transcript?: string; tags?: string[] }) {
  const text = `${input.title} ${input.description} ${input.transcript ?? ""} ${(input.tags ?? []).join(" ")}`
    .toLowerCase()
    .trim();

  const fallback = buildHeuristicClassification(text);
  return classifyWithProviders(text, fallback);
}
