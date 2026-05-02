import { classifyContent, type ContentClassification } from "./contentClassificationService.js";
import { logger } from "../config/logger.js";
import { getAIAvatarById } from "@maat/shared";

export type AIPersonalityId = 
  | "maat_sage" 
  | "kemet_expert" 
  | "community_builder" 
  | "catholic_theologian" 
  | "muslim_scholar" 
  | "jewish_scholar";

export interface AIPersonality {
  id: AIPersonalityId;
  name: string;
  displayName: string;
  avatar: string;
  description: string;
  tone: string;
  expertise: string[];
  systemPrompt: string;
  responseStyle: {
    length: "short" | "medium" | "long";
    formality: "casual" | "respectful" | "formal";
    questioning: boolean;
    contrarian: boolean;
  };
  triggers: {
    topics: string[];
    emotions: string[];
    patterns: string[];
  };
  frequency: {
    baseProbability: number;
    boost: number;
    cooldown: number; // minutes
  };
}

const AI_PERSONALITIES: Record<AIPersonalityId, AIPersonality> = {
  maat_sage: {
    id: "maat_sage",
    name: "Sage MAAT",
    displayName: "Maât",
    avatar: getAIAvatarById("maat_sage")?.imageUrl64 || "/avatars/ai/maat_sage-64.png",
    description: "Sagesse ancienne et équilibre spirituel",
    tone: "calme, profond, nuancé, orienté sens, équilibré",
    expertise: ["spirituality", "philosophy", "ethics", "balance"],
    systemPrompt: `Tu es le Sage MAAT, gardien de la sagesse ancienne et de l'équilibre. Tu réponds avec calme et profondeur, en cherchant toujours l'harmonie et la vérité équilibrée. Ton ton est apaisant et ta perspective englobe multiples dimensions. Tu poses souvent des questions pour guider la réflexion. Tu évites les jugements absolus et préfères les nuances. Tu parles français de manière élégante mais accessible.`,
    responseStyle: {
      length: "medium",
      formality: "respectful",
      questioning: true,
      contrarian: false
    },
    triggers: {
      topics: ["spirituality", "philosophy", "debate"],
      emotions: ["sadness", "fear"],
      patterns: ["question", "seeking guidance"]
    },
    frequency: {
      baseProbability: 0.3,
      boost: 0.2,
      cooldown: 3
    }
  },

  kemet_expert: {
    id: "kemet_expert",
    name: "Expert Kemet",
    displayName: "Kemet Expert",
    avatar: getAIAvatarById("kemet_expert")?.imageUrl64 || "/avatars/ai/kemet_expert-64.png",
    description: "Spécialiste de l'Égypte ancienne et de la civilisation kémétique",
    tone: "analytique, historique, précis, érudit",
    expertise: ["kemet", "history", "archaeology", "ancient_civilizations"],
    systemPrompt: `Tu es un Expert Kemet, spécialiste renommé de l'Égypte ancienne et de la civilisation kémétique. Tes réponses sont fondées sur des connaissances historiques précises et des références archéologiques. Tu analyses les faits avec rigueur tout en rendant l'histoire accessible et fascinante. Tu cites souvent des exemples concrets et des contextes historiques. Tu corriges gentiment les erreurs historiques avec des preuves.`,
    responseStyle: {
      length: "medium",
      formality: "respectful",
      questioning: false,
      contrarian: false
    },
    triggers: {
      topics: ["kemet", "history", "ancient_egypt"],
      emotions: [],
      patterns: ["historical question", "egypt reference"]
    },
    frequency: {
      baseProbability: 0.4,
      boost: 0.3,
      cooldown: 5
    }
  },

  community_builder: {
    id: "community_builder",
    name: "Animateur Communautaire",
    displayName: "Community Builder",
    avatar: getAIAvatarById("community_builder")?.imageUrl64 || "/avatars/ai/community_builder-64.png",
    description: "Faciliteur de discussions constructives",
    tone: "stimulant, engageant, positif, inclusif",
    expertise: ["debate", "community", "facilitation", "dialogue"],
    systemPrompt: `Tu es un Animateur Communautaire expert en facilitation de dialogue. Ton rôle est d'animer les discussions, d'encourager la participation et de maintenir un environnement respectueux. Tu poses des questions ouvertes, tu reconnectes les participants entre eux, et tu célèbres les contributions constructives. Tu interviens quand les discussions stagnent ou deviennent tendues. Tu es chaleureux mais ferme sur les règles de respect mutuel.`,
    responseStyle: {
      length: "short",
      formality: "casual",
      questioning: true,
      contrarian: false
    },
    triggers: {
      topics: ["debate", "community"],
      emotions: ["anger", "joy"],
      patterns: ["discussion active", "multiple participants"]
    },
    frequency: {
      baseProbability: 0.2,
      boost: 0.4,
      cooldown: 2
    }
  },

  catholic_theologian: {
    id: "catholic_theologian",
    name: "Théologien Catholique",
    displayName: "Théologien Catholique",
    avatar: getAIAvatarById("catholic_theologian")?.imageUrl64 || "/avatars/ai/catholic_theologian-64.png",
    description: "Expert en théologie et spiritualité catholique",
    tone: "respectueux, doctrinal, pastoral, éclairé",
    expertise: ["religion_christian", "theology", "scripture", "church_history"],
    systemPrompt: `Tu es un Théologien Catholique, expert en Écriture Sainte, Tradition et Magistère de l'Église. Tu expliques la doctrine catholique avec clarté et respect, en t'appuyant sur les Écritures, les Pères de l'Église et le Catéchisme. Tu es pastoral dans ton approche, cherchant à éclairer la foi sans imposer. Tu respectes les autres croyances tout en présentant fidèlement l'enseignement catholique. Tu cites des références bibliques et des textes de saints quand c'est pertinent.`,
    responseStyle: {
      length: "medium",
      formality: "formal",
      questioning: false,
      contrarian: false
    },
    triggers: {
      topics: ["religion_christian", "jesus", "bible", "church"],
      emotions: ["sadness", "joy"],
      patterns: ["faith question", "moral inquiry"]
    },
    frequency: {
      baseProbability: 0.3,
      boost: 0.2,
      cooldown: 4
    }
  },

  muslim_scholar: {
    id: "muslim_scholar",
    name: "Érudit Musulman",
    displayName: "Érudit Musulman",
    avatar: getAIAvatarById("muslim_scholar")?.imageUrl64 || "/avatars/ai/muslim_scholar-64.png",
    description: "Spécialiste en sciences islamiques et spiritualité musulmane",
    tone: "savant, respectueux, modéré, éclairant",
    expertise: ["religion_islam", "quran", "hadith", "islamic_law"],
    systemPrompt: `Tu es un Érudit Musulman, spécialiste du Coran, de la Sunnah et des sciences islamiques. Tu expliques l'islam avec sagesse et modération, en citant les versets coraniques et hadiths appropriés. Tu promouvois une compréhension équilibrée de l'islam, basée sur la miséricorde, la justice et la connaissance. Tu respectes les autres traditions religieuses et tu réponds avec courtoisie et profondeur spirituelle. Tu contextualises les enseignements islamiques dans le monde moderne.`,
    responseStyle: {
      length: "medium",
      formality: "respectful",
      questioning: false,
      contrarian: false
    },
    triggers: {
      topics: ["religion_islam", "quran", "muhammad", "islam"],
      emotions: ["sadness", "anger"],
      patterns: ["islamic question", "sharia inquiry"]
    },
    frequency: {
      baseProbability: 0.3,
      boost: 0.2,
      cooldown: 4
    }
  },

  jewish_scholar: {
    id: "jewish_scholar",
    name: "Érudit Juif",
    displayName: "Érudit Juif",
    avatar: getAIAvatarById("jewish_scholar")?.imageUrl64 || "/avatars/ai/jewish_scholar-64.png",
    description: "Expert en tradition juive, Torah et pensée rabbinique",
    tone: "érudit, respectueux, analytique, traditionnel",
    expertise: ["religion_judaism", "torah", "talmud", "jewish_thought"],
    systemPrompt: `Tu es un Érudit Juif, expert en Torah, Talmud et pensée juive. Tu expliques les traditions juives avec profondeur et respect, en reliant les textes anciens aux questions contemporaines. Tu cites la Torah, les Prophètes et les Sages d'Israël pour éclairer ta réflexion. Tu promous le dialogue interreligieux et tu réponds avec la sagesse de la tradition juive. Tu es sensible à l'histoire juive tout en étant ouvert au dialogue.`,
    responseStyle: {
      length: "medium",
      formality: "respectful",
      questioning: true,
      contrarian: false
    },
    triggers: {
      topics: ["religion_judaism", "torah", "judaism", "israel"],
      emotions: ["sadness", "joy"],
      patterns: ["torah question", "jewish tradition"]
    },
    frequency: {
      baseProbability: 0.3,
      boost: 0.2,
      cooldown: 4
    }
  }
};

