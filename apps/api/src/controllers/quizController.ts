import { Request, Response } from "express";
import mongoose from "mongoose";
import { generateQuizForContent, validateQuizAnswer, generateRecapQuiz, RecapQuizDTO } from "../services/quizService.js";
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

// Recap quiz - based on multiple recently learned content
export async function getRecapQuizController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      return response.status(401).json({ error: "Non authentifié" });
    }

    const { contentIds } = request.query;
    if (!contentIds || typeof contentIds !== "string") {
      return response.status(400).json({ error: "Paramètre contentIds requis (comma-separated)" });
    }

    const ids = contentIds.split(",").filter(id => mongoose.isValidObjectId(id.trim()));
    if (ids.length < 2) {
      return response.status(400).json({ error: "Au moins 2 contenus valides requis" });
    }

    const quiz = await generateRecapQuiz(ids.slice(0, 5));
    if (!quiz) {
      return response.status(404).json({ error: "Impossible de générer un récap" });
    }

    // Return without correct answer info
    return response.json({
      data: {
        contentIds: quiz.contentIds,
        contentTitles: quiz.contentTitles,
        question: quiz.question,
        options: quiz.options
      }
    });
  } catch (error) {
    console.error("Error getting recap quiz:", error);
    return response.status(500).json({ error: "Erreur serveur" });
  }
}

// Validate recap quiz answer
export async function submitRecapQuizAnswerController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      return response.status(401).json({ error: "Non authentifié" });
    }

    const { answer, quiz } = request.body;
    if (!answer || !quiz || !quiz.contentIds || !Array.isArray(quiz.contentIds)) {
      return response.status(400).json({ error: "Paramètres manquants" });
    }

    // Re-generate to get correct answer (or we could cache it)
    // For now, re-generate - in production, cache the correct answer server-side
    const fullQuiz = await generateRecapQuiz(quiz.contentIds);
    if (!fullQuiz) {
      return response.status(404).json({ error: "Quiz expiré" });
    }

    const selectedIndex = fullQuiz.options.indexOf(answer);
    const isCorrect = selectedIndex >= 0; // All options are valid in recap, just track engagement

    // Update progress for all contents in the recap
    await Promise.all(quiz.contentIds.map((contentId: string) =>
      updateLearningProgress({
        userId,
        contentId,
        status: "learned",
        quizCorrect: isCorrect
      }).catch(() => null)
    ));

    return response.json({
      data: {
        correct: isCorrect,
        explanation: fullQuiz.explanation,
        feedback: "Merci pour ta réponse ! Continue à explorer."
      }
    });
  } catch (error) {
    console.error("Error submitting recap quiz answer:", error);
    return response.status(500).json({ error: "Erreur serveur" });
  }
}
