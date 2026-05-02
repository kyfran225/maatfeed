import { CommentModel } from "../models/Comment.js";
import { logger } from "../config/logger.js";
import type { CommentAnalysis } from "./commentAnalysisService.js";
import { analyzeComment } from "./commentAnalysisService.js";
import { generateWithAIRouter } from "./aiRouterService.js";
import { invalidateFeedCache } from "./feedService.js";
import { refreshCommunityDiscussionScore } from "./communityScoreService.js";
import { routeToPersonality, buildPersonalityPrompt, type AIPersonalityId, type AIPersonality } from "./personalityRouterService.js";
import { shouldAIIntervene } from "./contentClassificationService.js";
import { getCache, setCache } from "./cacheService.js";
import { getAIAvatarById } from "@maat/shared";

export type AICommentContext = {
  recentCommentCount: number;
  discussionActive: boolean;
  lastAIResponses: { personalityId: AIPersonalityId; timestamp: number }[];
  discussionContext?: string[];
  previousAIResponses?: string[];
};

type LegacyAIPersonalityAlias = "sage" | "debateur" | "prof";

// Legacy personalities for backward compatibility
const LEGACY_PERSONALITIES: Record<LegacyAIPersonalityAlias, AIPersonality> = {
  sage: {
    id: "maat_sage",
    name: "Sage",
    displayName: "Maât",
    avatar: getAIAvatarById("maat_sage")?.imageUrl64 || "/avatars/ai/maat_sage-64.png",
    description: "Sagesse ancienne et équilibre spirituel",
    tone: "calme, profond, nuancé, orienté sens",
    expertise: ["spirituality", "philosophy"],
    systemPrompt: "Tu es un sage de la tradition MAAT.",
    responseStyle: {
      length: "medium",
      formality: "respectful",
      questioning: true,
      contrarian: false
    },
    triggers: {
      topics: ["spirituality", "philosophy"],
      emotions: [],
      patterns: []
    },
    frequency: {
      baseProbability: 0.3,
      boost: 0.2,
      cooldown: 3
    }
  },
  debateur: {
    id: "community_builder",
    name: "Débatteur",
    displayName: "Community Builder",
    avatar: getAIAvatarById("community_builder")?.imageUrl64 || "/avatars/ai/community_builder-64.png",
    description: "Faciliteur de discussions constructives",
    tone: "stimulant, contradicteur respectueux",
    expertise: ["debate", "community"],
    systemPrompt: "Tu es un animateur de débat.",
    responseStyle: {
      length: "short",
      formality: "casual",
      questioning: true,
      contrarian: true
    },
    triggers: {
      topics: ["debate"],
      emotions: [],
      patterns: []
    },
    frequency: {
      baseProbability: 0.3,
      boost: 0.2,
      cooldown: 2
    }
  },
  prof: {
    id: "maat_sage",
    name: "Prof",
    displayName: "Maât",
    avatar: getAIAvatarById("maat_sage")?.imageUrl64 || "/avatars/ai/maat_sage-64.png",
    description: "Sagesse ancienne et équilibre spirituel",
    tone: "pédagogique, simple, clair",
    expertise: ["spirituality", "philosophy"],
    systemPrompt: "Tu es un professeur sage.",
    responseStyle: {
      length: "medium",
      formality: "respectful",
      questioning: false,
      contrarian: false
    },
    triggers: {
      topics: ["spirituality", "philosophy"],
      emotions: [],
      patterns: []
    },
    frequency: {
      baseProbability: 0.3,
      boost: 0.2,
      cooldown: 3
    }
  }
};

async function pickPersonality(analysis: CommentAnalysis, comment: string, context: any): Promise<AIPersonality> {
  try {
    const routing = await routeToPersonality(comment, context);
    if (routing && routing.confidence > 0.4) {
      return routing.personality;
    }
  } catch (error) {
    logger.warn({ err: error }, "Personality routing failed, using fallback");
  }

  // Fallback to legacy logic
  if (analysis.questionScore >= 0.55) {
    return LEGACY_PERSONALITIES.prof;
  }

  if (analysis.debateScore >= 0.55) {
    return LEGACY_PERSONALITIES.debateur;
  }

  return LEGACY_PERSONALITIES.sage;
}

