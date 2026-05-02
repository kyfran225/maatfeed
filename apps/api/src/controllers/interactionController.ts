import type { Request, Response } from "express";
import { 
  recordLike, 
  recordSave, 
  recordShare, 
  recordWatch, 
  recordComment,
  getContentEngagement 
} from "../services/interactionService.js";

export async function likeContentController(request: Request, response: Response) {
  try {
    const { contentId } = request.body;
    const userId = response.locals.auth?.userId;
    const sessionId = request.headers["x-session-id"] as string | undefined;

    if (!contentId) {
      response.status(400).json({ message: "contentId est requis" });
      return;
    }

    await recordLike({ contentId, userId, sessionId });
    
    response.status(200).json({
      status: "ok",
      action: "liked",
      contentId
    });
  } catch (error) {
    console.error("Like error:", error);
    response.status(500).json({ 
      message: "Échec de l'enregistrement du j'aime",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function saveContentController(request: Request, response: Response) {
  try {
    const { contentId } = request.body;
    const userId = response.locals.auth?.userId;
    const sessionId = request.headers["x-session-id"] as string | undefined;

    if (!contentId) {
      response.status(400).json({ message: "contentId est requis" });
      return;
    }

    await recordSave({ contentId, userId, sessionId });
    
    response.status(200).json({
      status: "ok",
      action: "saved",
      contentId
    });
  } catch (error) {
    console.error("Save error:", error);
    response.status(500).json({ 
      message: "Échec de l'enregistrement de la sauvegarde",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function shareContentController(request: Request, response: Response) {
  try {
    const { contentId } = request.body;
    const userId = response.locals.auth?.userId;
    const sessionId = request.headers["x-session-id"] as string | undefined;

    if (!contentId) {
      response.status(400).json({ message: "contentId est requis" });
      return;
    }

    await recordShare({ contentId, userId, sessionId });
    
    response.status(200).json({
      status: "ok",
      action: "shared",
      contentId
    });
  } catch (error) {
    console.error("Share error:", error);
    response.status(500).json({ 
      message: "Échec de l'enregistrement du partage",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function trackWatchController(request: Request, response: Response) {
  try {
    const { contentId, watchDurationMs, completionRatio } = request.body;
    const userId = response.locals.auth?.userId;
    const sessionId = request.headers["x-session-id"] as string | undefined;

    if (!contentId || typeof watchDurationMs !== "number" || typeof completionRatio !== "number") {
      response.status(400).json({ 
        message: "contentId, watchDurationMs, et completionRatio sont requis" 
      });
      return;
    }

    await recordWatch({ 
      contentId, 
      userId, 
      sessionId,
      watchDurationMs,
      completionRatio
    });
    
    response.status(200).json({
      status: "ok",
      action: "watch_tracked",
      contentId,
      watchDurationMs,
      completionRatio
    });
  } catch (error) {
    console.error("Watch tracking error:", error);
    response.status(500).json({ 
      message: "Échec du suivi de la lecture",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function getEngagementController(request: Request, response: Response) {
  try {
    const contentId = Array.isArray(request.params.contentId) ? request.params.contentId[0] : request.params.contentId;
    const userId = response.locals.auth?.userId;

    if (!contentId) {
      response.status(400).json({ message: "contentId est requis" });
      return;
    }

    const engagement = await getContentEngagement(contentId, userId);

    response.status(200).json({
      status: "ok",
      contentId,
      engagement
    });
  } catch (error) {
    console.error("Get engagement error:", error);
    response.status(500).json({
      message: "Échec de la récupération de l'engagement",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
