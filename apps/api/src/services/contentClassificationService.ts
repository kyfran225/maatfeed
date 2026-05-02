import { createHash } from "node:crypto";
import { logger } from "../config/logger.js";
import { generateWithAIRouter } from "./aiRouterService.js";
import { getCache, setCache } from "./cacheService.js";

export interface ContentClassification {
  topics: {
    kemet: number;
    spirituality: number;
    religion_christian: number;
    religion_islam: number;
    religion_judaism: number;
    history: number;
    science: number;
    philosophy: number;
    debate: number;
    question: number;
  };
  primaryTopic: string;
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

const CLASSIFICATION_CACHE_TTL_SECONDS = 60 * 30;
const CLASSIFICATION_PROVIDER_ORDER = ["groq", "openrouter", "gemini"] as const;
const TOPIC_KEYS = [
  "kemet",
  "spirituality",
  "religion_christian",
  "religion_islam",
  "religion_judaism",
  "history",
  "science",
  "philosophy",
  "debate",
  "question"
] as const;
const EMOTION_KEYS = ["joy", "anger", "fear", "sadness", "surprise"] as const;
const SENTIMENT_KEYS = ["positive", "negative", "neutral"] as const;

const TOPIC_KEYWORDS = {
  kemet: ["kemet", "égypte ancienne", "pharaon", "pyramide", "hiéroglyphe", "anubis", "osiris", "isis", "ra", "horus"],
  spirituality: ["spirituel", "spiritualité", "spirituel", "spirituelle", "méditation", "conscience", "âme", "énergie", "mystique", "éveil", "transcendance", "héritage spirituel"],
  religion_christian: ["jésus", "christ", "chrétien", "chrétienne", "chrétiennes", "christianisme", "dieu", "église", "bible", "prière", "sacrement", "messie"],
  religion_islam: ["islam", "islamique", "islamiques", "allah", "mahomet", "coran", "musulman", "musulmane", "musulmanes", "ramadan", "mosquée", "prière", "prophète"],
  religion_judaism: ["judaïsme", "juif", "juive", "juives", "torah", "dieu", "synagogue", "rabbin", "hébreu", "hébraïque", "israël", "mosaïque", "prophète"],
  history: ["histoire", "historique", "historiques", "passé", "ancien", "ancienne", "anciennes", "civilisation", "empire", "guerre", "révolution", "dynastie", "source", "sources", "preuve", "preuves"],
  science: ["science", "scientifique", "recherche", "expérience", "théorie", "physique", "biologie", "chimie", "mathématiques"],
  philosophy: ["philosophie", "philosophe", "pensée", "raison", "logique", "éthique", "métaphysique", "existentialisme", "socratique", "idéologie", "interprétation"],
  debate: ["débat", "discussion", "argument", "contre", "pour", "avis", "opinion", "controversé", "polémique", "différence", "distinguer", "comparaison", "rupture", "continuité"],
  question: ["pourquoi", "comment", "quoi", "qui", "où", "quand", "quel", "quelle", "quels", "quelles", "?", "expliquer", "comprendre", "savoir"]
};

const EMOTION_KEYWORDS = {
  joy: ["joie", "bonheur", "heureux", "content", "ravi", "excellent", "magnifique", "superbe", "génial"],
  anger: ["colère", "furieux", "énervé", "rage", "fâché", "irrité", "agacé", "exaspéré", "outrage"],
  fear: ["peur", "crainte", "angoisse", "anxiété", "inquiétude", "terreur", "effroi", "appréhension", "stress"],
  sadness: ["tristesse", "chagrin", "déprimé", "malheureux", "désolé", "regret", "douleur", "souffrance", "perte"],
  surprise: ["surprise", "étonné", "stupéfait", "choqué", "incroyable", "imprévu", "soudain", "inattendu", "wow"]
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function createEmptyTopics(): ContentClassification["topics"] {
  return {
    kemet: 0,
    spirituality: 0,
    religion_christian: 0,
    religion_islam: 0,
    religion_judaism: 0,
    history: 0,
    science: 0,
    philosophy: 0,
    debate: 0,
    question: 0
  };
}

function createEmptyEmotions(): ContentClassification["emotions"] {
  return {
    joy: 0,
    anger: 0,
    fear: 0,
    sadness: 0,
    surprise: 0
  };
}

function createEmptySentiment(): ContentClassification["sentiment"] {
  return {
    positive: 0.5,
    negative: 0.5,
    neutral: 0.5
  };
}

function getPrimaryTopic(topics: ContentClassification["topics"]): { topic: string; score: number } {
  return Object.entries(topics).reduce(
    (max, [topic, score]) => (score > max.score ? { topic, score } : max),
    { topic: "", score: 0 }
  );
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

function coerceRecord<T extends readonly string[]>(
  value: unknown,
  keys: T,
  fallback: Record<T[number], number>
): Record<T[number], number> {
  const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const result: Record<T[number], number> = { ...fallback };

  for (const key of keys) {
    if (key in source) {
      result[key as T[number]] = clamp01(Number(source[key]));
    }
  }

  return result;
}

function keywordBasedClassification(text: string): Partial<ContentClassification> {
  const normalized = text.toLowerCase();
  const topics = createEmptyTopics();

  Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    const matches = keywords.filter((keyword) => normalized.includes(keyword)).length;
    topics[topic as keyof typeof topics] = Math.min(1, (matches / keywords.length) * 2);
  });

  const containsQuestionMark = normalized.includes("?");
  const containsInterrogativeLead = /\b(pourquoi|comment|quel|quelle|quels|quelles|qui|où|quand|en quoi|peut-on|faut-il|est-ce que)\b/.test(normalized);
  const containsComparisonLexicon = /\b(différence|différences|distinguer|compar|rupture|continuité|opposition|héritage|lecture|lectures|idéologie)\b/.test(normalized);
  const containsHistoricalEvidenceLexicon = /\b(source|sources|preuve|preuves|historique|historiques|fiable|fiables)\b/.test(normalized);
  const comparativeReligionCount =
    [topics.religion_christian, topics.religion_islam, topics.religion_judaism].filter((score) => score > 0).length;

  if (containsQuestionMark || containsInterrogativeLead) {
    topics.question = Math.max(topics.question, containsHistoricalEvidenceLexicon ? 0.85 : 0.7);
  }

  if (containsComparisonLexicon) {
    topics.debate = Math.max(topics.debate, comparativeReligionCount > 0 ? 0.7 : 0.55);
  }

  if (containsHistoricalEvidenceLexicon) {
    topics.history = Math.max(topics.history, 0.6);
  }

  if (comparativeReligionCount >= 2) {
    topics.debate = Math.max(topics.debate, 0.75);
    topics.philosophy = Math.max(topics.philosophy, 0.45);
  }

  const emotions = createEmptyEmotions();

  Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
    const matches = keywords.filter((keyword) => normalized.includes(keyword)).length;
    emotions[emotion as keyof typeof emotions] = Math.min(1, (matches / keywords.length) * 3);
  });

  const positiveWords = ["bon", "bien", "excellent", "super", "génial", "amour", "paix", "harmonie", "beau"];
  const negativeWords = ["mal", "mauvais", "terrible", "horrible", "guerre", "haine", "violence", "mort", "destruction"];
  const positiveCount = positiveWords.filter((word) => normalized.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => normalized.includes(word)).length;
  const totalSentimentWords = positiveCount + negativeCount;
  const primaryTopicEntry = getPrimaryTopic(topics);

  return {
    topics,
    primaryTopic: primaryTopicEntry.topic,
    confidence: primaryTopicEntry.score,
    emotions,
    sentiment: {
      positive: totalSentimentWords > 0 ? positiveCount / totalSentimentWords : 0.5,
      negative: totalSentimentWords > 0 ? negativeCount / totalSentimentWords : 0.5,
      neutral: Math.max(0, 1 - (positiveCount + negativeCount) / Math.max(1, normalized.split(/\s+/).length * 0.1))
    }
  };
}

