import type { AudioTrackData } from "./audioService.js";

export interface AudioHighlight {
  label: string;
  timeSeconds: number;
}

export interface AudioTrackContext {
  contentId?: string;
  contentRoute?: string;
  debateRoute?: string;
  primaryRoute?: string;
  primaryHref?: string;
  isExternal?: boolean;
  primaryLabel?: string;
}

export interface EnrichedAudioTrackData extends AudioTrackData {
  typeLabel: "musique" | "meditation" | "discours" | "debat audio";
  shortTitle: string;
  simpleDescription: string;
  enrichedTags: string[];
  categoryLabel: string;
  highlightMoments: AudioHighlight[];
  context: AudioTrackContext | null;
}

const genreCategoryLabels: Record<string, string> = {
  kemet: "Culture Kemet",
  spiritual: "Spiritualite",
  educational: "Apprendre en audio",
  debate: "Debat audio",
  ambient: "Mode immersion"
};

function detectTrackType(track: AudioTrackData): EnrichedAudioTrackData["typeLabel"] {
  const haystack = `${track.title} ${track.description ?? ""} ${track.tags.join(" ")}`.toLowerCase();

  if (haystack.includes("meditation") || haystack.includes("ambient") || haystack.includes("soundscape")) {
    return "meditation";
  }

  if (haystack.includes("debate") || haystack.includes("discussion") || haystack.includes("civilization")) {
    return "debat audio";
  }

  if (haystack.includes("music") || haystack.includes("drum") || haystack.includes("chant")) {
    return "musique";
  }

  return "discours";
}

function buildShortTitle(track: AudioTrackData, typeLabel: EnrichedAudioTrackData["typeLabel"]) {
  const compactTitle = track.title.replace(/\s*[-|:]\s*.*/, "").trim();
  if (compactTitle.length <= 44) {
    return compactTitle;
  }

  switch (typeLabel) {
    case "meditation":
      return "Plongee spirituelle Kemet";
    case "debat audio":
      return "Debat audio Kemet";
    case "musique":
      return "Session musicale Kemet";
    default:
      return "Capsule audio Kemet";
  }
}

function buildSimpleDescription(track: AudioTrackData, typeLabel: EnrichedAudioTrackData["typeLabel"]) {
  if (track.description?.trim()) {
    const firstSentence = track.description.trim().split(/[.!?]/)[0]?.trim();
    if (firstSentence) {
      return firstSentence;
    }
  }

  switch (typeLabel) {
    case "meditation":
      return "Une respiration audio pour ralentir, se concentrer et se recentrer.";
    case "debat audio":
      return "Un format long pour creuser, comparer et prendre position.";
    case "musique":
      return "Une vibration sonore pour accompagner le scroll ou la concentration.";
    default:
      return "Une piste audio pour apprendre, ressentir et explorer Kemet autrement.";
  }
}

function buildTags(track: AudioTrackData, typeLabel: EnrichedAudioTrackData["typeLabel"]) {
  const normalized = new Set<string>(track.tags.map((tag) => tag.toLowerCase()));
  normalized.add(track.genre);

  if (typeLabel === "meditation") {
    normalized.add("relaxation");
    normalized.add("immersion");
  }

  if (typeLabel === "debat audio") {
    normalized.add("discussion");
    normalized.add("perspective");
  }

  if (typeLabel === "discours") {
    normalized.add("transmission");
  }

  return Array.from(normalized);
}

function buildHighlightMoments(track: AudioTrackData, typeLabel: EnrichedAudioTrackData["typeLabel"]): AudioHighlight[] {
  const duration = Math.max(60, track.duration || 0);
  const checkpoints = [
    Math.min(45, Math.floor(duration * 0.05)),
    Math.floor(duration * 0.35),
    Math.floor(duration * 0.72)
  ];

  const labelsByType: Record<EnrichedAudioTrackData["typeLabel"], string[]> = {
    musique: ["Mise en vibration", "Pulse central", "Pic d'energie"],
    meditation: ["Entrer dans le calme", "Respiration profonde", "Ancrage final"],
    discours: ["Idee d'ouverture", "Point fort", "A retenir"],
    "debat audio": ["Question de depart", "Argument cle", "Moment de friction"]
  };

  return checkpoints.map((timeSeconds, index) => ({
    label: labelsByType[typeLabel][index] || `Moment ${index + 1}`,
    timeSeconds
  }));
}

function buildContext(track: AudioTrackData): AudioTrackContext | null {
  if (track.contextUrl) {
    return {
      contentId: track.contentId,
      contentRoute: track.contentId ? `/content/${track.contentId}` : undefined,
      debateRoute: track.contentId ? `/debate/${track.contentId}` : undefined,
      primaryHref: track.contextUrl,
      isExternal: true,
      primaryLabel:
        track.contextType === "video" ? (track.contextTitle || "Voir la video source") :
        track.contextType === "debate" ? (track.contextTitle || "Voir le debat associe") :
        track.contextTitle || "Voir le contexte"
    };
  }

  if (!track.contentId) {
    return null;
  }

  const contentRoute = `/content/${track.contentId}`;
  const debateRoute = `/debate/${track.contentId}`;
  const prefersDebateRoute = track.genre === "debate" || track.tags.some((tag) => tag.toLowerCase().includes("debate"));

  return {
    contentId: track.contentId,
    contentRoute,
    debateRoute,
    primaryRoute: prefersDebateRoute ? debateRoute : contentRoute,
    primaryHref: prefersDebateRoute ? debateRoute : contentRoute,
    isExternal: false,
    primaryLabel: prefersDebateRoute ? "Voir le debat associe" : "Voir le contexte"
  };
}

export function enrichAudioTrack(track: AudioTrackData): EnrichedAudioTrackData {
  const typeLabel = detectTrackType(track);

  return {
    ...track,
    typeLabel,
    shortTitle: buildShortTitle(track, typeLabel),
    simpleDescription: buildSimpleDescription(track, typeLabel),
    enrichedTags: buildTags(track, typeLabel),
    categoryLabel: genreCategoryLabels[track.genre] || "Audio Kemet",
    highlightMoments: buildHighlightMoments(track, typeLabel),
    context: buildContext(track)
  };
}

export function enrichAudioTracks(tracks: AudioTrackData[]) {
  return tracks.map(enrichAudioTrack);
}
