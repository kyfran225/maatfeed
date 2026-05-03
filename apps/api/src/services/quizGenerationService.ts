import { ContentModel } from "../models/Content.js";
import { ContentEnrichmentModel } from "../models/ContentEnrichment.js";
import { LearningProgressModel } from "../models/LearningProgress.js";
import { aiRouterService } from "./aiRouterService.js";
import { logger } from "../config/logger.js";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  conceptTested: string;
}

export interface GeneratedQuiz {
  contentId: string;
  questions: QuizQuestion[];
  generatedAt: Date;
  source: "transcript" | "summary" | "metadata";
  estimatedDifficulty: "beginner" | "intermediate" | "advanced";
}

// Quiz generation prompt template
const QUIZ_GENERATION_PROMPT = `Tu es un expert en pédagogie et en culture africaine.
Génère un quiz de 3-5 questions à partir du contenu fourni.

RÈGLES:
1. Questions sur les concepts CLÉS, pas les détails insignifiants
2. Mélange de difficultés: 40% facile, 40% moyen, 20% difficile
3. Questions contextualisées dans la culture africaine
4. Réponses plausibles mais une seule correcte
5. Explications éducatives pour chaque réponse

FORMAT JSON attendu:
{
  "questions": [
    {
      "question": "Question claire et concise",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Explication éducative",
      "difficulty": "easy|medium|hard",
      "conceptTested": "Concept principal testé"
    }
  ],
  "estimatedDifficulty": "beginner|intermediate|advanced",
  "source": "transcript|summary|metadata"
}

CONTENU À ANALYSER:
Titre: {title}
Description: {description}
Transcript/Summary: {content}
Tags: {tags}

Génère uniquement le JSON valide, sans autre texte.`;

/**
 * Generate a contextual quiz from content using AI
 */
