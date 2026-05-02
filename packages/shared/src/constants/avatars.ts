export type KemetAvatarType =
  | "maat-homme"
  | "maat-femme"
  | "leadership"
  | "memoire"
  | "sagesse"
  | "religion"
  | "recherche"
  | "exploration"
  | "communaute"
  | "debat"
  | "equilibre"
  | "curiosite"
  | "septique"
  | "transmission";

export type AvatarIdentityType =
  | "classic"
  | "vision"
  | "knowledge"
  | "spiritual"
  | "social"
  | "balance"
  | "critical";

export interface KemetAvatar {
  id: KemetAvatarType;
  name: string;
  emoji: string;
  identityType: AvatarIdentityType;
  description: string;
  meaning: string;
  contentRecommendations: string[];
  tone: string;
  associatedTopics: string[];
  imageUrl: string;
  imageUrl64: string;
}

export type AIAvatarType =
  | "maat_sage"
  | "kemet_expert"
  | "community_builder"
  | "catholic_theologian"
  | "muslim_scholar"
  | "jewish_scholar";

export interface AIAvatar {
  id: AIAvatarType;
  imageUrl: string;
  imageUrl64: string;
}

const LEGACY_AI_AVATAR_URL_ALIASES: Record<string, AIAvatarType> = {
  "/avatars/maat-sage-64px.png": "maat_sage",
  "/avatars/maat-sage-128px.png": "maat_sage",
  "/avatars/kemet-expert-64px.png": "kemet_expert",
  "/avatars/kemet-expert-128px.png": "kemet_expert",
  "/avatars/community-builder-64px.png": "community_builder",
  "/avatars/community-builder-128px.png": "community_builder",
  "/avatars/catholic-theologian-64px.png": "catholic_theologian",
  "/avatars/catholic-theologian-128px.png": "catholic_theologian",
  "/avatars/muslim-scholar-64px.png": "muslim_scholar",
  "/avatars/muslim-scholar-128px.png": "muslim_scholar",
  "/avatars/jewish-scholar-64px.png": "jewish_scholar",
  "/avatars/jewish-scholar-128px.png": "jewish_scholar"
};

const LEGACY_AVATAR_ALIASES: Record<string, KemetAvatarType> = {
  pharaon: "leadership",
  pharaonne: "leadership",
  gardien: "sagesse",
  gardienne: "communaute",
  pretre: "religion",
  pretresse: "equilibre",
  savant: "recherche",
  savante: "curiosite",
  guerisseur: "equilibre",
  guerisseuse: "sagesse",
  createur: "exploration",
  creatrice: "transmission"
};

