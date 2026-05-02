import { Types } from "mongoose";
import { ProfileModel } from "../models/Profile.js";

export async function getProfile(userId: string) {
  return ProfileModel.findOne({ userId });
}

export async function updateInterestVector(userId: string, interests: Record<string, number>) {
  return ProfileModel.findOneAndUpdate(
    {
      userId
    },
    {
      $set: {
        interests
      }
    },
    {
      new: true
    }
  );
}

export async function addSavedContent(userId: string, contentId: string) {
  return ProfileModel.findOneAndUpdate(
    {
      userId
    },
    {
      $addToSet: {
        savedContentIds: new Types.ObjectId(contentId)
      }
    },
    {
      new: true
    }
  );
}
