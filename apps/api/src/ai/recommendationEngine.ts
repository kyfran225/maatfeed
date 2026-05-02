import { computePersonalizedScore } from "@maat/shared";
import { computeDiversityBoost } from "../utils/diversity.js";
import { getActiveConfig } from "../repositories/rankingRepository.js";
import { getKeywordsForInterests, ThematicKeyword } from "../services/keywordRotationService.js";

interface FeedItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: "video" | "audio";
  creator: {
    name: string;
    handle: string;
    avatar?: string;
  };
  sourceProvider: "youtube" | "tiktok";
  bucket: "viral" | "educational" | "deep";
  scores: {
    likes: number;
    comments: number;
    views: number;
    finalScore: number;
  };
  createdAt: string;
  transcript?: string;
  summary?: string;
  tags: string[];
}

interface RecommendationConfig {
  contentMix: {
    viral: number;
    educational: number;
    deep: number;
  };
  scoreWeights: {
    userInterestMatch: number;
    diversityBoost: number;
    recencyBoost: number;
  };
  recencyDecay: number;
}

function calculateRecencyBoost(createdAt: string, config: RecommendationConfig): number {
  const now = Date.now();
  const contentAge = now - new Date(createdAt).getTime();
  const daysSinceCreation = contentAge / (1000 * 60 * 60 * 24);

  // Exponential decay based on recency config
  return Math.exp(-daysSinceCreation * config.recencyDecay) * 50;
}

function calculateInterestMatch(
  item: FeedItem,
  interests: Record<string, number>,
  thematicKeywords: ThematicKeyword[]
): number {
  let matchScore = 0;
  const itemText = `${item.title} ${item.description} ${item.summary ?? ""} ${item.transcript ?? ""}`.toLowerCase();

  // Direct tag matches
  for (const tag of item.tags) {
    matchScore += interests[tag] ?? 0;
  }

  // Thematic keyword matches
  for (const tk of thematicKeywords) {
    const interestValue = interests[tk.interests[0]] ?? 0;
    if (interestValue > 0) {
      const keywordParts = tk.keyword.toLowerCase().split(/\s+/);
      for (const part of keywordParts) {
        if (part.length > 3 && itemText.includes(part)) {
          matchScore += interestValue * 0.5;
        }
      }
    }
  }

  // Bucket-based matching for known interests
  if (interests.education > 0 && item.bucket === "educational") {
    matchScore += interests.education * 2;
  }
  if (interests.history > 0 && itemText.includes("history")) {
    matchScore += interests.history * 1.5;
  }
  if (interests.culture > 0 && itemText.includes("culture")) {
    matchScore += interests.culture * 1.5;
  }

  return matchScore;
}

function enforceContentMix(items: FeedItem[], config: RecommendationConfig): FeedItem[] {
  const targetMix = config.contentMix;
  const totalItems = items.length;
  
  const targetCounts = {
    viral: Math.floor(totalItems * targetMix.viral),
    educational: Math.floor(totalItems * targetMix.educational),
    deep: Math.floor(totalItems * targetMix.deep)
  };

  const selected: FeedItem[] = [];
  const counts = { viral: 0, educational: 0, deep: 0 };

  // First pass: select items that meet mix targets
  for (const item of items) {
    if (counts[item.bucket] < targetCounts[item.bucket]) {
      selected.push(item);
      counts[item.bucket]++;
    }
  }

  // Second pass: fill remaining slots with highest-scoring items
  const remainingItems = items.filter(item => !selected.includes(item));
  const remainingSlots = totalItems - selected.length;
  
  if (remainingSlots > 0 && remainingItems.length > 0) {
    selected.push(...remainingItems.slice(0, remainingSlots));
  }

  return selected;
}

export async function rankForUser(input: {
  items: FeedItem[];
  interests: Record<string, number>;
}) {
  // Get active ranking configuration
  const rankingConfig = await getActiveConfig();
  const config: RecommendationConfig = rankingConfig ? {
    contentMix: rankingConfig.contentMix || { viral: 0.3, educational: 0.4, deep: 0.3 },
    scoreWeights: rankingConfig.scoreWeights || { 
      userInterestMatch: 10, 
      diversityBoost: 1, 
      recencyBoost: 1 
    },
    recencyDecay: rankingConfig.recencyDecay || 0.1
  } : {
    contentMix: { viral: 0.3, educational: 0.4, deep: 0.3 },
    scoreWeights: { userInterestMatch: 10, diversityBoost: 1, recencyBoost: 1 },
    recencyDecay: 0.1
  };

  const chosenBuckets: string[] = [];

  // Get thematic keywords for user interests
  const interestIds = Object.keys(input.interests).filter(k => input.interests[k] > 0);
  const thematicKeywords = getKeywordsForInterests(interestIds);

  const scoredItems = [...input.items].map((item) => {
    // Calculate user interest match using tags and thematic keywords
    const userInterestMatch = calculateInterestMatch(item, input.interests, thematicKeywords);

    // Apply diversity boost
    const diversityBoost = computeDiversityBoost(chosenBuckets, item.bucket);
    
    // Calculate recency boost
    const recencyBoost = calculateRecencyBoost(item.createdAt, config);
    
    // Compute final personalized score
    const personalizedScore = computePersonalizedScore({
      engagementScore: item.scores.finalScore,
      userInterestMatch: userInterestMatch * config.scoreWeights.userInterestMatch,
      diversityBoost: diversityBoost * config.scoreWeights.diversityBoost,
      recencyBoost: recencyBoost * config.scoreWeights.recencyBoost
    });

    return {
      item,
      personalizedScore,
      userInterestMatch,
      diversityBoost,
      recencyBoost
    };
  });

  // Sort by personalized score
  const sortedItems = scoredItems
    .sort((left, right) => right.personalizedScore - left.personalizedScore)
    .map(({ item }) => {
      chosenBuckets.push(item.bucket);
      return item;
    });

  // Enforce content mix constraints
  const finalItems = enforceContentMix(sortedItems, config);

  return finalItems;
}