function buildFallbackResponse(personality: AIPersonality, comment: string): string {
  switch (personality.id) {
    case "kemet_expert":
      return `En tant qu'expert de Kemet, je peux te dire que cette question mérite une recherche approfondie des textes anciens. Quels aspects spécifiques t'intéressent le plus ?`;
    case "community_builder":
      return `C'est une perspective intéressante ! D'autres pensent différemment sur ce sujet. Qu'est-ce qui vous amène à cette conclusion ?`;
    case "catholic_theologian":
      return `Cette question touche à la doctrine catholique. Selon l'Église, il faut considérer les Écritures et la Tradition. Quelle dimension théologique t'interroge ?`;
    case "muslim_scholar":
      return `Dans la tradition islamique, cette question trouve réponse dans le Coran et la Sunnah. Le Coran nous enseigne que... Quelle approche souhaites-tu explorer ?`;
    case "jewish_scholar":
      return `La Torah et la tradition juive abordent cette question avec profondeur. Nos Sages enseignent que... Quel aspect de la tradition t'intéresse ?`;
    case "maat_sage":
    default:
      return `Ton message ouvre une piste utile. Avant de trancher, il vaut mieux distinguer ce qui relève des faits, de l'expérience personnelle et de l'interprétation.`;
  }
}

export async function generateAIResponse(
  comment: string, 
  analysis: CommentAnalysis,
  context: AICommentContext = {
    recentCommentCount: 0,
    discussionActive: false,
    lastAIResponses: []
  }
): Promise<{
  body: string;
  personality: AIPersonality;
  provider: string;
  responseAnalysis: CommentAnalysis;
}> {
  // Check if AI should intervene
  const interventionCheck = await shouldAIIntervene(
    comment, 
    context.recentCommentCount,
    context.lastAIResponses[0]?.timestamp || 0
  );

  if (!interventionCheck.shouldIntervene) {
    throw new Error(`AI intervention not recommended: ${interventionCheck.reason}`);
  }

  const personality = await pickPersonality(analysis, comment, context);

  try {
    const prompts = buildPersonalityPrompt(personality, {
      originalComment: comment,
      discussionContext: context.discussionContext,
      previousAIResponses: context.previousAIResponses
    });

    const routed = await generateWithAIRouter({
      complex: analysis.debateScore > 0.65 || analysis.questionScore > 0.65,
      fast: analysis.emotionScore > 0.5 && analysis.debateScore < 0.4,
      maxTokens: personality.responseStyle.length === "short" ? 150 : 250,
      temperature: personality.id === "community_builder" ? 0.7 : 0.5,
      systemPrompt: prompts.systemPrompt,
      userPrompt: prompts.userPrompt
    });

    const body = routed.text.trim();

    return {
      body,
      personality,
      provider: routed.provider,
      responseAnalysis: await analyzeComment(body)
    };
  } catch (error) {
    logger.warn({ err: error }, "AI routing failed, using deterministic fallback");

    const body = buildFallbackResponse(personality, comment);
    return {
      body,
      personality,
      provider: "fallback",
      responseAnalysis: await analyzeComment(body)
    };
  }
}

async function getDiscussionContext(contentId: string): Promise<{
  recentCommentCount: number;
  discussionActive: boolean;
  lastAIResponses: { personalityId: AIPersonalityId; timestamp: number }[];
}> {
  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  
  // Get recent comments in this discussion
  const recentComments = await CommentModel.find({
    contentId,
    createdAt: { $gte: oneHourAgo },
    hidden: false,
    moderationStatus: "approved"
  }).sort({ createdAt: -1 });
  
  // Get recent AI responses
  const recentAIResponses = await CommentModel.find({
    contentId,
    aiGenerated: true,
    createdAt: { $gte: oneHourAgo }
  }).select('aiPersona createdAt').lean();
  
  return {
    recentCommentCount: recentComments.length,
    discussionActive: recentComments.length > 2,
    lastAIResponses: recentAIResponses.map(comment => ({
      personalityId: comment.aiPersona as AIPersonalityId,
      timestamp: comment.createdAt.getTime()
    }))
  };
}