async function llmClassification(text: string): Promise<Partial<ContentClassification> | null> {
  try {
    const routed = await generateWithAIRouter({
      providers: [...CLASSIFICATION_PROVIDER_ORDER],
      jsonMode: true,
      temperature: 0.1,
      maxTokens: 500,
      systemPrompt:
        "You classify a community debate comment. Return strict JSON only. Use scores from 0 to 1. Do not add markdown, prose, or extra keys.",
      userPrompt: [
        "Schema:",
        '{"topics":{"kemet":0,"spirituality":0,"religion_christian":0,"religion_islam":0,"religion_judaism":0,"history":0,"science":0,"philosophy":0,"debate":0,"question":0},"primaryTopic":"question","confidence":0.8,"emotions":{"joy":0,"anger":0,"fear":0,"sadness":0,"surprise":0},"sentiment":{"positive":0.2,"negative":0.1,"neutral":0.7}}',
        "Rules:",
        "- Keep primaryTopic to one of the topic keys.",
        "- confidence is the confidence for primaryTopic.",
        "- sentiment values should roughly sum to 1.",
        `Text: """${text}"""`
      ].join("\n")
    });

    const parsed = parseJSONObject(routed.text);
    if (!parsed) {
      throw new Error("Provider returned invalid JSON.");
    }

    const topics = coerceRecord(parsed.topics, TOPIC_KEYS, createEmptyTopics());
    const emotions = coerceRecord(parsed.emotions, EMOTION_KEYS, createEmptyEmotions());
    const sentiment = coerceRecord(parsed.sentiment, SENTIMENT_KEYS, createEmptySentiment());
    const primaryTopicCandidate = typeof parsed.primaryTopic === "string" ? parsed.primaryTopic.trim() : "";
    const primaryTopic = TOPIC_KEYS.includes(primaryTopicCandidate as (typeof TOPIC_KEYS)[number])
      ? primaryTopicCandidate
      : getPrimaryTopic(topics).topic;
    const confidence = clamp01(Number(parsed.confidence ?? topics[primaryTopic as keyof typeof topics] ?? 0));

    logger.info({ provider: routed.provider, primaryTopic, confidence }, "LLM content classification completed");

    return {
      topics,
      primaryTopic,
      confidence,
      emotions,
      sentiment
    };
  } catch (error) {
    logger.warn({ err: error }, "LLM content classification failed, falling back to keyword analysis");
    return null;
  }
}

