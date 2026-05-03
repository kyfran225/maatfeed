import mongoose from "mongoose";
import {
  LearningProgressModel,
  type LearningProgressDocument,
  type LearningProgressStatus
} from "../models/LearningProgress.js";
import { ContentModel } from "../models/Content.js";
import { generateWithAIRouter } from "./aiRouterService.js";

export type LearningProgressDTO = {
  contentId: string;
  status: LearningProgressStatus;
  quizAttempts: number;
  correctQuizAttempts: number;
  lastQuizResult: boolean | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  learnedAt: string | null;
  updatedAt: string;
};

export type LearningSummaryDTO = {
  learned: number;
  review: number;
  dueForReview: number;
  total: number;
};

export type UpdateLearningProgressInput = {
  userId: string;
  contentId: string;
  status: LearningProgressStatus;
  quizCorrect?: boolean;
};

export type LearningCoachInput = {
  answer: string;
  contextTitle?: string;
  contextDescription?: string;
};

export type LearningCoachDTO = {
  feedback: string;
  gap: string;
  nextQuestion: string;
};

function assertObjectId(value: string, field: string) {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error(`${field} invalide`);
  }
}

function toDTO(progress: LearningProgressDocument): LearningProgressDTO {
  return {
    contentId: progress.contentId.toString(),
    status: progress.status,
    quizAttempts: progress.quizAttempts,
    correctQuizAttempts: progress.correctQuizAttempts,
    lastQuizResult: progress.lastQuizResult ?? null,
    lastReviewedAt: progress.lastReviewedAt?.toISOString() ?? null,
    nextReviewAt: progress.nextReviewAt?.toISOString() ?? null,
    learnedAt: progress.learnedAt?.toISOString() ?? null,
    updatedAt: progress.updatedAt.toISOString()
  };
}

function nextReviewDate(status: LearningProgressStatus, now: Date) {
  const next = new Date(now);

  if (status === "review") {
    next.setDate(next.getDate() + 1);
    return next;
  }

  if (status === "learned") {
    next.setDate(next.getDate() + 7);
    return next;
  }

  return null;
}

export async function listLearningProgress(userId: string, contentIds: string[]) {
  assertObjectId(userId, "userId");

  const validContentIds = Array.from(new Set(contentIds.filter((id) => mongoose.isValidObjectId(id))));

  if (validContentIds.length === 0) {
    return [];
  }

  const records = await LearningProgressModel.find({
    userId,
    contentId: { $in: validContentIds }
  }).lean<LearningProgressDocument[]>();

  return records.map(toDTO);
}

export async function getLearningSummary(userId: string): Promise<LearningSummaryDTO> {
  assertObjectId(userId, "userId");

  const now = new Date();
  const [learned, review, dueForReview, total] = await Promise.all([
    LearningProgressModel.countDocuments({ userId, status: "learned" }),
    LearningProgressModel.countDocuments({ userId, status: "review" }),
    LearningProgressModel.countDocuments({
      userId,
      nextReviewAt: { $ne: null, $lte: now }
    }),
    LearningProgressModel.countDocuments({ userId })
  ]);

  return { learned, review, dueForReview, total };
}

export async function updateLearningProgress(input: UpdateLearningProgressInput) {
  assertObjectId(input.userId, "userId");
  assertObjectId(input.contentId, "contentId");

  const contentExists = await ContentModel.exists({ _id: input.contentId });
  if (!contentExists) {
    throw new Error("Contenu introuvable");
  }

  const now = new Date();
  const nextReviewAt = nextReviewDate(input.status, now);
  const quizAttemptIncrement = typeof input.quizCorrect === "boolean" ? 1 : 0;
  const correctIncrement = input.quizCorrect === true ? 1 : 0;

  const progress = await LearningProgressModel.findOneAndUpdate(
    {
      userId: input.userId,
      contentId: input.contentId
    },
    {
      $set: {
        status: input.status,
        lastQuizResult: input.quizCorrect ?? null,
        lastReviewedAt: now,
        nextReviewAt,
        learnedAt: input.status === "learned" ? now : null
      },
      $inc: {
        quizAttempts: quizAttemptIncrement,
        correctQuizAttempts: correctIncrement
      }
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).lean<LearningProgressDocument>();

  if (!progress) {
    throw new Error("Progression non enregistrée");
  }

  return toDTO(progress);
}

function parseCoachResponse(text: string): LearningCoachDTO {
  try {
    const parsed = JSON.parse(text) as Partial<LearningCoachDTO>;
    return {
      feedback: typeof parsed.feedback === "string" && parsed.feedback.trim()
        ? parsed.feedback.trim()
        : "Ton idée est compréhensible, mais elle peut être plus précise.",
      gap: typeof parsed.gap === "string" && parsed.gap.trim()
        ? parsed.gap.trim()
        : "Il manque le lien entre l'idée et un exemple concret.",
      nextQuestion: typeof parsed.nextQuestion === "string" && parsed.nextQuestion.trim()
        ? parsed.nextQuestion.trim()
        : "Quel exemple rendrait ton explication plus solide ?"
    };
  } catch {
    return {
      feedback: "Ton idée est compréhensible, mais elle peut être plus précise.",
      gap: "Il manque le lien entre l'idée et un exemple concret.",
      nextQuestion: "Quel exemple rendrait ton explication plus solide ?"
    };
  }
}

export async function coachLearning(input: LearningCoachInput): Promise<LearningCoachDTO> {
  const answer = input.answer.trim().slice(0, 1200);
  const contextTitle = input.contextTitle?.trim().slice(0, 220) || "Sujet MAATFEED";
  const contextDescription = input.contextDescription?.trim().slice(0, 800) || "";

  try {
    const generated = await generateWithAIRouter({
      fast: true,
      jsonMode: true,
      temperature: 0.25,
      maxTokens: 220,
      systemPrompt: [
        "Tu es un coach discret dans MAATFEED.",
        "Tu ne dois pas faire un cours.",
        "Tu corriges une formulation d'utilisateur en français, de façon courte, utile et non scolaire.",
        "Réponds uniquement en JSON valide avec les clés feedback, gap, nextQuestion.",
        "feedback: une phrase courte.",
        "gap: une lacune ou confusion probable, une phrase courte.",
        "nextQuestion: une question simple qui aide à préciser."
      ].join("\n"),
      userPrompt: [
        `Sujet: ${contextTitle}`,
        contextDescription ? `Contexte: ${contextDescription}` : "",
        `Réponse utilisateur: ${answer}`
      ].filter(Boolean).join("\n\n")
    });

    return parseCoachResponse(generated.text);
  } catch {
    return {
      feedback: "Ton idée tient, mais elle gagnerait à être plus nette.",
      gap: "Le point faible est le manque d'exemple ou de cause précise.",
      nextQuestion: "Qu'est-ce qui te fait dire ça, concrètement ?"
    };
  }
}
