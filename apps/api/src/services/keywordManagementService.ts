/**
 * Dynamic keyword management service
 * Stores keywords in Redis for runtime modification without restart
 */
import { createRedisClient } from "../db/redis.js";
import { logger } from "../config/logger.js";
import { randomUUID } from "node:crypto";

const REDIS_KEY = "maat:keywords:dynamic";
const DEFAULT_KEYWORDS_KEY = "maat:keywords:defaults";

export interface DynamicKeyword {
  id: string;
  keyword: string;
  interests: string[];
  language: "fr" | "en";
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeywordInput {
  keyword: string;
  interests: string[];
  language: "fr" | "en";
}

export interface UpdateKeywordInput {
  keyword?: string;
  interests?: string[];
  language?: "fr" | "en";
  enabled?: boolean;
}

function getRedis() {
  return createRedisClient();
}

export async function getAllDynamicKeywords(): Promise<DynamicKeyword[]> {
  const redis = getRedis();
  try {
    const data = await redis.get(REDIS_KEY);
    if (!data) {
      // Initialize with default keywords if empty
      return await resetToDefaultKeywords();
    }
    return JSON.parse(data);
  } catch (err) {
    logger.error({ err }, "Failed to get dynamic keywords");
    return [];
  }
}

export async function getEnabledKeywords(): Promise<DynamicKeyword[]> {
  const all = await getAllDynamicKeywords();
  return all.filter(k => k.enabled);
}

export async function getKeywordById(id: string): Promise<DynamicKeyword | null> {
  const keywords = await getAllDynamicKeywords();
  return keywords.find(k => k.id === id) || null;
}

export async function createKeyword(input: CreateKeywordInput): Promise<DynamicKeyword> {
  const redis = getRedis();
  const keywords = await getAllDynamicKeywords();

  const newKeyword: DynamicKeyword = {
    id: randomUUID(),
    keyword: input.keyword.trim(),
    interests: input.interests.map(i => i.trim().toLowerCase()),
    language: input.language,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  keywords.push(newKeyword);
  await redis.set(REDIS_KEY, JSON.stringify(keywords));

  logger.info({ keywordId: newKeyword.id, keyword: newKeyword.keyword }, "Dynamic keyword created");
  return newKeyword;
}

export async function updateKeyword(id: string, input: UpdateKeywordInput): Promise<DynamicKeyword | null> {
  const redis = getRedis();
  const keywords = await getAllDynamicKeywords();

  const index = keywords.findIndex(k => k.id === id);
  if (index === -1) return null;

  const updated = {
    ...keywords[index],
    ...(input.keyword && { keyword: input.keyword.trim() }),
    ...(input.interests && { interests: input.interests.map(i => i.trim().toLowerCase()) }),
    ...(input.language && { language: input.language }),
    ...(input.enabled !== undefined && { enabled: input.enabled }),
    updatedAt: new Date().toISOString()
  };

  keywords[index] = updated;
  await redis.set(REDIS_KEY, JSON.stringify(keywords));

  logger.info({ keywordId: id }, "Dynamic keyword updated");
  return updated;
}

export async function deleteKeyword(id: string): Promise<boolean> {
  const redis = getRedis();
  const keywords = await getAllDynamicKeywords();

  const filtered = keywords.filter(k => k.id !== id);
  if (filtered.length === keywords.length) return false;

  await redis.set(REDIS_KEY, JSON.stringify(filtered));
  logger.info({ keywordId: id }, "Dynamic keyword deleted");
  return true;
}

export async function resetToDefaultKeywords(): Promise<DynamicKeyword[]> {
  const redis = getRedis();

  const defaultKeywords: Omit<DynamicKeyword, "id" | "createdAt" | "updatedAt">[] = [
    // Kemet / Ancient Egypt
    { keyword: "kemet ancient egypt spirituality", interests: ["kemet", "spirituality"], language: "en", enabled: true },
    { keyword: "spiritualité kemet égypte ancienne", interests: ["kemet", "spirituality"], language: "fr", enabled: true },
    { keyword: "kemetic spirituality meditation", interests: ["kemet", "spirituality"], language: "en", enabled: true },
    { keyword: "méditation kemetique prières égyptiennes", interests: ["kemet", "spirituality"], language: "fr", enabled: true },
    { keyword: "royaume kemet pharaons noirs", interests: ["kemet", "history"], language: "fr", enabled: true },

    // African Philosophy
    { keyword: "african philosophy wisdom ubuntu", interests: ["african-philosophy"], language: "en", enabled: true },
    { keyword: "philosophie africaine sagesse", interests: ["african-philosophy"], language: "fr", enabled: true },
    { keyword: "ubuntu philosophy african wisdom", interests: ["african-philosophy"], language: "en", enabled: true },
    { keyword: "sagesse africaine proverbes", interests: ["african-philosophy", "culture"], language: "fr", enabled: true },
    { keyword: "pensée africaine cheikh anta diop", interests: ["african-philosophy", "history"], language: "fr", enabled: true },

    // African History
    { keyword: "african history documentary", interests: ["history"], language: "en", enabled: true },
    { keyword: "histoire africaine documentaire", interests: ["history"], language: "fr", enabled: true },
    { keyword: "black history africa civilization", interests: ["history"], language: "en", enabled: true },
    { keyword: "histoire noire afrique civilisation", interests: ["history"], language: "fr", enabled: true },
    { keyword: "empires africains royaumes oubliés", interests: ["history"], language: "fr", enabled: true },
    { keyword: "géographie sacrée afrique", interests: ["history", "spirituality"], language: "fr", enabled: true },
    { keyword: "résistance africaine colonisation", interests: ["history", "politics"], language: "fr", enabled: true },
    { keyword: "histoire royaume kongo", interests: ["history"], language: "fr", enabled: true },
    { keyword: "histoire empire mali soundiata keita", interests: ["history"], language: "fr", enabled: true },

    // Culture
    { keyword: "african culture traditions", interests: ["culture"], language: "en", enabled: true },
    { keyword: "culture africaine traditions", interests: ["culture"], language: "fr", enabled: true },
    { keyword: "black culture afrobeat music", interests: ["culture"], language: "en", enabled: true },
    { keyword: "musique africaine traditionnelle", interests: ["culture"], language: "fr", enabled: true },
    { keyword: "danse africaine rituels", interests: ["culture", "spirituality"], language: "fr", enabled: true },
    { keyword: "mode africaine wax pagne", interests: ["culture"], language: "fr", enabled: true },
    { keyword: "art africain sculptures masques", interests: ["culture", "art"], language: "fr", enabled: true },
    { keyword: "littérature africaine auteurs", interests: ["culture", "education"], language: "fr", enabled: true },

    // Education
    { keyword: "african education knowledge", interests: ["education"], language: "en", enabled: true },
    { keyword: "education afrique savoirs", interests: ["education"], language: "fr", enabled: true },
    { keyword: "enseignement africain traditionnel griots", interests: ["education", "culture"], language: "fr", enabled: true },

    // Debates
    { keyword: "african debate discussion politics", interests: ["debate", "politics"], language: "en", enabled: true },
    { keyword: "débat africain analyse politique", interests: ["debate", "politics"], language: "fr", enabled: true },
    { keyword: "actualité afrique francophone", interests: ["debate", "politics"], language: "fr", enabled: true },
    { keyword: "diaspora africaine retour aux sources", interests: ["culture", "politics"], language: "fr", enabled: true },

    // Spirituality
    { keyword: "african spirituality ancestors", interests: ["spirituality"], language: "en", enabled: true },
    { keyword: "spiritualité africaine ancêtres", interests: ["spirituality"], language: "fr", enabled: true },
    { keyword: "african diaspora spirituality", interests: ["spirituality", "culture"], language: "en", enabled: true },
    { keyword: "vaudou vodou spiritualité bénin", interests: ["spirituality", "culture"], language: "fr", enabled: true },
    { keyword: "sagesse dogons mali astronomie", interests: ["spirituality", "science", "history"], language: "fr", enabled: true },
    { keyword: "initiation africaine mystères", interests: ["spirituality"], language: "fr", enabled: true },

    // Science
    { keyword: "african science discoveries inventions", interests: ["science"], language: "en", enabled: true },
    { keyword: "science africaine découvertes", interests: ["science"], language: "fr", enabled: true },
    { keyword: "mathématiques africaines ethiopie", interests: ["science", "history"], language: "fr", enabled: true },
    { keyword: "médecine traditionnelle africaine", interests: ["science", "health"], language: "fr", enabled: true },

    // Wellness/Health
    { keyword: "african wellness health healing", interests: ["health"], language: "en", enabled: true },
    { keyword: "bien-être africain santé naturelle", interests: ["health"], language: "fr", enabled: true },
    { keyword: "plantes médicinales afrique guérison", interests: ["health", "science"], language: "fr", enabled: true },

    // Afrocentric
    { keyword: "afrocentric history black consciousness", interests: ["history", "culture"], language: "en", enabled: true },
    { keyword: "panafricanisme histoire", interests: ["history", "politics"], language: "fr", enabled: true },
    { keyword: "négritude césaire senghor", interests: ["culture", "history"], language: "fr", enabled: true },
    { keyword: "conscientisation africaine mentalité", interests: ["culture", "education"], language: "fr", enabled: true },
  ];

  const withIds: DynamicKeyword[] = defaultKeywords.map(k => ({
    ...k,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  await redis.set(REDIS_KEY, JSON.stringify(withIds));
  await redis.set(DEFAULT_KEYWORDS_KEY, JSON.stringify(withIds));

  logger.info({ count: withIds.length }, "Reset to default keywords");
  return withIds;
}

export async function bulkImportKeywords(keywords: CreateKeywordInput[]): Promise<number> {
  const existing = await getAllDynamicKeywords();
  const newKeywords: DynamicKeyword[] = keywords.map(k => ({
    id: randomUUID(),
    keyword: k.keyword.trim(),
    interests: k.interests.map(i => i.trim().toLowerCase()),
    language: k.language,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  const combined = [...existing, ...newKeywords];
  const redis = getRedis();
  await redis.set(REDIS_KEY, JSON.stringify(combined));

  logger.info({ imported: newKeywords.length, total: combined.length }, "Bulk import keywords");
  return newKeywords.length;
}

export async function bulkToggleKeywords(ids: string[], enabled: boolean): Promise<number> {
  const keywords = await getAllDynamicKeywords();
  let changed = 0;

  for (const k of keywords) {
    if (ids.includes(k.id) && k.enabled !== enabled) {
      k.enabled = enabled;
      k.updatedAt = new Date().toISOString();
      changed++;
    }
  }

  if (changed > 0) {
    const redis = getRedis();
    await redis.set(REDIS_KEY, JSON.stringify(keywords));
  }

  return changed;
}

export async function getKeywordStats(): Promise<{
  total: number;
  enabled: number;
  disabled: number;
  byLanguage: Record<string, number>;
  byInterest: Record<string, number>;
}> {
  const keywords = await getAllDynamicKeywords();

  const byLanguage: Record<string, number> = {};
  const byInterest: Record<string, number> = {};

  for (const k of keywords) {
    byLanguage[k.language] = (byLanguage[k.language] || 0) + 1;
    for (const interest of k.interests) {
      byInterest[interest] = (byInterest[interest] || 0) + 1;
    }
  }

  return {
    total: keywords.length,
    enabled: keywords.filter(k => k.enabled).length,
    disabled: keywords.filter(k => !k.enabled).length,
    byLanguage,
    byInterest
  };
}
