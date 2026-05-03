import type { Request, Response } from "express";
import { AudioTrackMarkModel, type AudioTrackMarkDocument } from "../models/AudioTrackMark.js";
import mongoose from "mongoose";

export async function getAudioMarksController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const marks = await AudioTrackMarkModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    const marksMap = marks.reduce((acc, mark) => {
      acc[mark.trackId.toString()] = mark.mark;
      return acc;
    }, {} as Record<string, "kept" | "review">);

    res.json({
      success: true,
      data: marksMap
    });
  } catch (error) {
    console.error("Error in getAudioMarksController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audio marks"
    });
  }
}

export async function setAudioMarkController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { trackId, mark } = req.body;

    if (!trackId || !mongoose.isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        error: "Valid trackId required"
      });
    }

    if (!mark || !["kept", "review"].includes(mark)) {
      return res.status(400).json({
        success: false,
        error: "Mark must be 'kept' or 'review'"
      });
    }

    const updated = await AudioTrackMarkModel.findOneAndUpdate(
      { userId, trackId },
      { mark },
      { upsert: true, new: true }
    ).lean<AudioTrackMarkDocument>();

    if (!updated) {
      return res.status(500).json({
        success: false,
        error: "Failed to create or update audio mark"
      });
    }

    res.json({
      success: true,
      data: {
        trackId: updated.trackId.toString(),
        mark: updated.mark,
        updatedAt: updated.updatedAt
      }
    });
  } catch (error) {
    console.error("Error in setAudioMarkController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to set audio mark"
    });
  }
}

export async function removeAudioMarkController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { trackId } = req.params;

    if (!trackId || !mongoose.isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        error: "Valid trackId required"
      });
    }

    await AudioTrackMarkModel.deleteOne({ userId, trackId });

    res.json({
      success: true,
      message: "Mark removed successfully"
    });
  } catch (error) {
    console.error("Error in removeAudioMarkController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove audio mark"
    });
  }
}