export const KEMET_AVATARS: KemetAvatar[] = [
  {
    id: "maat-homme",
    name: "rmṯ n km.t",
    emoji: "⚖️",
    identityType: "classic",
    description: "Identité MAAT classique, ancrée dans l'équilibre.",
    meaning: "Profil sobre, stable et ouvert a tous les sujets.",
    contentRecommendations: ["Tous les sujets", "Decouverte", "Contenus varies"],
    tone: "Neutre, accueillant, pose",
    associatedTopics: ["kemet", "history", "spirituality", "culture"],
    imageUrl: "/avatars/users/maat-avatar-homme-128.png",
    imageUrl64: "/avatars/users/maat-avatar-homme-64.png"
  },
  {
    id: "maat-femme",
    name: "rmṯ n km.t",
    emoji: "⚖️",
    identityType: "classic",
    description: "Identité MAAT classique, ancrée dans l'équilibre.",
    meaning: "Profil sobre, stable et ouvert a tous les sujets.",
    contentRecommendations: ["Tous les sujets", "Decouverte", "Contenus varies"],
    tone: "Neutre, accueillant, pose",
    associatedTopics: ["kemet", "history", "spirituality", "culture"],
    imageUrl: "/avatars/users/maat-avatar-femme-128.png",
    imageUrl64: "/avatars/users/maat-avatar-femme-64.png"
  },
  {
    id: "leadership",
    name: "Leadership",
    emoji: "👑",
    identityType: "vision",
    description: "Vision, influence, ambition et sens de la direction.",
    meaning: "Profil attire par la strategie, l'impact et les grandes trajectoires.",
    contentRecommendations: ["Leadership", "Politique", "Figures historiques", "Civilisations"],
    tone: "Affirme, inspire, structure",
    associatedTopics: ["politics", "history", "debate", "african-philosophy"],
    imageUrl: "/avatars/users/leadership-128.png",
    imageUrl64: "/avatars/users/leadership-64.png"
  },
  {
    id: "memoire",
    name: "Memoire",
    emoji: "🗿",
    identityType: "knowledge",
    description: "Heritage, transmission des traces et profondeur historique.",
    meaning: "Profil tourne vers l'histoire, les archives et la conscience des racines.",
    contentRecommendations: ["Histoire", "Kemet", "Diaspora", "Memoire collective"],
    tone: "Ancre, reflechi, narratif",
    associatedTopics: ["history", "kemet", "culture", "education"],
    imageUrl: "/avatars/users/memoire-128.png",
    imageUrl64: "/avatars/users/memoire-64.png"
  },
  {
    id: "sagesse",
    name: "Sagesse",
    emoji: "🪶",
    identityType: "spiritual",
    description: "Discernement, recul, harmonie et profondeur interieure.",
    meaning: "Profil qui cherche le sens avant la reaction immediate.",
    contentRecommendations: ["Spiritualite", "Philosophie africaine", "Maat", "Bien-etre"],
    tone: "Calme, nuance, introspectif",
    associatedTopics: ["spirituality", "african-philosophy", "health", "kemet"],
    imageUrl: "/avatars/users/sagesse-128.png",
    imageUrl64: "/avatars/users/sagesse-64.png"
  },
  {
    id: "religion",
    name: "Religion",
    emoji: "🕊️",
    identityType: "spiritual",
    description: "Foi, traditions et dialogue entre visions du sacre.",
    meaning: "Profil attire par les references religieuses et les questions spirituelles.",
    contentRecommendations: ["Religions", "Textes sacres", "Dialogue interreligieux", "Ethique"],
    tone: "Respectueux, pose, meditativ",
    associatedTopics: ["spirituality", "history", "debate", "african-philosophy"],
    imageUrl: "/avatars/users/religion-128.png",
    imageUrl64: "/avatars/users/religion-64.png"
  },
  {
    id: "recherche",
    name: "Recherche",
    emoji: "🔎",
    identityType: "knowledge",
    description: "Methode, verification, enquete et exigence intellectuelle.",
    meaning: "Profil qui aime creuser, comparer et sourcer les idees.",
    contentRecommendations: ["Science", "Education", "Analyse", "Debunk"],
    tone: "Rigoureux, clair, analytique",
    associatedTopics: ["science", "education", "history", "debate"],
    imageUrl: "/avatars/users/recherche-128.png",
    imageUrl64: "/avatars/users/recherche-64.png"
  },
  {
    id: "exploration",
    name: "Exploration",
    emoji: "🧭",
    identityType: "knowledge",
    description: "Decouverte, curiosite de terrain et ouverture a l'inattendu.",
    meaning: "Profil qui aime tester, apprendre et sortir des sentiers battus.",
    contentRecommendations: ["Decouverte", "Science", "Culture", "Voyages d'idees"],
    tone: "Ouvert, vif, aventureux",
    associatedTopics: ["science", "culture", "education", "kemet"],
    imageUrl: "/avatars/users/exploration-128.png",
    imageUrl64: "/avatars/users/exploration-64.png"
  },
  {
    id: "communaute",
    name: "Communaute",
    emoji: "🤝",
    identityType: "social",
    description: "Lien, collectif, solidarite et dynamique de groupe.",
    meaning: "Profil tourne vers le partage, l'entraide et la cohesion.",
    contentRecommendations: ["Communaute", "Debats", "Culture", "Bien-etre collectif"],
    tone: "Chaleureux, inclusif, rassembleur",
    associatedTopics: ["culture", "debate", "health", "politics"],
    imageUrl: "/avatars/users/communaute-128.png",
    imageUrl64: "/avatars/users/communaute-64.png"
  },
  {
    id: "debat",
    name: "Debat",
    emoji: "🗣️",
    identityType: "critical",
    description: "Confrontation d'idees, argumentation et esprit dialectique.",
    meaning: "Profil a l'aise avec les points de vue opposes et la contradiction utile.",
    contentRecommendations: ["Debats", "Societe", "Politique", "Analyses"],
    tone: "Direct, stimule, argumente",
    associatedTopics: ["debate", "politics", "science", "african-philosophy"],
    imageUrl: "/avatars/users/debat-128.png",
    imageUrl64: "/avatars/users/debat-64.png"
  },
  {
    id: "equilibre",
    name: "Equilibre",
    emoji: "☯️",
    identityType: "balance",
    description: "Mesure, stabilite et recherche d'une juste proportion.",
    meaning: "Profil qui prefere l'harmonie aux extremes.",
    contentRecommendations: ["Bien-etre", "Spiritualite", "Mode de vie", "Maat"],
    tone: "Apaise, centre, coherent",
    associatedTopics: ["health", "spirituality", "culture", "african-philosophy"],
    imageUrl: "/avatars/users/equilibre-128.png",
    imageUrl64: "/avatars/users/equilibre-64.png"
  },
  {
    id: "curiosite",
    name: "Curiosite",
    emoji: "✨",
    identityType: "knowledge",
    description: "Appetit d'apprendre, questions et connexion entre les domaines.",
    meaning: "Profil mue par la decouverte et l'exploration intellectuelle.",
    contentRecommendations: ["Education", "Science", "Culture", "Questions rapides"],
    tone: "Vif, joueur, exploratoire",
    associatedTopics: ["education", "science", "culture", "history"],
    imageUrl: "/avatars/users/curiosite-128.png",
    imageUrl64: "/avatars/users/curiosite-64.png"
  },
  {
    id: "septique",
    name: "Sceptique",
    emoji: "🧠",
    identityType: "critical",
    description: "Esprit critique, doute utile et refus des affirmations faciles.",
    meaning: "Profil qui challenge les conclusions trop rapides.",
    contentRecommendations: ["Analyse critique", "Debats", "Verification", "Methodologie"],
    tone: "Sobre, critique, methodique",
    associatedTopics: ["debate", "science", "education", "politics"],
    imageUrl: "/avatars/users/septique-128.png",
    imageUrl64: "/avatars/users/septique-64.png"
  },
  {
    id: "transmission",
    name: "Transmission",
    emoji: "📚",
    identityType: "social",
    description: "Partage des savoirs, pedagogie et passage de relais.",
    meaning: "Profil qui valorise l'apprentissage collectif et la diffusion des idees.",
    contentRecommendations: ["Education", "Culture", "Histoire", "Savoirs utiles"],
    tone: "Pedagogique, genereux, clair",
    associatedTopics: ["education", "culture", "history", "kemet"],
    imageUrl: "/avatars/users/transmission-128.png",
    imageUrl64: "/avatars/users/transmission-64.png"
  }
];

