import { Request, Response } from "express";
import { z } from "zod";
import { getProfile, updateInterestVector, addSavedContent } from "../repositories/profileRepository.js";
import { updateUserInterests } from "../services/interestService.js";
import { ContentModel } from "../models/Content.js";

const updatePreferencesSchema = z.object({
  interests: z.record(z.string(), z.number()).optional(),
  preferences: z.object({
    contentMix: z.object({
      viral: z.number().min(0).max(1).optional(),
      educational: z.number().min(0).max(1).optional(),
      deep: z.number().min(0).max(1).optional()
    }).optional()
  }).optional()
});

const updateAvatarSchema = z.object({
  avatar: z.string().optional(),
  profileImageUrl: z.string().url().optional()
});

export async function getProfileController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const profile = await getProfile(userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Profile not found"
      });
    }

    res.json({
      success: true,
      data: {
        id: profile._id,
        userId: profile.userId,
        displayName: profile.displayName,
        avatar: profile.avatar || null,
        profileImageUrl: profile.profileImageUrl || null,
        interests: profile.interests || {},
        preferences: profile.preferences || {},
        savedContentIds: profile.savedContentIds || [],
        onboardingCompleted: profile.onboardingCompleted || false,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error("Error in getProfileController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get profile"
    });
  }
}

export async function updatePreferencesController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const validatedData = updatePreferencesSchema.parse(req.body);
    
    // Update interests if provided
    if (validatedData.interests) {
      await updateUserInterests(userId, validatedData.interests);
    }

    // Update other preferences if provided
    if (validatedData.preferences) {
      const { ProfileModel } = await import("../models/Profile.js");
      await ProfileModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            preferences: validatedData.preferences,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: "Preferences updated successfully"
    });
  } catch (error) {
    console.error("Error in updatePreferencesController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update preferences"
    });
  }
}

export async function getSavedContentController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const profile = await getProfile(userId);
    
    if (!profile || !profile.savedContentIds || profile.savedContentIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Get saved content details
    const savedContent = await ContentModel.find({
      _id: { $in: profile.savedContentIds },
      processingStatus: "published"
    })
    .sort({ createdAt: -1 })
    .populate('contentId')
    .lean();

    // Build feed items for saved content
    const { feedService } = await import("../services/feedService.js");
    const items = await Promise.all(
      savedContent.map(async (content) => {
        // Create a simple feed item from content
        return {
          _id: (content as any)._id.toString(),
          title: content.title,
          description: content.description,
          mediaType: content.mediaType,
          mediaUrl: content.mediaUrl,
          thumbnailUrl: content.thumbnailUrl,
          duration: content.duration,
          creatorId: content.creatorId.toString(),
          creatorName: content.creatorName,
          creatorAvatar: content.creatorAvatar,
          tags: content.tags,
          category: content.category,
          language: content.language,
          publishedAt: content.publishedAt || content.createdAt,
          createdAt: content.createdAt,
          score: content.score,
          views: content.views,
          likes: content.likes,
          shares: content.shares,
          comments: content.comments,
          hasDebate: content.hasDebate,
          debateId: content.debateId?.toString(),
          userReaction: undefined,
          isSaved: true
        };
      })
    );

    res.json({
      success: true,
      data: items,
      meta: {
        count: items.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getSavedContentController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get saved content"
    });
  }
}

export async function completeOnboardingController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { ProfileModel } = await import("../models/Profile.js");
    const profile = await ProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          onboardingCompleted: true,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Profile not found"
      });
    }

    res.json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        onboardingCompleted: profile.onboardingCompleted
      }
    });
  } catch (error) {
    console.error("Error in completeOnboardingController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete onboarding"
    });
  }
}

export async function updateAvatarController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const validatedData = updateAvatarSchema.parse(req.body);

    const { ProfileModel } = await import("../models/Profile.js");

    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (validatedData.avatar !== undefined) {
      updateData.avatar = validatedData.avatar;
      // Clear profile image if avatar is set
      if (validatedData.avatar) {
        updateData.profileImageUrl = null;
      }
    }

    if (validatedData.profileImageUrl !== undefined) {
      let imageUrl = validatedData.profileImageUrl;
      console.log("[Avatar Update] Received imageUrl:", imageUrl?.substring(0, 50) + "...");
      
      // If it's a base64 image, upload to Cloudinary
      if (imageUrl && imageUrl.startsWith("data:image")) {
        console.log("[Avatar Update] Detected base64 image, uploading to Cloudinary...");
        try {
          const { uploadBase64Image } = await import("../services/cloudinaryService.js");
          const uploadResult = await uploadBase64Image(imageUrl, "maatfeed/avatars", userId);
          imageUrl = uploadResult.url;
          console.log("[Avatar Update] Cloudinary upload success:", imageUrl);
        } catch (uploadError) {
          console.error("[Avatar Update] Cloudinary upload failed:", uploadError);
          throw uploadError;
        }
      }
      
      updateData.profileImageUrl = imageUrl;
      console.log("[Avatar Update] Saving profileImageUrl to DB:", imageUrl);
      // Clear avatar if profile image is set
      if (imageUrl) {
        updateData.avatar = null;
      }
    }

    console.log("[Avatar Update] updateData:", JSON.stringify(updateData, null, 2));
    
    const profile = await ProfileModel.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Profile not found"
      });
    }

    console.log("[Avatar Update] Saved profile:", {
      avatar: profile.avatar,
      profileImageUrl: profile.profileImageUrl
    });

    res.json({
      success: true,
      message: "Avatar updated successfully",
      data: {
        avatar: profile.avatar,
        profileImageUrl: profile.profileImageUrl
      }
    });
  } catch (error) {
    console.error("Error in updateAvatarController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update avatar"
    });
  }
}
