import mongoose from "mongoose";
import { env } from "../config/env.js";
import { UserModel } from "../models/User.js";
import { ContentModel } from "../models/Content.js";
import { AudioTrackModel } from "../models/AudioTrack.js";
import { LearningProgressModel } from "../models/LearningProgress.js";
import { InteractionModel } from "../models/Interaction.js";
import { AudioInteractionModel } from "../models/AudioInteraction.js";

async function seedLearningAnalytics() {
  console.log("🚀 Démarrage du seeding learning analytics...");

  await mongoose.connect(env.MONGODB_URI);
  console.log("Connecté à MongoDB", mongoose.connection.name);

  const users = await UserModel.find().limit(6).lean();
  const contents = await ContentModel.find().limit(8).lean();
  const tracks = await AudioTrackModel.find().limit(5).lean();

  if (users.length === 0) {
    throw new Error("Aucun utilisateur trouvé pour le seeding");
  }
  if (contents.length === 0) {
    throw new Error("Aucun contenu trouvé pour le seeding");
  }
  if (tracks.length === 0) {
    throw new Error("Aucune piste audio trouvée pour le seeding");
  }

  const now = new Date();
  const reviewOffset = 2 * 24 * 60 * 60 * 1000;

  console.log(`Utilisateurs trouvés: ${users.length}, contenus: ${contents.length}, pistes: ${tracks.length}`);

  for (let index = 0; index < Math.min(users.length, 5); index += 1) {
    const user = users[index];
    const userContents = contents.slice(index, index + 4);

    for (let contentIndex = 0; contentIndex < userContents.length; contentIndex += 1) {
      const content = userContents[contentIndex];
      const status = contentIndex % 2 === 0 ? "learned" : "review";
      const quizAttempts = 1 + contentIndex;
      const correctQuizAttempts = status === "learned" ? quizAttempts : Math.max(0, quizAttempts - 1);
      const lastReviewedAt = new Date(now.getTime() - reviewOffset * (contentIndex + 1));
      const nextReviewAt = status === "review" ? new Date(lastReviewedAt.getTime() + 1 * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const learnedAt = status === "learned" ? new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) : null;

      await LearningProgressModel.findOneAndUpdate(
        { userId: user._id, contentId: content._id },
        {
          userId: user._id,
          contentId: content._id,
          status,
          quizAttempts,
          correctQuizAttempts,
          lastQuizResult: status === "learned",
          lastReviewedAt,
          nextReviewAt,
          learnedAt
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  const correctionContent = contents[0];
  const correctionUser = users[0];
  await InteractionModel.create([
    {
      userId: correctionUser._id,
      contentId: correctionContent._id,
      actionType: "correction",
      engagedWith: true,
      metadata: { source: "ai_coach", accepted: true }
    },
    {
      userId: correctionUser._id,
      contentId: correctionContent._id,
      actionType: "correction",
      engagedWith: false,
      metadata: { source: "ai_coach", accepted: false }
    }
  ]);

  for (let index = 0; index < Math.min(users.length, tracks.length); index += 1) {
    const user = users[index];
    const track = tracks[index];
    const durationSeconds = track.durationSeconds || 180;
    const listenDurationMs = Math.min(durationSeconds * 1000, 120000);

    await AudioInteractionModel.create({
      userId: user._id,
      trackId: track._id,
      contentId: track.contentId ?? null,
      interactionType: "play",
      listenDurationMs: listenDurationMs,
      stopPositionSeconds: listenDurationMs / 1000,
      trackDurationSeconds: durationSeconds,
      completionRatio: listenDurationMs / (durationSeconds * 1000),
      repeatCount: 0,
      metadata: { seededAnalytics: true }
    });

    await AudioInteractionModel.create({
      userId: user._id,
      trackId: track._id,
      contentId: track.contentId ?? null,
      interactionType: "complete",
      listenDurationMs: durationSeconds * 1000,
      stopPositionSeconds: durationSeconds,
      trackDurationSeconds: durationSeconds,
      completionRatio: 1,
      repeatCount: 0,
      metadata: { seededAnalytics: true }
    });
  }

  console.log("✅ Seeding learning analytics terminé.");
  await mongoose.disconnect();
  console.log("Déconnecté de MongoDB");
}

seedLearningAnalytics().catch((error) => {
  console.error("❌ Erreur pendant le seeding learning analytics:", error);
  process.exit(1);
});
