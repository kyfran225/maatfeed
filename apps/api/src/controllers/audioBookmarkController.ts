import { Request, Response } from "express";
import mongoose from "mongoose";
import { SavedAudioTrackModel, type SavedAudioTrackDocument } from "../models/SavedAudioTrack.js";
import { AudioTrackModel } from "../models/AudioTrack.js";

function assertObjectId(value: string, field: string) {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error(`${field} invalide`);
  }
}

export async function getSavedAudioTracksController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      return response.status(401).json({ error: "Non authentifié" });
    }

    assertObjectId(userId, "userId");

    const saved = (await SavedAudioTrackModel.find({ userId })
      .populate("trackId", "title artist mediaUrl duration coverImageUrl")
      .sort({ savedAt: -1 })
      .lean()) as unknown as (SavedAudioTrackDocument & { trackId: any })[];

    const mapped = saved.map((doc: any) => ({
      id: doc._id.toString(),
      trackId: doc.trackId._id.toString(),
      title: doc.trackId.title,
      artist: doc.trackId.artist,
      mediaUrl: doc.trackId.mediaUrl,
      duration: doc.trackId.duration,
      coverImageUrl: doc.trackId.coverImageUrl,
      lastListenPosition: doc.lastListenPosition,
      completionRatio: doc.completionRatio,
      completed: doc.completedAt != null,
      completedAt: doc.completedAt?.toISOString() ?? null,
      savedAt: doc.savedAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    }));

    return response.json({ data: mapped });
  } catch (error) {
    console.error("Error getting saved audio tracks:", error);
    return response.status(500).json({ error: "Erreur serveur" });
  }
}

export async function saveLaterAudioTrackController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      return response.status(401).json({ error: "Non authentifié" });
    }

    const { trackId } = request.body;
    if (!trackId || typeof trackId !== "string") {
      return response.status(400).json({ error: "trackId requis" });
    }

    assertObjectId(userId, "userId");
    assertObjectId(trackId, "trackId");

    const trackExists = await AudioTrackModel.exists({ _id: trackId });
    if (!trackExists) {
      return response.status(404).json({ error: "Piste audio introuvable" });
    }

    const saved = (await SavedAudioTrackModel.findOneAndUpdate(
      { userId, trackId },
      {
        $set: {
          savedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true, lean: true }
    )) as unknown as SavedAudioTrackDocument;

    const track = await AudioTrackModel.findById(trackId).select(
      "title artist mediaUrl duration coverImageUrl"
    ).lean();

    return response.json({
      data: {
        id: saved._id.toString(),
        trackId: saved.trackId.toString(),
        title: (track as any)?.title,
        artist: (track as any)?.artist,
        mediaUrl: (track as any)?.mediaUrl,
        duration: (track as any)?.duration,
        coverImageUrl: (track as any)?.coverImageUrl,
        lastListenPosition: saved.lastListenPosition,
        completionRatio: saved.completionRatio,
        completed: saved.completedAt != null,
        savedAt: saved.savedAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Error saving audio track:", error);
    return response.status(500).json({ error: "Erreur serveur" });
  }
}

export async function updateAudioBookmarkController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      return response.status(401).json({ error: "Non authentifié" });
    }

    const { trackId } = request.params as { trackId?: string };
    if (!trackId || typeof trackId !== "string") {
      return response.status(400).json({ error: "trackId invalide" });
    }
    const { lastListenPosition, completionRatio, completed } = request.body;

    assertObjectId(userId, "userId");
    assertObjectId(trackId, "trackId");

    const updateData: any = {};
    if (typeof lastListenPosition === "number") {
      updateData.lastListenPosition = lastListenPosition;
    }
    if (typeof completionRatio === "number") {
      updateData.completionRatio = Math.min(1, Math.max(0, completionRatio));
    }
    if (completed === true && completionRatio >= 0.9) {
      updateData.completedAt = new Date();
    } else if (completed === false) {
      updateData.completedAt = null;
    }

    const saved = (await SavedAudioTrackModel.findOneAndUpdate(
      { userId, trackId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true, lean: true }
    )) as unknown as SavedAudioTrackDocument;

    const track = await AudioTrackModel.findById(trackId).select(
      "title artist mediaUrl duration coverImageUrl"
    ).lean();

    return response.json({
      data: {
        id: saved._id.toString(),
        trackId: saved.trackId.toString(),
        title: (track as any)?.title,
        artist: (track as any)?.artist,
        mediaUrl: (track as any)?.mediaUrl,
        duration: (track as any)?.duration,
        coverImageUrl: (track as any)?.coverImageUrl,
        lastListenPosition: saved.lastListenPosition,
        completionRatio: saved.completionRatio,
        completed: saved.completedAt != null,
        completedAt: saved.completedAt?.toISOString() ?? null,
        savedAt: saved.savedAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Error updating audio bookmark:", error);
    return response.status(500).json({ error: "Erreur serveur" });
  }
}

export async function removeAudioBookmarkController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    if (!userId) {
      return response.status(401).json({ error: "Non authentifié" });
    }

    const { trackId } = request.params as { trackId?: string };
    if (!trackId || typeof trackId !== "string") {
      return response.status(400).json({ error: "trackId invalide" });
    }
    assertObjectId(userId, "userId");
    assertObjectId(trackId, "trackId");

    await SavedAudioTrackModel.deleteOne({ userId, trackId });

    return response.json({ success: true });
  } catch (error) {
    console.error("Error removing audio bookmark:", error);
    return response.status(500).json({ error: "Erreur serveur" });
  }
}
