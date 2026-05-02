import type { Request, Response } from "express";
import { ZodError, z } from "zod";
import { recordAudioInteraction } from "../services/audioInteractionService.js";

const audioInteractionSchema = z.object({
  trackId: z.string().min(1, "trackId is required"),
  contentId: z.string().min(1).optional(),
  interactionType: z.enum(["play", "pause", "complete", "skip", "like", "share"]),
  listenDurationMs: z.number().min(0).optional(),
  stopPositionSeconds: z.number().min(0).optional(),
  trackDurationSeconds: z.number().min(0).optional(),
  completionRatio: z.number().min(0).max(1).optional(),
  repeatCount: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional()
});

export async function createAudioInteractionController(request: Request, response: Response) {
  try {
    const parsed = audioInteractionSchema.parse(request.body);
    const userId = response.locals.auth?.userId;
    const sessionId = request.headers["x-session-id"] as string | undefined;

    await recordAudioInteraction({
      ...parsed,
      userId,
      sessionId
    });

    response.status(200).json({
      success: true,
      data: {
        trackId: parsed.trackId,
        interactionType: parsed.interactionType
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Audio interaction error:", error);

    if (error instanceof ZodError) {
      return response.status(400).json({
        success: false,
        error: "Invalid audio interaction payload",
        details: error.flatten()
      });
    }

    response.status(500).json({
      success: false,
      error: "Failed to record audio interaction"
    });
  }
}
