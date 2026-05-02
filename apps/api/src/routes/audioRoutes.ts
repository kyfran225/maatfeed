import { Router } from "express";
import {
  getTracksController,
  getPlaylistsController,
  createPlaylistController,
  getAutoPlaylistController,
  getAudioDiscoveryController
} from "../controllers/audioController.js";
import { createAudioInteractionController } from "../controllers/audioInteractionController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/audio/tracks - Get audio tracks
router.get("/tracks", getTracksController);

// GET /api/audio/playlists - Get playlists
router.get("/playlists", optionalAuth, getPlaylistsController);

// POST /api/audio/playlists - Create playlist
router.post("/playlists", requireAuth, createPlaylistController);

// GET /api/audio/playlists/auto - Get auto-generated playlist
router.get("/playlists/auto", getAutoPlaylistController);

// POST /api/audio/interaction - Track audio player interactions
router.post("/interaction", optionalAuth, createAudioInteractionController);

// GET /api/audio/discovery - Sectioned discovery payload for the audio experience
router.get("/discovery", optionalAuth, getAudioDiscoveryController);

export default router;
