import { LearningProgressModel } from "../models/LearningProgress.js";
import { UserModel, type IUser } from "../models/User.js";
import { InteractionModel } from "../models/Interaction.js";
import { ContentModel } from "../models/Content.js";
import { AudioTrackModel } from "../models/AudioTrack.js";
import { AudioInteractionModel } from "../models/AudioInteraction.js";
import mongoose from "mongoose";

export interface RetentionMetric {
  totalUsers: number;
  activeAtDay7: number;
  retentionRate: number; // percentage
}

export interface ContentReplayMetric {
  totalContentViewed: number;
  contentReplayedForReview: number;
  averageReplayCount: number;
  replayRate: number; // percentage
}

export interface CorrectionsMetric {
  totalCorrections: number;
  correctionsAccepted: number;
  acceptanceRate: number; // percentage
}

export interface AudioCompletionMetric {
  totalAudioStarted: number;
  totalAudioCompleted: number;
  completionRate: number; // percentage
  averageListenDuration: number; // in seconds
}

export interface AnalyticsOverviewDTO {
  retention: RetentionMetric;
  contentReplay: ContentReplayMetric;
  corrections: CorrectionsMetric;
  audioCompletion: AudioCompletionMetric;
  timestamp: string;
}

export interface AdminDashboardDTO {
  totals: {
    users: number;
    verifiedUsers: number;
    contentItems: number;
    audioTracks: number;
  };
  reviewMetrics: {
    contentInReview: number;
    dueForReview: number;
  };
  overview: AnalyticsOverviewDTO;
}

export interface UserLearningProgressDTO {
  userId: string;
  createdAt: string;
  daysSinceSignup: number;
  isActiveAtDay7: boolean;
  contentCount: number;
  reviewCount: number;
  learnedCount: number;
  quizAccuracy: number; // percentage
  audioTracksCompleted: number;
}

/**
 * Calcule les métriques de rétention à J7
 * Retourne le nombre d'utilisateurs actifs 7 jours après leur inscription
 */
async function calculateRetentionMetric(): Promise<RetentionMetric> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Utilisateurs créés avant J7
  const totalUsers = await UserModel.countDocuments({
    createdAt: { $lte: sevenDaysAgo }
  });

  // Utilisateurs actifs à J7 (ont interagi après J7)
  const activeAtDay7 = await UserModel.countDocuments({
    createdAt: { $lte: sevenDaysAgo },
    updatedAt: { $gte: sevenDaysAgo }
  });

  const retentionRate = totalUsers > 0 ? (activeAtDay7 / totalUsers) * 100 : 0;

  return {
    totalUsers,
    activeAtDay7,
    retentionRate: Math.round(retentionRate * 100) / 100
  };
}

/**
 * Calcule les métriques de contenu repris (révision)
 */
async function calculateContentReplayMetric(): Promise<ContentReplayMetric> {
  const totalContentViewed = await LearningProgressModel.countDocuments({
    status: { $in: ["learned", "review"] }
  });

  const contentReplayedForReview = await LearningProgressModel.countDocuments({
    status: "review"
  });

  const replayAgg = await LearningProgressModel.aggregate([
    {
      $match: { status: "review" }
    },
    {
      $group: {
        _id: "$contentId",
        replayCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        avgReplayCount: { $avg: "$replayCount" }
      }
    }
  ]);

  const averageReplayCount = replayAgg[0]?.avgReplayCount || 0;
  const replayRate = totalContentViewed > 0 ? (contentReplayedForReview / totalContentViewed) * 100 : 0;

  return {
    totalContentViewed,
    contentReplayedForReview,
    averageReplayCount: Math.round(averageReplayCount * 100) / 100,
    replayRate: Math.round(replayRate * 100) / 100
  };
}

/**
 * Calcule les métriques de correction IA utilisée
 * Basé sur les InteractionModel avec type "correction" acceptée
 */
async function calculateCorrectionsMetric(): Promise<CorrectionsMetric> {
  const totalCorrections = await InteractionModel.countDocuments({
    actionType: "correction"
  });

  const correctionsAccepted = await InteractionModel.countDocuments({
    actionType: "correction",
    engagedWith: true
  });

  const acceptanceRate = totalCorrections > 0 ? (correctionsAccepted / totalCorrections) * 100 : 0;

  return {
    totalCorrections,
    correctionsAccepted,
    acceptanceRate: Math.round(acceptanceRate * 100) / 100
  };
}

