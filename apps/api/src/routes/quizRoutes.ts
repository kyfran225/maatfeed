import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import {
  getQuizForContent,
  generateQuizForContent,
  batchGenerateQuizzes,
  getUserQuizStats,
  type GeneratedQuiz,
  type QuizQuestion
} from "../services/quizGenerationService.js";
import { LearningProgressModel } from "../models/LearningProgress.js";
import { logger } from "../config/logger.js";

const router = Router();

function getParam(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * GET /api/quiz/content/:contentId
 * Get or generate quiz for specific content
 */
router.get("/content/:contentId", optionalAuth, async (req, res) => {
  try {
    const contentId = getParam(req.params.contentId);
    const { force } = req.query;
    const userId = res.locals.auth?.userId;

    if (!contentId) {
      res.status(400).json({ error: "Invalid contentId" });
      return;
    }

    const quiz = userId
      ? await getQuizForContent(contentId, userId, force === "true")
      : await generateQuizForContent(contentId, force === "true");

    if (!quiz) {
      res.status(404).json({ error: "Could not generate quiz for this content" });
      return;
    }

    res.json(quiz);
  } catch (error) {
    logger.error({
      msg: "Failed to get quiz",
      contentId: req.params.contentId,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to get quiz" });
  }
});

/**
 * POST /api/quiz/content/:contentId/submit
 * Submit quiz answers and get results
 */
router.post("/content/:contentId/submit", requireAuth, async (req, res) => {
  try {
    const contentId = getParam(req.params.contentId);
    const userId = res.locals.auth.userId;
    const { answers } = req.body as { answers: Array<{ questionId: string; answerIndex: number }> };

    if (!contentId) {
      res.status(400).json({ error: "Invalid contentId" });
      return;
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ error: "Invalid answers format" });
      return;
    }

    // Get the quiz
    const quiz = await getQuizForContent(contentId, userId);
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    // Calculate results
    let correctCount = 0;
    const results = answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) {
        return { questionId: answer.questionId, correct: false, error: "Question not found" };
      }

      const isCorrect = question.correctAnswerIndex === answer.answerIndex;
      if (isCorrect) correctCount++;

      return {
        questionId: answer.questionId,
        correct: isCorrect,
        correctAnswer: question.correctAnswerIndex,
        explanation: question.explanation,
        conceptTested: question.conceptTested
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // Update learning progress
    const progress = await LearningProgressModel.findOne({ userId, contentId });
    const newQuizAttempts = (progress?.quizAttempts || 0) + 1;
    const newCorrectAttempts = (progress?.correctQuizAttempts || 0) + correctCount;

    let newStatus = progress?.status || "new";
    let learnedAt = progress?.learnedAt || null;

    // Update status based on quiz performance
    if (score >= 70 && newStatus !== "learned") {
      newStatus = "learned";
      learnedAt = new Date();
    } else if (score < 50 && newStatus === "new") {
      newStatus = "review";
    }

    await LearningProgressModel.findOneAndUpdate(
      { userId, contentId },
      {
        $set: {
          status: newStatus,
          quizAttempts: newQuizAttempts,
          correctQuizAttempts: newCorrectAttempts,
          lastQuizResult: score >= 70,
          lastReviewedAt: new Date(),
          learnedAt: learnedAt,
          quizData: quiz // Store the quiz with user's progress
        }
      },
      { upsert: true }
    );

    // Get updated stats
    const stats = await getUserQuizStats(userId);

    res.json({
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      results,
      status: newStatus,
      stats
    });
  } catch (error) {
    logger.error({
      msg: "Failed to submit quiz",
      contentId: req.params.contentId,
      userId: res.locals.auth?.userId,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

/**
 * GET /api/quiz/stats
 * Get user's quiz statistics
 */
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.auth.userId;
    const stats = await getUserQuizStats(userId);
    res.json(stats);
  } catch (error) {
    logger.error({
      msg: "Failed to get quiz stats",
      userId: res.locals.auth?.userId,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to get quiz stats" });
  }
});

/**
 * POST /api/quiz/batch-generate
 * Admin endpoint to batch generate quizzes for content
 */
router.post("/batch-generate", requireAuth, async (req, res) => {
  try {
    // Check if user is admin (you might want to add proper admin middleware)
    if (res.locals.auth.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { contentIds, concurrency = 3 } = req.body as {
      contentIds: string[];
      concurrency?: number;
    };

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      res.status(400).json({ error: "contentIds array required" });
      return;
    }

    const result = await batchGenerateQuizzes(contentIds, concurrency);
    res.json(result);
  } catch (error) {
    logger.error({
      msg: "Failed to batch generate quizzes",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to batch generate quizzes" });
  }
});

/**
 * GET /api/quiz/daily-challenge
 * Get a daily quiz challenge with mixed content
 */
router.get("/daily-challenge", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.auth.userId;

    // Find content due for review or recently learned
    const dueContent = await LearningProgressModel.find({
      userId,
      status: { $in: ["learned", "review"] },
      nextReviewAt: { $lte: new Date() }
    })
      .limit(3)
      .lean();

    if (dueContent.length === 0) {
      res.json({
        available: false,
        message: "No content ready for review. Explore new content first!"
      });
      return;
    }

    // Get quizzes for each content
    const quizzes = await Promise.all(
      dueContent.map(async progress => {
        const quiz = await getQuizForContent(progress.contentId.toString(), userId);
        return quiz;
      })
    );

    // Combine questions from all quizzes
    const combinedQuestions = quizzes
      .filter((q): q is GeneratedQuiz => q !== null)
      .flatMap(q =>
        q.questions.map(question => ({
          ...question,
          contentId: q.contentId
        }))
      )
      .slice(0, 5); // Limit to 5 questions total

    res.json({
      available: true,
      questionCount: combinedQuestions.length,
      questions: combinedQuestions,
      contentCount: dueContent.length
    });
  } catch (error) {
    logger.error({
      msg: "Failed to get daily challenge",
      userId: res.locals.auth?.userId,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to get daily challenge" });
  }
});

export { router as quizRouter };
