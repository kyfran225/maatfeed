import { ProfileModel } from "../models/Profile.js";
import { ContentModel } from "../models/Content.js";
import { InteractionModel } from "../models/Interaction.js";

export interface UserInterestVector {
  [topic: string]: number;
}

export async function getUserInterests(userId: string): Promise<UserInterestVector> {
  // Get user profile with explicit interests
  const profile = await ProfileModel.findOne({ userId });
  const explicitInterests = (profile?.toObject()?.interests as Record<string, number>) || {};

  // Extract interests from interaction history
  const interactionInterests = await extractInterestsFromInteractions(userId);

  // Combine explicit and implicit interests with weights
  const combinedInterests: UserInterestVector = {};

  // Explicit interests have higher weight (user explicitly set these)
  Object.entries(explicitInterests).forEach(([topic, score]) => {
    combinedInterests[topic] = (combinedInterests[topic] || 0) + (score as number) * 2;
  });

  // Implicit interests from behavior (lower weight but still valuable)
  Object.entries(interactionInterests).forEach(([topic, score]) => {
    combinedInterests[topic] = (combinedInterests[topic] || 0) + score * 0.5;
  });

  return combinedInterests;
}

async function extractInterestsFromInteractions(userId: string): Promise<UserInterestVector> {
  // Get user's recent interactions (last 100 interactions)
  const recentInteractions = await InteractionModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100);

  const interests: UserInterestVector = {};

  for (const interaction of recentInteractions) {
    // Get the content for this interaction
    const content = await ContentModel.findById(interaction.contentId);
    if (!content || content.processingStatus !== "published") continue;

    // Extract tags and topics from content
    const topics = [...content.tags];

    // Add classification bucket as a topic
    if (content.bucket) {
      topics.push(content.bucket);
    }

    // Weight topics based on interaction type
    let weight = 1;
    switch (interaction.actionType) {
      case "like":
        weight = 2;
        break;
      case "save":
        weight = 3;
        break;
      case "comment":
        weight = 4;
        break;
      case "reply":
        weight = 4;
        break;
      case "share":
        weight = 5;
        break;
      case "view":
        // For views, consider completion ratio
        weight = 0.5 + (interaction.completionRatio || 0) * 1.5;
        break;
    }

    // Apply time decay (older interactions have less influence)
    const daysSinceInteraction = (Date.now() - interaction.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const timeDecay = Math.exp(-daysSinceInteraction / 30); // 30-day half-life
    const finalWeight = weight * timeDecay;

    // Update interests
    topics.forEach(topic => {
      if (typeof topic === "string" && topic.trim()) {
        interests[topic.trim()] = (interests[topic.trim()] || 0) + finalWeight;
      }
    });
  }

  return interests;
}

export async function updateUserInterests(userId: string, newInterests: UserInterestVector) {
  await ProfileModel.findOneAndUpdate(
    { userId },
    { 
      $set: { 
        interests: newInterests,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
}

export function getTopInterests(interests: UserInterestVector, limit = 10): Array<{topic: string, score: number}> {
  return Object.entries(interests)
    .map(([topic, score]) => ({ topic, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