export const AI_AVATARS: AIAvatar[] = [
  {
    id: "maat_sage",
    imageUrl: "/avatars/ai/maat_sage-128.png",
    imageUrl64: "/avatars/ai/maat_sage-64.png"
  },
  {
    id: "kemet_expert",
    imageUrl: "/avatars/ai/kemet_expert-128.png",
    imageUrl64: "/avatars/ai/kemet_expert-64.png"
  },
  {
    id: "community_builder",
    imageUrl: "/avatars/ai/community_builder-128.png",
    imageUrl64: "/avatars/ai/community_builder-64.png"
  },
  {
    id: "catholic_theologian",
    imageUrl: "/avatars/ai/catholic_theologian-128.png",
    imageUrl64: "/avatars/ai/catholic_theologian-64.png"
  },
  {
    id: "muslim_scholar",
    imageUrl: "/avatars/ai/muslim_scholar-128.png",
    imageUrl64: "/avatars/ai/muslim_scholar-64.png"
  },
  {
    id: "jewish_scholar",
    imageUrl: "/avatars/ai/jewish_scholar-128.png",
    imageUrl64: "/avatars/ai/jewish_scholar-64.png"
  }
];

export const AVATAR_BY_ID: Record<KemetAvatarType, KemetAvatar> = KEMET_AVATARS.reduce(
  (acc, avatar) => ({ ...acc, [avatar.id]: avatar }),
  {} as Record<KemetAvatarType, KemetAvatar>
);

