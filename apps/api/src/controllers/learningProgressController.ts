import type { Request, Response } from "express";
import {
  coachLearning,
  getLearningSummary,
  listLearningProgress,
  logCorrectionSuggestion,
  recordCorrectionFeedback,
  updateLearningProgress
} from "../services/learningProgressService.js";
import type { LearningProgressStatus } from "../models/LearningProgress.js";

const allowedStatuses: LearningProgressStatus[] = ["new", "learned", "review"];

export async function listLearningProgressController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      response.status(401).json({ message: "Authentification requise" });
      return;
    }

    const rawContentIds = typeof request.query.contentIds === "string" ? request.query.contentIds : "";
    const contentIds = rawContentIds.split(",").map((id) => id.trim()).filter(Boolean);
    const [items, summary] = await Promise.all([
      listLearningProgress(userId, contentIds),
      getLearningSummary(userId)
    ]);

    response.status(200).json({
      status: "ok",
      data: {
        items,
        summary
      }
    });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Impossible de charger la progression"
    });
  }
}

export async function updateLearningProgressController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      response.status(401).json({ message: "Authentification requise" });
      return;
    }

    const { contentId, status, quizCorrect } = request.body as {
      contentId?: string;
      status?: LearningProgressStatus;
      quizCorrect?: boolean;
    };

    if (!contentId || !status || !allowedStatuses.includes(status)) {
      response.status(400).json({
        message: "contentId et status valide sont requis"
      });
      return;
    }

    const progress = await updateLearningProgress({
      userId,
      contentId,
      status,
      quizCorrect
    });
    const summary = await getLearningSummary(userId);

    response.status(200).json({
      status: "ok",
      data: {
        progress,
        summary
      }
    });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Impossible d'enregistrer la progression"
    });
  }
}

export async function coachLearningController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      response.status(401).json({ message: "Authentification requise" });
      return;
    }

    const { answer, contextTitle, contextDescription } = request.body as {
      answer?: string;
      contextTitle?: string;
      contextDescription?: string;
    };

    if (!answer || answer.trim().length < 12) {
      response.status(400).json({
        message: "Écris au moins une phrase à corriger"
      });
      return;
    }

    const suggestionId = await logCorrectionSuggestion(userId, answer, contextTitle, contextDescription);
    const coaching = await coachLearning({
      answer,
      contextTitle,
      contextDescription
    });

    response.status(200).json({
      status: "ok",
      data: {
        ...coaching,
        suggestionId
      }
    });
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : "Impossible de corriger cette réponse"
    });
  }
}

export async function recordCorrectionFeedbackController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      response.status(401).json({ message: "Authentification requise" });
      return;
    }

    const { suggestionId, accepted } = request.body as {
      suggestionId?: string;
      accepted?: boolean;
    };

    if (!suggestionId || typeof accepted !== "boolean") {
      response.status(400).json({ message: "suggestionId et accepted sont requis" });
      return;
    }

    const result = await recordCorrectionFeedback(userId, suggestionId, accepted);
    response.status(200).json({ status: "ok", data: result });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Impossible d'enregistrer le feedback"
    });
  }
}
