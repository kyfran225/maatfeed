import { AudioInteractionModel } from "../models/AudioInteraction.js";
import { AudioTrackModel } from "../models/AudioTrack.js";

export type AudioInteractionType = "play" | "pause" | "complete" | "skip" | "like" | "share";

export interface RecordAudioInteractionInput {
  userId?: string;
  sessionId?: string;
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

export async function recordAudioInteraction(input: RecordAudioInteractionInput) {
  const interaction = await AudioInteractionModel.create({
    userId: input.userId ?? null,
    sessionId: input.sessionId ?? null,
    trackId: input.trackId,
    contentId: input.contentId ?? null,
    interactionType: input.interactionType,
    listenDurationMs: input.listenDurationMs ?? 0,
    stopPositionSeconds: input.stopPositionSeconds ?? 0,
    trackDurationSeconds: input.trackDurationSeconds ?? 0,
    completionRatio: input.completionRatio ?? 0,
    repeatCount: input.repeatCount ?? 0,
    metadata: input.metadata ?? null
  });

  if (input.interactionType === "play" && (input.stopPositionSeconds ?? 0) <= 1.5) {
    await AudioTrackModel.findByIdAndUpdate(input.trackId, {
      $inc: { playCount: 1 }
    });
  }

  return interaction;
}
