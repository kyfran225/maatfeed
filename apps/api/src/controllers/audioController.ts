import { Request, Response } from "express";
import { ZodError, z } from "zod";
import { getAudioTracks, getPlaylists, createPlaylist, generateAutoPlaylist } from "../services/audioService.js";
import { enrichAudioTracks } from "../services/audioEnrichmentService.js";
import { getAudioDiscovery } from "../services/audioRecommendationService.js";

const createPlaylistSchema = z.object({
  name: z.string().min(1, "Playlist name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  trackIds: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

const autoPlaylistSchema = z.object({
  genre: z.enum(["kemet", "spiritual", "educational", "debate", "ambient"]).optional(),
  minPlayCount: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
});

export async function getTracksController(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const tracks = await getAudioTracks(limit);
    const enrichedTracks = enrichAudioTracks(tracks);
    
    res.json({
      success: true,
      data: enrichedTracks,
      meta: {
        count: enrichedTracks.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getTracksController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audio tracks"
    });
  }
}

export async function getPlaylistsController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const playlists = await getPlaylists(userId);
    
    res.json({
      success: true,
      data: playlists,
      meta: {
        count: playlists.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getPlaylistsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch playlists"
    });
  }
}

export async function createPlaylistController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { name, description, trackIds, isPublic, tags } = createPlaylistSchema.parse(req.body);
    
    const playlist = await createPlaylist({
      name,
      description,
      userId,
      trackIds,
      isPublic,
      tags
    });
    
    res.json({
      success: true,
      data: playlist,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in createPlaylistController:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid playlist payload",
        details: error.flatten()
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create playlist"
    });
  }
}

export async function getAutoPlaylistController(req: Request, res: Response) {
  try {
    const { genre, minPlayCount, limit } = autoPlaylistSchema.parse(req.query);
    
    const playlist = await generateAutoPlaylist({
      genre,
      minPlayCount,
      limit
    });
    
    res.json({
      success: true,
      data: playlist,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getAutoPlaylistController:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid auto playlist query",
        details: error.flatten()
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to generate auto playlist"
    });
  }
}

export async function getAudioDiscoveryController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const limit = Math.min(12, Math.max(4, parseInt(req.query.limit as string) || 6));
    const discovery = await getAudioDiscovery(userId, limit);

    res.json({
      success: true,
      data: discovery,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getAudioDiscoveryController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load audio discovery"
    });
  }
}