/**
 * Calcule les métriques de complétion audio
 */
async function calculateAudioCompletionMetric(): Promise<AudioCompletionMetric> {
  const totalAudioStarted = await AudioInteractionModel.countDocuments({
    interactionType: "play"
  });

  const totalAudioCompleted = await AudioInteractionModel.countDocuments({
    interactionType: "complete"
  });

  const completionRate = totalAudioStarted > 0 ? (totalAudioCompleted / totalAudioStarted) * 100 : 0;

  // Durée moyenne d'écoute (en secondes)
  const avgDurationAgg = await AudioInteractionModel.aggregate([
    {
      $match: { interactionType: "complete" }
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: "$listenDurationMs" }
      }
    }
  ]);

  const averageListenDuration = avgDurationAgg[0]?.avgDuration || 0;

  return {
    totalAudioStarted,
    totalAudioCompleted,
    completionRate: Math.round(completionRate * 100) / 100,
    averageListenDuration: Math.round(averageListenDuration / 1000)
  };
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardDTO> {
  const overview = await calculateAnalyticsOverview();
  const [users, verifiedUsers, contentItems, audioTracks, contentInReview, dueForReview] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ trustLevel: { $in: ["verified", "contributor", "trusted"] } }),
    ContentModel.countDocuments(),
    AudioTrackModel.countDocuments(),
    LearningProgressModel.countDocuments({ status: "review" }),
    LearningProgressModel.countDocuments({ nextReviewAt: { $ne: null, $lte: new Date() } })
  ]);

  return {
    totals: {
      users,
      verifiedUsers,
      contentItems,
      audioTracks
    },
    reviewMetrics: {
      contentInReview,
      dueForReview
    },
    overview
  };
}

/**
 * Calcule les métriques complètes d'apprentissage
 */
export async function calculateAnalyticsOverview(): Promise<AnalyticsOverviewDTO> {
  const [retention, contentReplay, corrections, audioCompletion] = await Promise.all([
    calculateRetentionMetric(),
    calculateContentReplayMetric(),
    calculateCorrectionsMetric(),
    calculateAudioCompletionMetric()
  ]);

  return {
    retention,
    contentReplay,
    corrections,
    audioCompletion,
    timestamp: new Date().toISOString()
  };
}

/**
 * Récupère la progression d'apprentissage d'un utilisateur spécifique
 */
export async function getUserLearningProgress(userId: string): Promise<UserLearningProgressDTO> {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  const user = await UserModel.findById(userId).lean<IUser>();
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const daysSinceSignup = Math.floor((now.getTime() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000));
  const isActiveAtDay7 = daysSinceSignup >= 7 && user.updatedAt.getTime() > new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).getTime();

  const contentProgress = await LearningProgressModel.find({ userId }).lean();
  const contentCount = contentProgress.length;
  const reviewCount = contentProgress.filter((p) => p.status === "review").length;
  const learnedCount = contentProgress.filter((p) => p.status === "learned").length;

  // Calcul de la précision du quiz
  const totalQuizAttempts = contentProgress.reduce((sum, p) => sum + p.quizAttempts, 0);
  const correctQuizAttempts = contentProgress.reduce((sum, p) => sum + p.correctQuizAttempts, 0);
  const quizAccuracy = totalQuizAttempts > 0 ? (correctQuizAttempts / totalQuizAttempts) * 100 : 0;

  // Pistes audio complétées
  const audioTracksCompleted = await AudioInteractionModel.countDocuments({
    userId,
    interactionType: "complete"
  });

  return {
    userId: userId.toString(),
    createdAt: user.createdAt.toISOString(),
    daysSinceSignup,
    isActiveAtDay7,
    contentCount,
    reviewCount,
    learnedCount,
    quizAccuracy: Math.round(quizAccuracy * 100) / 100,
    audioTracksCompleted
  };
}

/**
 * Récupère les users avec les plus hauts taux de rétention
 */
export async function getTopRetentionUsers(limit: number = 10): Promise<UserLearningProgressDTO[]> {
  const users = await UserModel.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean<(IUser & { _id: mongoose.Types.ObjectId })[]>();

  const userProgresses = await Promise.all(
    users.map((u) => getUserLearningProgress(u._id.toString()))
  );

  // Trier par jours depuis inscription décroissant
  return userProgresses.sort((a, b) => b.daysSinceSignup - a.daysSinceSignup);
}