export async function generateQuizForContent(
  contentId: string,
  forceRegenerate: boolean = false
): Promise<GeneratedQuiz | null> {
  try {
    // Check if quiz was recently generated
    const existingProgress = await LearningProgressModel.findOne({ contentId });
    
    if (!forceRegenerate && existingProgress?.quizData?.generatedAt) {
      const generatedAt = new Date(existingProgress.quizData.generatedAt);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      if (generatedAt > oneDayAgo) {
        logger.info({ msg: "Using cached quiz", contentId });
        return {
          contentId,
          questions: existingProgress.quizData.questions,
          generatedAt,
          source: existingProgress.quizData.source,
          estimatedDifficulty: existingProgress.quizData.estimatedDifficulty
        };
      }
    }

    // Fetch content and enrichment
    const content = await ContentModel.findById(contentId).lean();
    if (!content) {
      logger.warn({ msg: "Content not found for quiz generation", contentId });
      return null;
    }

    const enrichment = await ContentEnrichmentModel.findOne({ contentId }).lean();

    // Determine best source for quiz generation
    let sourceText: string;
    let source: "transcript" | "summary" | "metadata";

    if (content.transcript && content.transcript.length > 200) {
      sourceText = content.transcript.slice(0, 3000); // Limit to avoid token overflow
      source = "transcript";
    } else if (enrichment?.summary && enrichment.summary.length > 100) {
      sourceText = enrichment.summary;
      source = "summary";
    } else if (content.description && content.description.length > 100) {
      sourceText = content.description;
      source = "metadata";
    } else {
      logger.warn({ msg: "Insufficient content for quiz generation", contentId });
      return null;
    }

    // Build prompt
    const prompt = QUIZ_GENERATION_PROMPT
      .replace("{title}", content.title)
      .replace("{description}", content.description || "")
      .replace("{content}", sourceText)
      .replace("{tags}", content.tags.join(", "));

    // Generate quiz using AI
    const aiResponse = await aiRouterService.routeGeneric({
      prompt,
      provider: "groq", // Use Groq for speed
      temperature: 0.7,
      maxTokens: 2000
    });

    if (!aiResponse || aiResponse.error) {
      logger.error({
        msg: "AI quiz generation failed",
        contentId,
        error: aiResponse?.error
      });
      return null;
    }

    // Parse JSON response
    let quizData: GeneratedQuiz;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("Invalid quiz structure");
      }

      // Add IDs to questions
      quizData = {
        contentId,
        questions: parsed.questions.map((q: QuizQuestion, i: number) => ({
          ...q,
          id: `${contentId}-q${i}`
        })),
        generatedAt: new Date(),
        source,
        estimatedDifficulty: parsed.estimatedDifficulty || "intermediate"
      };
    } catch (parseError) {
      logger.error({
        msg: "Failed to parse quiz JSON",
        contentId,
        content: aiResponse.content,
        error: parseError instanceof Error ? parseError.message : String(parseError)
      });
      return null;
    }

    // Store in learning progress for caching
    await LearningProgressModel.findOneAndUpdate(
      { contentId },
      {
        $set: {
          quizData: {
            questions: quizData.questions,
            generatedAt: quizData.generatedAt,
            source: quizData.source,
            estimatedDifficulty: quizData.estimatedDifficulty
          }
        }
      },
      { upsert: true }
    );

    logger.info({
      msg: "Quiz generated successfully",
      contentId,
      questionCount: quizData.questions.length,
      source,
      difficulty: quizData.estimatedDifficulty
    });

    return quizData;
  } catch (error) {
    logger.error({
      msg: "Quiz generation error",
      contentId,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

/**
 * Get or generate quiz for content
 */
export async function getQuizForContent(
  contentId: string,
  userId: string,
  forceRegenerate: boolean = false
): Promise<GeneratedQuiz | null> {
  // First, check user's learning progress for cached quiz
  const progress = await LearningProgressModel.findOne({
    userId,
    contentId
  });

  if (!forceRegenerate && progress?.quizData?.questions?.length > 0) {
    const generatedAt = new Date(progress.quizData.generatedAt);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Return cached quiz if less than a week old
    if (generatedAt > oneWeekAgo) {
      return {
        contentId,
        questions: progress.quizData.questions,
        generatedAt,
        source: progress.quizData.source,
        estimatedDifficulty: progress.quizData.estimatedDifficulty
      };
    }
  }

  // Generate new quiz
  return generateQuizForContent(contentId, forceRegenerate);
}

/**
 * Generate quizzes for multiple contents in batch
 * Useful for pre-generating quizzes for trending content
 */
export async function batchGenerateQuizzes(
  contentIds: string[],
  concurrency: number = 3
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  // Process in batches to avoid overwhelming AI API
  for (let i = 0; i < contentIds.length; i += concurrency) {
    const batch = contentIds.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map(id => generateQuizForContent(id, false))
    );

    results.forEach(result => {
      if (result.status === "fulfilled" && result.value) {
        success++;
      } else {
        failed++;
      }
    });

    // Small delay between batches
    if (i + concurrency < contentIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  logger.info({
    msg: "Batch quiz generation complete",
    total: contentIds.length,
    success,
    failed
  });

  return { success, failed };
}

/**
 * Get quiz statistics for a user
 */
export async function getUserQuizStats(userId: string): Promise<{
  totalQuizzesTaken: number;
  averageScore: number;
  contentMastered: number;
  currentStreak: number;
}> {
  const progress = await LearningProgressModel.find({
    userId,
    quizAttempts: { $gt: 0 }
  });

  if (progress.length === 0) {
    return {
      totalQuizzesTaken: 0,
      averageScore: 0,
      contentMastered: 0,
      currentStreak: 0
    };
  }

  const totalQuizzesTaken = progress.reduce((sum, p) => sum + (p.quizAttempts || 0), 0);
  const totalCorrect = progress.reduce((sum, p) => sum + (p.correctQuizAttempts || 0), 0);
  const averageScore = totalQuizzesTaken > 0
    ? (totalCorrect / totalQuizzesTaken) * 100
    : 0;

  const contentMastered = progress.filter(p => p.status === "learned").length;

  // Simple streak calculation (consecutive days with quiz activity)
  const recentActivity = progress
    .filter(p => p.lastReviewedAt)
    .sort((a, b) => (b.lastReviewedAt?.getTime() || 0) - (a.lastReviewedAt?.getTime() || 0));

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < recentActivity.length; i++) {
    const activityDate = new Date(recentActivity[i].lastReviewedAt!);
    activityDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === i) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    totalQuizzesTaken,
    averageScore: Math.round(averageScore),
    contentMastered,
    currentStreak
  };
}