export const AI_AVATAR_BY_ID: Record<AIAvatarType, AIAvatar> = AI_AVATARS.reduce(
  (acc, avatar) => ({ ...acc, [avatar.id]: avatar }),
  {} as Record<AIAvatarType, AIAvatar>
);

export function getAvatarById(id: KemetAvatarType | string): KemetAvatar | undefined {
  const resolvedId = LEGACY_AVATAR_ALIASES[id] || id;
  return AVATAR_BY_ID[resolvedId as KemetAvatarType];
}

export function getAIAvatarById(id: AIAvatarType | string): AIAvatar | undefined {
  return AI_AVATAR_BY_ID[id as AIAvatarType];
}

export function resolveAIAvatarUrl(
  avatarUrl?: string | null,
  personalityId?: AIAvatarType | string | null,
  size: 64 | 128 = 64
): string | null {
  const fromPersonality = personalityId ? getAIAvatarById(personalityId) : undefined;
  if (fromPersonality) {
    return size === 128 ? fromPersonality.imageUrl : fromPersonality.imageUrl64;
  }

  if (!avatarUrl) {
    return null;
  }

  const fromLegacyUrl = LEGACY_AI_AVATAR_URL_ALIASES[avatarUrl];
  if (fromLegacyUrl) {
    const avatar = getAIAvatarById(fromLegacyUrl);
    return avatar ? (size === 128 ? avatar.imageUrl : avatar.imageUrl64) : avatarUrl;
  }

  if (avatarUrl.includes("seed=maat_sage")) {
    return getAIAvatarById("maat_sage")?.imageUrl64 || avatarUrl;
  }
  if (avatarUrl.includes("seed=kemet_expert")) {
    return getAIAvatarById("kemet_expert")?.imageUrl64 || avatarUrl;
  }
  if (avatarUrl.includes("seed=community_builder")) {
    return getAIAvatarById("community_builder")?.imageUrl64 || avatarUrl;
  }
  if (avatarUrl.includes("seed=catholic_theologian")) {
    return getAIAvatarById("catholic_theologian")?.imageUrl64 || avatarUrl;
  }
  if (avatarUrl.includes("seed=muslim_scholar")) {
    return getAIAvatarById("muslim_scholar")?.imageUrl64 || avatarUrl;
  }
  if (avatarUrl.includes("seed=jewish_scholar")) {
    return getAIAvatarById("jewish_scholar")?.imageUrl64 || avatarUrl;
  }

  return avatarUrl;
}

export function getAvatarsByIdentityType(type: AvatarIdentityType): KemetAvatar[] {
  return KEMET_AVATARS.filter((avatar) => avatar.identityType === type);
}

export function getAvatarInterests(avatarId: KemetAvatarType | string): Record<string, number> {
  const avatar = getAvatarById(avatarId);
  if (!avatar) return {};

  return avatar.associatedTopics.reduce((acc, topic) => ({
    ...acc,
    [topic]: 0.8
  }), {});
}

export const AVATAR_TITLES: Record<AvatarIdentityType, string> = {
  classic: "Commencez avec Maat",
  vision: "Voyez plus loin",
  knowledge: "Creusez le sujet",
  spiritual: "Cherchez le sens",
  social: "Partagez avec la communaute",
  balance: "Restez dans la mesure",
  critical: "Questionnez les certitudes"
};
