import { Router } from "express";
import {
  getProfileController,
  updatePreferencesController,
  getSavedContentController,
  completeOnboardingController,
  updateAvatarController
} from "../controllers/profileController.js";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";

const router = Router();

// GET /api/profile - Get user profile (read-only, only requires auth)
router.get("/", requireAuth, getProfileController);

// PATCH /api/profile/preferences - Update user preferences (requires auth)
// Note: Preferences can be set during onboarding without email verification
router.patch("/preferences", requireAuth, updatePreferencesController);

// PATCH /api/profile/avatar - Update user avatar (requires auth, allows onboarding without email verification)
// Note: Email verification required for other actions like preferences, but avatar can be set during onboarding
router.patch("/avatar", requireAuth, updateAvatarController);

// GET /api/profile/saved - Get saved content (read-only, only requires auth)
router.get("/saved", requireAuth, getSavedContentController);

// POST /api/profile/complete-onboarding - Mark onboarding as completed (requires auth)
// Note: Email verification checked at action level (interactions, comments) not at onboarding completion
router.post("/complete-onboarding", requireAuth, completeOnboardingController);

export default router;