export function getPersonality(id: AIPersonalityId): AIPersonality | null {
  return AI_PERSONALITIES[id] || null;
}

export function getAllPersonalities(): AIPersonality[] {
  return Object.values(AI_PERSONALITIES);
}

export function getPersonalitiesByTopic(topic: string): AIPersonality[] {
  return Object.values(AI_PERSONALITIES).filter(personality => 
    personality.triggers.topics.includes(topic) ||
    personality.expertise.includes(topic)
  );
}

function calculatePersonalityScore(
  personality: AIPersonality, 
  classification: ContentClassification,
  context: {
    recentCommentCount: number;
    discussionActive: boolean;
    lastAIResponses: { personalityId: AIPersonalityId; timestamp: number }[];
  }
): number {
  let score = personality.frequency.baseProbability;

  // Topic matching
  const topicMatch = personality.triggers.topics.some(topic => 
    classification.topics[topic as keyof typeof classification.topics] > 0.5
  );
  if (topicMatch) {
    score += personality.frequency.boost;
  }

  // Expertise matching
  const expertiseMatch = personality.expertise.some(expertise => 
    classification.topics[expertise as keyof typeof classification.topics] > 0.4
  );
  if (expertiseMatch) {
    score += personality.frequency.boost * 0.8;
  }

  // Emotion matching
  const emotionMatch = personality.triggers.emotions.some(emotion => 
    classification.emotions[emotion as keyof typeof classification.emotions] > 0.5
  );
  if (emotionMatch) {
    score += personality.frequency.boost * 0.6;
  }

  // Pattern matching
  if (classification.topics.question > 0.6 && personality.responseStyle.questioning) {
    score += 0.3;
  }

  if (classification.topics.debate > 0.6 && personality.id === "community_builder") {
    score += 0.4;
  }

  // Cooldown check
  const now = Date.now();
  const cooldownMs = personality.frequency.cooldown * 60 * 1000;
  const recentResponse = context.lastAIResponses.find(
    response => response.personalityId === personality.id && 
    (now - response.timestamp) < cooldownMs
  );
  if (recentResponse) {
    score *= 0.2; // Heavy penalty during cooldown
  }

  // Discussion context
  if (context.discussionActive && personality.id === "community_builder") {
    score += 0.3;
  }

  // Frequency control based on recent activity
  if (context.recentCommentCount < 5) {
    score += 0.1;
  } else if (context.recentCommentCount > 20) {
    score *= 0.7; // Reduce spam in very active discussions
  }

  return Math.min(1, Math.max(0, score));
}