async function resolveDiscussionContext(contentId: string, context?: AICommentContext): Promise<AICommentContext> {
  return context || await getDiscussionContext(contentId);
}

export async function shouldAIRespondToComment(
  commentId: string,
  context?: AICommentContext
): Promise<{ shouldRespond: boolean; reason: string }> {
  const cacheKey = `ai:should_respond:${commentId}`;
  const useCachedDecision = !context;

  if (useCachedDecision) {
    const cached = await getCache<{ shouldRespond: boolean; reason: string }>(cacheKey);
    
    if (cached) {
      return cached;
    }
  }

  const sourceComment = await CommentModel.findById(commentId);
  
  if (!sourceComment || sourceComment.aiGenerated || sourceComment.hidden || sourceComment.moderationStatus !== "approved") {
    const result = { shouldRespond: false, reason: "Ce commentaire n'est pas eligible a une reponse IA." };
    if (useCachedDecision) {
      await setCache(cacheKey, result, 300); // 5 minutes cache
    }
    return result;
  }

  // Check if AI already responded
  const existingAIComment = await CommentModel.findOne({
    inReplyToCommentId: sourceComment._id,
    aiGenerated: true
  });

  if (existingAIComment) {
    const result = { shouldRespond: false, reason: "L'IA a deja repondu a ce commentaire." };
    if (useCachedDecision) {
      await setCache(cacheKey, result, 300);
    }
    return result;
  }

  // Check toxicity and spam
  if (sourceComment.analysis.toxicityScore > 0.6 || sourceComment.analysis.spamScore > 0.7) {
    const result = { shouldRespond: false, reason: "Ce commentaire est trop toxique ou assimilable a du spam." };
    if (useCachedDecision) {
      await setCache(cacheKey, result, 300);
    }
    return result;
  }

  // Get real discussion context if not provided
  const discussionContext = await resolveDiscussionContext(sourceComment.contentId.toString(), context);

  const interventionCheck = await shouldAIIntervene(
    sourceComment.body,
    discussionContext.recentCommentCount,
    discussionContext.lastAIResponses[0]?.timestamp || 0
  );

  const result = {
    shouldRespond: interventionCheck.shouldIntervene,
    reason: interventionCheck.reason
  };

  if (useCachedDecision) {
    await setCache(cacheKey, result, 300);
  }
  return result;
}

export async function createAICommentForComment(
  commentId: string,
  context?: AICommentContext
): Promise<string | null> {
  const shouldRespond = await shouldAIRespondToComment(commentId, context);
  
  if (!shouldRespond.shouldRespond) {
    logger.info(`AI not responding to comment ${commentId}: ${shouldRespond.reason}`);
    return null;
  }

  const sourceComment = await CommentModel.findById(commentId);
  if (!sourceComment) {
    return null;
  }

  const effectiveContext = await resolveDiscussionContext(sourceComment.contentId.toString(), context);
  const generated = await generateAIResponse(sourceComment.body, sourceComment.analysis, effectiveContext);

  const aiComment = await CommentModel.create({
    contentId: sourceComment.contentId,
    aiGenerated: true,
    aiPersona: generated.personality.id,
    aiPersonaName: generated.personality.displayName || generated.personality.name,
    aiPersonaAvatar: generated.personality.avatar,
    body: generated.body,
    inReplyToCommentId: sourceComment._id,
    replyToCommentId: sourceComment._id,
    replyMode: "flat",
    debateScore: Math.round(generated.responseAnalysis.debateScore * 10),
    moderationStatus: "approved",
    moderationReason: `ai:${generated.provider}`,
    hidden: false,
    reportCount: 0,
    analysis: generated.responseAnalysis,
    qualityScore: generated.responseAnalysis.qualityScore,
    mentions: []
  });

  await CommentModel.findByIdAndUpdate(sourceComment._id, {
    $inc: { replyCount: 1 }
  });

  await invalidateFeedCache(sourceComment.contentId.toString());
  await refreshCommunityDiscussionScore(sourceComment.contentId.toString());

  return aiComment._id.toString();
}
