import { AudioInteractionModel } from "../models/AudioInteraction.js";
import { AudioTrackModel } from "../models/AudioTrack.js";
import { ProfileModel } from "../models/Profile.js";
import { getUserInterests } from "./interestService.js";
import { getAudioTracks } from "./audioService.js";
import { enrichAudioTracks, type EnrichedAudioTrackData } from "./audioEnrichmentService.js";
import { getAudioSourceBlueprint } from "./audioIngestionService.js";

export interface AudioDiscoverySection {
  id: "trending" | "for_you" | "learn" | "relax" | "viral";
  title: string;
  subtitle: string;
  tracks: EnrichedAudioTrackData[];
}

function normalizePlayCount(playCount: number) {
  return Math.min(1, playCount / 250);
}

function computeRecency(createdAt: string) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageInDays = ageMs / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - Math.min(ageInDays / 21, 1));
}

function computeGenreAffinityBoost(
  track: EnrichedAudioTrackData,
  preferredGenres: Set<string>,
  genreAffinityByGenre: Map<string, number>
) {
  const genreAffinity = genreAffinityByGenre.get(track.genre) ?? 0;
  let boost = Math.max(-1.4, Math.min(2.2, genreAffinity));

  if (preferredGenres.has(track.genre)) {
    boost += 1.1;
  }

  if (track.genre === "spiritual") {
    boost += 0.9;
  }

  if (track.genre === "ambient") {
    boost += 0.75;
  }

  if (track.typeLabel === "meditation") {
    boost += 0.4;
  }

  return boost;
}

function computeInterestScore(
  track: EnrichedAudioTrackData,
  interests: Record<string, number>,
  preferredGenres: Set<string>,
  genreAffinityByGenre: Map<string, number>
) {
  let score = 0;
  const haystack = `${track.title} ${track.simpleDescription} ${track.enrichedTags.join(" ")}`.toLowerCase();
  score += computeGenreAffinityBoost(track, preferredGenres, genreAffinityByGenre);

  for (const [interest, weight] of Object.entries(interests)) {
    if (weight <= 0) continue;
    if (haystack.includes(interest.toLowerCase())) {
      score += Math.min(weight / 10, 1.5);
    }
  }

  return score;
}

function computeDiversityBonus(selectedGenres: string[], candidateGenre: string) {
  const repeatCount = selectedGenres.filter((genre) => genre === candidateGenre).length;
  return Math.max(0.2, 1 - repeatCount * 0.28);
}

function computeImmersionScore(
  track: EnrichedAudioTrackData,
  preferredGenres: Set<string>,
  genreAffinityByGenre: Map<string, number>
) {
  const genreAffinityBoost = computeGenreAffinityBoost(track, preferredGenres, genreAffinityByGenre);
  const baseImmersion =
    (track.genre === "spiritual" ? 2.4 : 0) +
    (track.genre === "ambient" ? 2.2 : 0) +
    (track.typeLabel === "meditation" ? 1.3 : 0) +
    (track.duration >= 480 ? 0.5 : 0);

  return baseImmersion + genreAffinityBoost + normalizePlayCount(track.playCount) + computeRecency(track.createdAt);
}

async function getUserAudioPreferences(userId?: string) {
  if (!userId) {
    return {
      preferredGenres: new Set<string>(),
      interactionByTrackId: new Map<string, number>(),
      genreAffinityByGenre: new Map<string, number>()
    };
  }

  const interactions = await AudioInteractionModel.find({
    userId,
    interactionType: { $in: ["play", "pause", "complete", "skip", "like", "share"] }
  })
    .sort({ createdAt: -1 })
    .limit(250)
    .lean();

  const trackIds = Array.from(new Set(interactions.map((interaction) => interaction.trackId.toString())));
  const trackGenres = trackIds.length > 0
    ? await AudioTrackModel.find({ _id: { $in: trackIds } })
      .select("genre")
      .lean<Array<{ _id: { toString: () => string }; genre?: string }>>()
    : [];

  const genreByTrackId = new Map<string, string>();
  for (const track of trackGenres) {
    genreByTrackId.set(track._id.toString(), track.genre || "kemet");
  }

  const trackScores = new Map<string, number>();
  const genreScores = new Map<string, number>();

  for (const interaction of interactions) {
    const key = interaction.trackId.toString();
    const completionRatio = Math.max(0, Math.min(1, interaction.completionRatio ?? 0));
    const repeatCount = Math.max(0, interaction.repeatCount ?? 0);
    const listenedLong = (interaction.listenDurationMs ?? 0) >= 180000 || completionRatio >= 0.72;
    const delta =
      interaction.interactionType === "like" ? 5.2 :
      interaction.interactionType === "share" ? 6 :
      interaction.interactionType === "complete" ? 4.4 :
      interaction.interactionType === "pause" ? (completionRatio >= 0.45 ? 1.1 : 0.25) :
      interaction.interactionType === "skip" ? -2.6 :
      1;
    const weightedDelta =
      delta *
      (1 + completionRatio * 0.85) *
      (1 + Math.min(repeatCount, 2) * 0.3) *
      (listenedLong ? 1.15 : 1);

    trackScores.set(key, (trackScores.get(key) ?? 0) + weightedDelta);

    const genre = genreByTrackId.get(key);
    if (genre) {
      genreScores.set(genre, (genreScores.get(genre) ?? 0) + weightedDelta);
    }
  }

  const preferredGenres = new Set<string>(
    [...genreScores.entries()]
      .filter(([, score]) => score > 1.5)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([genre]) => genre)
  );

  const genreAffinityByGenre = new Map<string, number>(
    [...genreScores.entries()].map(([genre, score]) => [genre, Math.max(-1.4, Math.min(2.4, score / 8.5))])
  );

  return {
    preferredGenres,
    interactionByTrackId: trackScores,
    genreAffinityByGenre
  };
}