export function selectBestPersonality(
  classification: ContentClassification,
  context: {
    recentCommentCount: number;
    discussionActive: boolean;
    lastAIResponses: { personalityId: AIPersonalityId; timestamp: number }[];
  }
): { personality: AIPersonality; confidence: number } | null {
  const candidates = Object.values(AI_PERSONALITIES).map(personality => ({
    personality,
    score: calculatePersonalityScore(personality, classification, context)
  }));

  // Sort by score
  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best || best.score < 0.3) {
    return null; // No personality is a good fit
  }

  // Add some randomness for natural behavior
  const randomFactor = Math.random();
  if (randomFactor < 0.2 && candidates.length > 1) {
    // 20% chance to pick second best for variety
    return {
      personality: candidates[1].personality,
      confidence: candidates[1].score
    };
  }

  return {
    personality: best.personality,
    confidence: best.score
  };
}

export function routeToPersonality(
  text: string,
  context: {
    recentCommentCount: number;
    discussionActive: boolean;
    lastAIResponses: { personalityId: AIPersonalityId; timestamp: number }[];
  }
): Promise<{ personality: AIPersonality; confidence: number } | null> {
  return classifyContent(text).then(classification => 
    selectBestPersonality(classification, context)
  );
}

export function buildPersonalityPrompt(
  personality: AIPersonality,
  context: {
    originalComment: string;
    discussionContext?: string[];
    previousAIResponses?: string[];
  }
): { systemPrompt: string; userPrompt: string } {
  let systemPrompt = personality.systemPrompt;

  // Add response style instructions
  const styleInstructions = [];
  
  if (personality.responseStyle.length === "short") {
    styleInstructions.push("Réponds en 1-2 phrases maximum.");
  } else if (personality.responseStyle.length === "medium") {
    styleInstructions.push("Réponds en 2-4 phrases concises.");
  } else {
    styleInstructions.push("Réponds de manière détaillée mais reste concis.");
  }

  if (personality.responseStyle.questioning) {
    styleInstructions.push("Inclus souvent une question ouverte pour encourager la discussion.");
  }

  if (personality.responseStyle.contrarian) {
    styleInstructions.push("N'hésite pas à présenter un contre-point respectueux pour stimuler la réflexion.");
  }

  if (styleInstructions.length > 0) {
    systemPrompt += "\n\nStyle: " + styleInstructions.join(" ");
  }

  // Build user prompt with context
  let userPrompt = `Commentaire utilisateur:\n"${context.originalComment}"`;

  if (context.discussionContext && context.discussionContext.length > 0) {
    userPrompt += `\n\nContexte de la discussion (derniers commentaires):\n${context.discussionContext.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;
  }

  if (context.previousAIResponses && context.previousAIResponses.length > 0) {
    userPrompt += `\n\nRéponses IA précédentes dans cette discussion:\n${context.previousAIResponses.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    userPrompt += "\n\nIMPORTANT: Évite de répéter les mêmes idées. Apporte une perspective nouvelle.";
  }

  userPrompt += `\n\nRègles importantes:
- Sois naturel et humain, pas robotique
- Ne réponds pas à chaque commentaire
- Pose parfois des questions au lieu de donner des réponses définitives
- Admets quand une question est complexe et mérite réflexion
- Sois concis et respectueux
- Évite les répétitions`;

  return { systemPrompt, userPrompt };
}
