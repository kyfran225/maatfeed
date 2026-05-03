import { Request, Response } from "express";
import mongoose from "mongoose";
import { generateQuizForContent, validateQuizAnswer } from "../services/quizService.js";
import { updateLearningProgress } from "../services/learningProgressService.js";

function assertObjectId(value: string, field: string) {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error(`${field} invalide`);
  }
}

export async function getQuizQuestionController(request: Request, response: Response) {
  try {
    const { contentId } = request.params as { contentId?: string };
    if (!contentId || typeof contentId !== "string") {
      return response.status(400).json({ error: "contentId invalide" });
    }
    assertObjectId(contentId, "contentId");

    const quiz = await generateQuizForContent(contentId);
    if (!quiz) {
      return response.status(404).json({ error: "Impossible de générer une question" });
    }

    // Return question WITHOUT explanation (user needs to answer first)
    return response.json({
      data: {
        contentId: quiz.contentId,
        question: quiz.question,
        options: quiz.options
      }
    });
  } catch (error) {
    console.error("Error getting quiz question:", error);
    return response.status(500).json({ error: "Erreur serveur" });
  }
}

export async function submitQuizAnswerController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      return response.status(401).json({ error: "Non authentifié" });
    }

    const { contentId } = request.params as { contentId?: string };
    if (!contentId || typeof contentId !== "string") {
      return response.status(400).json({ error: "contentId invalide" });
    }
    const { answer, quiz } = request.body;

    if (!answer || !quiz) {
      return response.status(400).json({
        error: "Paramètres manquants : answer, quiz"
      });
    }

    assertObjectId(userId, "userId");
    assertObjectId(contentId, "contentId");

    // Validate the answer
    const result = await validateQuizAnswer(contentId, answer, quiz);

    // Update learning progress based on answer
    await updateLearningProgress({
      userId,
      contentId,
      status: result.correct ? "learned" : "review",
      quizCorrect: result.correct
    });

    return response.json({
      data: {
        correct: result.correct,
        explanation: result.explanation,
        feedback: result.correct
          ? "Très bien ! Tu as compris le point clé."
          : "Bonne tentative. Reviens à ce contenu plus tard."
      }
    });
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    return response.status(500).json({ error: "Erreur serveur" });
  }
}