async function getPreferredGenresFromProfile(userId?: string) {
  if (!userId) {
    return new Set<string>();
  }

  const profile = await ProfileModel.findOne({ userId })
    .select("categoryScores")
    .lean<{ categoryScores?: Record<string, number> | Map<string, number> } | null>();
  const rawCategoryScores = profile?.categoryScores;
  const categoryScores = rawCategoryScores
    ? Object.entries(rawCategoryScores instanceof Map ? Object.fromEntries(rawCategoryScores.entries()) : rawCategoryScores)
    : [];

  const topGenres = categoryScores
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre);

  return new Set(topGenres);
}

function rankTracks(
  tracks: EnrichedAudioTrackData[],
  input: {
    interests: Record<string, number>;
    preferredGenres: Set<string>;
    interactionByTrackId: Map<string, number>;
    genreAffinityByGenre: Map<string, number>;
    limit: number;
  }
) {
  const selectedGenres: string[] = [];
  const ranked = [...tracks]
    .map((track) => {
      const engagement = normalizePlayCount(track.playCount);
      const userInterest = computeInterestScore(track, input.interests, input.preferredGenres, input.genreAffinityByGenre);
      const recency = computeRecency(track.createdAt) + (
        track.genre === "spiritual" ? 0.18 :
        track.genre === "ambient" ? 0.14 :
        0
      );
      const priorAffinity = Math.min(1.5, (input.interactionByTrackId.get(track.id) ?? 0) / 5);
      const score =
        (engagement * 2) +
        ((userInterest + priorAffinity) * 10) +
        recency;

      return { track, score };
    })
    .sort((left, right) => right.score - left.score);

  const selectedTracks: EnrichedAudioTrackData[] = [];
  const remaining = [...ranked];

  while (remaining.length > 0 && selectedTracks.length < input.limit) {
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const [index, candidate] of remaining.entries()) {
      const diversity = computeDiversityBonus(selectedGenres, candidate.track.genre);
      const adjustedScore = candidate.score + diversity;

      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestIndex = index;
      }
    }

    const [selected] = remaining.splice(bestIndex, 1);
    selectedGenres.push(selected.track.genre);
    selectedTracks.push(selected.track);
  }

  return selectedTracks;
}

export async function getAudioDiscovery(userId?: string, limitPerSection = 8) {
  const [tracks, interests, profileGenres, audioPreferenceState] = await Promise.all([
    getAudioTracks(120),
    userId ? getUserInterests(userId) : Promise.resolve({}),
    getPreferredGenresFromProfile(userId),
    getUserAudioPreferences(userId)
  ]);

  const enrichedTracks = enrichAudioTracks(tracks);
  const preferredGenres = new Set<string>([
    ...Array.from(profileGenres),
    ...Array.from(audioPreferenceState.preferredGenres)
  ]);

  const rankedForYou = rankTracks(enrichedTracks, {
    interests,
    preferredGenres,
    interactionByTrackId: audioPreferenceState.interactionByTrackId,
    genreAffinityByGenre: audioPreferenceState.genreAffinityByGenre,
    limit: limitPerSection
  });

  const sections: AudioDiscoverySection[] = [
    {
      id: "trending",
      title: "Tendances audio",
      subtitle: "Les pistes qui captent le plus d'ecoute cette semaine.",
      tracks: [...enrichedTracks]
        .sort((a, b) => {
          const leftScore = a.playCount + (a.genre === "spiritual" ? 32 : a.genre === "ambient" ? 26 : 0);
          const rightScore = b.playCount + (b.genre === "spiritual" ? 32 : b.genre === "ambient" ? 26 : 0);
          return rightScore - leftScore || (Date.parse(b.createdAt) - Date.parse(a.createdAt));
        })
        .slice(0, limitPerSection)
    },
    {
      id: "for_you",
      title: "Pour toi",
      subtitle: "Un flux audio ajuste a tes interets, tes completes et tes likes.",
      tracks: rankedForYou
    },
    {
      id: "learn",
      title: "Apprendre en audio",
      subtitle: "Formats pour comprendre, comparer et retenir pendant que tu fais autre chose.",
      tracks: enrichedTracks
        .filter((track) => track.genre === "educational" || track.genre === "debate" || track.typeLabel === "discours")
        .slice(0, limitPerSection)
    },
    {
      id: "relax",
      title: "Relaxation / meditation",
      subtitle: "Pistes lentes, ambiances et respirations pour le mode immersion.",
      tracks: enrichedTracks
        .filter((track) => track.genre === "ambient" || track.genre === "spiritual" || track.typeLabel === "meditation")
        .sort((left, right) => (
          computeImmersionScore(right, preferredGenres, audioPreferenceState.genreAffinityByGenre) -
          computeImmersionScore(left, preferredGenres, audioPreferenceState.genreAffinityByGenre)
        ))
        .slice(0, limitPerSection)
    },
    {
      id: "viral",
      title: "Extraits viraux",
      subtitle: "Formats audio faciles a partager et a reprendre au bon moment.",
      tracks: [...enrichedTracks]
        .sort((a, b) => {
          const leftScore = normalizePlayCount(a.playCount) + (a.duration <= 2100 ? 0.5 : 0);
          const rightScore = normalizePlayCount(b.playCount) + (b.duration <= 2100 ? 0.5 : 0);
          return rightScore - leftScore;
        })
        .slice(0, limitPerSection)
    }
  ];

  const sourceBlueprint = await getAudioSourceBlueprint(Object.keys(interests));

  return {
    sections,
    featuredTrack: rankedForYou[0] ?? sections[0]?.tracks[0] ?? null,
    sourceBlueprint
  };
}
