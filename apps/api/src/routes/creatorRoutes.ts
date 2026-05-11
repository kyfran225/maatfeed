import { Router } from "express";
import { creatorController } from "../controllers/creatorController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Creator profile management
router.post("/creator", creatorController.createCreator.bind(creatorController));
router.get("/creator/me", creatorController.getMyCreatorProfile.bind(creatorController));
router.put("/creator/me", creatorController.updateCreator.bind(creatorController));

// Public creator endpoints
router.get("/creator/:creatorId", creatorController.getCreatorById.bind(creatorController));
router.get("/creator/:creatorId/followers", creatorController.getCreatorFollowers.bind(creatorController));

// Follow/unfollow creators
router.post("/creator/:creatorId/follow", creatorController.followCreator.bind(creatorController));
router.delete("/creator/:creatorId/follow", creatorController.unfollowCreator.bind(creatorController));

// User's followed creators
router.get("/creator/following", creatorController.getMyFollowedCreators.bind(creatorController));

// Creator dashboard
router.get("/creator/dashboard", creatorController.getCreatorDashboard.bind(creatorController));

// Search and discovery
router.get("/creator/search", creatorController.searchCreators.bind(creatorController));
router.get("/creator/trending", creatorController.getTrendingCreators.bind(creatorController));

// Internal endpoints (for analytics updates)
router.put("/creator/:creatorId/stats", creatorController.updateCreatorStats.bind(creatorController));

export default router;
