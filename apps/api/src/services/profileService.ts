import { ProfileModel } from "../models/Profile.js";
import { updateUserInterests, getUserInterests, UserInterestVector } from "./interestService.js";
import { InteractionModel } from "../models/Interaction.js";

export interface ProfileUpdateData {
  preferences?: {
    contentMix?: {
      viral: number;
      educational: number;
      deep: number;
    };
    mutedTopics?: string[];
    preferredLanguages?: string[];
  };
  interests?: UserInterestVector;
}

export async function getProfile(userId: string) {
  const profile = await ProfileModel.findOne({ userId });
  const interests = await getUserInterests(userId);
  
  return {
    profile: profile?.toObject() || null,
    interests,
    combinedData: {
      ...profile?.toObject(),
      interests
    }
  };
}

export async function updatePreferences(userId: string, preferences: ProfileUpdateData['preferences']) {
  await ProfileModel.findOneAndUpdate(
    { userId },
    { 
      $set: { 
        preferences,
        updatedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
}

export async function updateInterestVector(userId: string) {
  // Get current interests from interactions
  const currentInterests = await getUserInterests(userId);
  
  // Update profile with new interest vector
  await updateUserInterests(userId, currentInterests);
  
  return currentInterests;
}

export async function getSavedContent(userId: string, cursor?: string, limit = 20) {
  const savedInteractions = await InteractionModel.find({
    userId,
    actionType: "save"
  })
    .sort({ createdAt: -1 })
    .skip(cursor ? parseInt(cursor) : 0)
    .limit(limit)
    .populate('contentId');

  return {
    items: savedInteractions.map(interaction => ({
      id: interaction.contentId._id,
      savedAt: interaction.createdAt,
      content: interaction.contentId
    })),
    hasMore: savedInteractions.length === limit,
    nextCursor: savedInteractions.length === limit 
      ? String((cursor ? parseInt(cursor) : 0) + limit)
      : null
  };
}

export async function addExplicitInterest(userId: string, topic: string, weight: number = 5) {
  const profile = await ProfileModel.findOne({ userId });
  const currentInterests = (profile?.toObject()?.interests as Record<string, number>) || {};
  
  // Add or update explicit interest
  currentInterests[topic] = weight;
  
  await updateUserInterests(userId, currentInterests);
  
  return currentInterests;
}

export async function removeInterest(userId: string, topic: string) {
  const profile = await ProfileModel.findOne({ userId });
  const currentInterests = (profile?.toObject()?.interests as Record<string, number>) || {};
  
  // Remove interest
  delete currentInterests[topic];
  
  await updateUserInterests(userId, currentInterests);
  
  return currentInterests;
}

export async function getTopInterests(userId: string, limit = 10) {
  const interests = await getUserInterests(userId);
  
  return Object.entries(interests)
    .map(([topic, score]) => ({ topic, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Automatically called when users interact with content
export async function onInteractionUpdate(userId: string, contentId: string, actionType: string) {
  // Update interest vector based on new interaction
  await updateInterestVector(userId);
  
  // Invalidate user feed cache to reflect new preferences
  const { invalidateCacheKeys } = await import("./cacheService.js");
  const { redisKeys } = await import("@maat/shared");
  
  await invalidateCacheKeys([redisKeys.userFeed(userId)]);
}