export async function classifyContent(text: string): Promise<ContentClassification> {
  const normalized = text.trim().toLowerCase();
  const cacheKey = `content:classification:${createHash("sha1").update(normalized).digest("hex")}`;
  const cached = await getCache<ContentClassification>(cacheKey);

  if (cached) {
    return cached;
  }

  const keywordResult = keywordBasedClassification(normalized);
  const llmResult = await llmClassification(normalized);
  const keywordTopics = keywordResult.topics ?? createEmptyTopics();
  const llmTopics = llmResult?.topics ?? createEmptyTopics();
  const mergedTopics = createEmptyTopics();

  for (const key of TOPIC_KEYS) {
    mergedTopics[key] = Math.max(llmTopics[key], keywordTopics[key]);
  }

  const keywordEmotions = keywordResult.emotions ?? createEmptyEmotions();
  const llmEmotions = llmResult?.emotions ?? createEmptyEmotions();
  const mergedEmotions = createEmptyEmotions();

  for (const key of EMOTION_KEYS) {
    mergedEmotions[key] = Math.max(llmEmotions[key], keywordEmotions[key]);
  }

  const classification: ContentClassification = {
    topics: mergedTopics,
    primaryTopic:
      llmResult?.primaryTopic && llmResult.topics?.[llmResult.primaryTopic as keyof typeof llmResult.topics] !== undefined
        ? llmResult.primaryTopic
        : getPrimaryTopic(mergedTopics).topic,
    confidence: clamp01(
      Math.max(
        Number(llmResult?.confidence ?? 0),
        Number(keywordResult.confidence ?? 0),
        Number(getPrimaryTopic(mergedTopics).score)
      )
    ),
    emotions: mergedEmotions,
    sentiment: {
      positive: clamp01(llmResult?.sentiment?.positive ?? keywordResult.sentiment?.positive ?? 0.5),
      negative: clamp01(llmResult?.sentiment?.negative ?? keywordResult.sentiment?.negative ?? 0.5),
      neutral: clamp01(llmResult?.sentiment?.neutral ?? keywordResult.sentiment?.neutral ?? 0.5)
    }
  };

  await setCache(cacheKey, classification, CLASSIFICATION_CACHE_TTL_SECONDS);

  return classification;
}

export async function shouldAIIntervene(
  text: string,
  recentCommentCount: number = 0,
  lastAIResponseTime: number = 0
): Promise<{ shouldIntervene: boolean; reason: string; priority: number }> {
  const classification = await classifyContent(text);
  const now = Date.now();
  const timeSinceLastAI = now - lastAIResponseTime;
  const minTimeBetweenAI = 5 * 60 * 1000;
  let priority = 0;
  let reason = "";

  if (classification.topics.question > 0.45) {
    priority += 0.4;
    reason += "Question directe détectée. ";
  }

  if (classification.topics.debate > 0.45) {
    priority += 0.3;
    reason += "Débat intense détecté. ";
  }

  if (classification.emotions.anger > 0.6 || classification.emotions.fear > 0.6) {
    priority += 0.3;
    reason += "Émotion forte détectée. ";
  }

  if (
    classification.confidence > 0.7 &&
    classification.primaryTopic !== "" &&
    classification.primaryTopic !== "question" &&
    classification.primaryTopic !== "debate"
  ) {
    priority += 0.2;
    reason += `Sujet spécialisé: ${classification.primaryTopic}. `;
  }

  if (classification.topics.kemet > 0.5 || classification.topics.spirituality > 0.5) {
    priority += 0.2;
    reason += "Sujet de spécialité détecté. ";
  }

  const specializedSignals = [
    classification.topics.kemet,
    classification.topics.spirituality,
    classification.topics.history,
    classification.topics.philosophy,
    classification.topics.religion_christian,
    classification.topics.religion_islam,
    classification.topics.religion_judaism
  ].filter((score) => score > 0.4).length;

  if (classification.topics.question > 0.45 && specializedSignals >= 2) {
    priority += 0.25;
    reason += "Question comparative spécialisée détectée. ";
  }

  if (recentCommentCount < 5) {
    priority += 0.1;
    reason += "Peu de commentaires récents. ";
  }

  if (timeSinceLastAI < minTimeBetweenAI) {
    priority *= 0.3;
    reason += "IA a répondu récemment. ";
  }

  const randomFactor = Math.random();
  const threshold = 0.25;
  const shouldIntervene = priority > threshold && randomFactor > 0.05;

  logger.info(
    {
      text: text.substring(0, 100),
      priority,
      threshold,
      randomFactor,
      shouldIntervene,
      reason: reason.trim(),
      classification: {
        question: classification.topics.question,
        debate: classification.topics.debate,
        kemet: classification.topics.kemet,
        spirituality: classification.topics.spirituality
      }
    },
    "AI Intervention Decision"
  );

  return {
    shouldIntervene,
    reason: reason.trim(),
    priority
  };
}
