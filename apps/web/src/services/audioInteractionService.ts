import { postJson } from "./httpClient";

export type AudioInteractionType = "play" | "pause" | "complete" | "skip" | "like" | "share";

export interface AudioInteractionPayload {
  trackId: string;
  contentId?: string;
  interactionType: AudioInteractionType;
  listenDurationMs?: number;
  stopPositionSeconds?: number;
  trackDurationSeconds?: number;
  completionRatio?: number;
  repeatCount?: number;
  metadata?: Record<string, unknown> | null;
}

interface AudioInteractionResponse {
  success: boolean;
  data: {
    trackId: string;
    interactionType: AudioInteractionType;
  };
  meta: {
    timestamp: string;
  };
}

const SESSION_STORAGE_KEY = "maat.audio.sessionId";

function getAudioSessionId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const generated =
    window.crypto?.randomUUID?.() ?? `audio-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

export async function trackAudioInteraction(payload: AudioInteractionPayload) {
  const sessionId = getAudioSessionId();

  return postJson<AudioInteractionResponse>("/api/audio/interaction", payload, {
    headers: sessionId ? { "x-session-id": sessionId } : undefined
  });
}
