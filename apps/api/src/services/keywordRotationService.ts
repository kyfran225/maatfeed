import { logger } from "../config/logger.js";

export interface ThematicKeyword {
  keyword: string;
  interests: string[];
  language: "fr" | "en";
}

const THEMATIC_KEYWORDS: ThematicKeyword[] = [
  // Kemet / Ancient Egypt
  { keyword: "kemet ancient egypt spirituality", interests: ["kemet", "spirituality"], language: "en" },
  { keyword: "spiritualité kemet égypte ancienne", interests: ["kemet", "spirituality"], language: "fr" },
  { keyword: "kemetic spirituality meditation", interests: ["kemet", "spirituality"], language: "en" },
  { keyword: "méditation kemetique prières égyptiennes", interests: ["kemet", "spirituality"], language: "fr" },
  { keyword: "royaume kemet pharaons noirs", interests: ["kemet", "history"], language: "fr" },

  // African Philosophy
  { keyword: "african philosophy wisdom ubuntu", interests: ["african-philosophy"], language: "en" },
  { keyword: "philosophie africaine sagesse", interests: ["african-philosophy"], language: "fr" },
  { keyword: "ubuntu philosophy african wisdom", interests: ["african-philosophy"], language: "en" },
  { keyword: "sagesse africaine proverbes", interests: ["african-philosophy", "culture"], language: "fr" },
  { keyword: "pensée africaine cheikh anta diop", interests: ["african-philosophy", "history"], language: "fr" },

  // African History
  { keyword: "african history documentary", interests: ["history"], language: "en" },
  { keyword: "histoire africaine documentaire", interests: ["history"], language: "fr" },
  { keyword: "black history africa civilization", interests: ["history"], language: "en" },
  { keyword: "histoire noire afrique civilisation", interests: ["history"], language: "fr" },
  { keyword: "empires africains royaumes oubliés", interests: ["history"], language: "fr" },
  { keyword: "géographie sacrée afrique", interests: ["history", "spirituality"], language: "fr" },
  { keyword: "résistance africaine colonisation", interests: ["history", "politics"], language: "fr" },
  { keyword: "histoire royaume kongo", interests: ["history"], language: "fr" },
  { keyword: "histoire empire mali soundiata keita", interests: ["history"], language: "fr" },

  // Culture
  { keyword: "african culture traditions", interests: ["culture"], language: "en" },
  { keyword: "culture africaine traditions", interests: ["culture"], language: "fr" },
  { keyword: "black culture afrobeat music", interests: ["culture"], language: "en" },
  { keyword: "musique africaine traditionnelle", interests: ["culture"], language: "fr" },
  { keyword: "danse africaine rituels", interests: ["culture", "spirituality"], language: "fr" },
  { keyword: "mode africaine wax pagne", interests: ["culture"], language: "fr" },
  { keyword: "art africain sculptures masques", interests: ["culture", "art"], language: "fr" },
  { keyword: "littérature africaine auteurs", interests: ["culture", "education"], language: "fr" },

  // Education
  { keyword: "african education knowledge", interests: ["education"], language: "en" },
  { keyword: "education afrique savoirs", interests: ["education"], language: "fr" },
  { keyword: "enseignement africain traditionnel griots", interests: ["education", "culture"], language: "fr" },

  // Debates
  { keyword: "african debate discussion politics", interests: ["debate", "politics"], language: "en" },
  { keyword: "débat africain analyse politique", interests: ["debate", "politics"], language: "fr" },
  { keyword: "actualité afrique francophone", interests: ["debate", "politics"], language: "fr" },
  { keyword: "diaspora africaine retour aux sources", interests: ["culture", "politics"], language: "fr" },

  // Spirituality (general)
  { keyword: "african spirituality ancestors", interests: ["spirituality"], language: "en" },
  { keyword: "spiritualité africaine ancêtres", interests: ["spirituality"], language: "fr" },
  { keyword: "african diaspora spirituality", interests: ["spirituality", "culture"], language: "en" },
  { keyword: "vaudou vodou spiritualité bénin", interests: ["spirituality", "culture"], language: "fr" },
  { keyword: "sagesse dogons mali astronomie", interests: ["spirituality", "science", "history"], language: "fr" },
  { keyword: "initiation africaine mystères", interests: ["spirituality"], language: "fr" },

  // Science
  { keyword: "african science discoveries inventions", interests: ["science"], language: "en" },
  { keyword: "science africaine découvertes", interests: ["science"], language: "fr" },
  { keyword: "mathématiques africaines ethiopie", interests: ["science", "history"], language: "fr" },
  { keyword: "médecine traditionnelle africaine", interests: ["science", "health"], language: "fr" },

  // Wellness/Health
  { keyword: "african wellness health healing", interests: ["health"], language: "en" },
  { keyword: "bien-être africain santé naturelle", interests: ["health"], language: "fr" },
  { keyword: "plantes médicinales afrique guérison", interests: ["health", "science"], language: "fr" },

  // Afrocentric
  { keyword: "afrocentric history black consciousness", interests: ["history", "culture"], language: "en" },
  { keyword: "panafricanisme histoire", interests: ["history", "politics"], language: "fr" },
  { keyword: "négritude césaire senghor", interests: ["culture", "history"], language: "fr" },
  { keyword: "conscientisation africaine mentalité", interests: ["culture", "education"], language: "fr" },
];

export function getAllThematicKeywords(): ThematicKeyword[] {
  return [...THEMATIC_KEYWORDS];
}

export function getKeywordsForInterests(interests: string[]): ThematicKeyword[] {
  return THEMATIC_KEYWORDS.filter(
    (tk) => tk.interests.some((interest) => interests.includes(interest))
  );
}

export function getRandomKeywords(count: number = 2): ThematicKeyword[] {
  const shuffled = [...THEMATIC_KEYWORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getNextKeywordsBatch(lastUsedKeywords?: string[]): ThematicKeyword[] {
  // If we have history, try to pick keywords not recently used
  if (lastUsedKeywords && lastUsedKeywords.length > 0) {
    const available = THEMATIC_KEYWORDS.filter(
      (tk) => !lastUsedKeywords.includes(tk.keyword)
    );

    if (available.length >= 2) {
      const shuffled = available.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 2);
    }
  }

  return getRandomKeywords(2);
}

export function mapInterestsToKeywords(interests: Record<string, number>): string[] {
  const interestIds = Object.keys(interests).filter((id) => interests[id] > 0);

  if (interestIds.length === 0) {
    return getRandomKeywords(3).map((tk) => tk.keyword);
  }

  const matching = getKeywordsForInterests(interestIds);

  if (matching.length === 0) {
    return getRandomKeywords(3).map((tk) => tk.keyword);
  }

  const shuffled = matching.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4).map((tk) => tk.keyword);
}

export function logKeywordRotation(selected: ThematicKeyword[], context?: string) {
  logger.info(
    {
      selectedKeywords: selected.map((s) => s.keyword),
      interests: selected.flatMap((s) => s.interests),
      context
    },
    "Keyword rotation executed"
  );
}
