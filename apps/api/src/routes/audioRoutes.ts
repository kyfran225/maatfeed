import { Router } from "express";
import {
  getTracksController,
  getPlaylistsController,
  createPlaylistController,
  getAutoPlaylistController,
  getAudioDiscoveryController
} from "../controllers/audioController.js";
import {
  getSavedAudioTracksController,
  saveLaterAudioTrackController,
  updateAudioBookmarkController,
  removeAudioBookmarkController
} from "../controllers/audioBookmarkController.js";
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

// Audio bookmarks - "Plus tard"
// GET /api/audio/saved - Get all saved audio tracks
router.get("/saved", requireAuth, getSavedAudioTracksController);

// POST /api/audio/saved - Save audio track for later
router.post("/saved", requireAuth, saveLaterAudioTrackController);

// PUT /api/audio/saved/:trackId - Update listening position/completion
router.put("/saved/:trackId", requireAuth, updateAudioBookmarkController);

// DELETE /api/audio/saved/:trackId - Remove from saved
router.delete("/saved/:trackId", requireAuth, removeAudioBookmarkController);

export default router;
