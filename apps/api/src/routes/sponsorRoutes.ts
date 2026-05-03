import { Router } from "express";
import {
  getActiveSponsorsController,
  getAllSponsorsController,
  getSponsorController,
  createSponsorController,
  updateSponsorController,
  deleteSponsorController,
  incrementSponsorStatsController
} from "../controllers/sponsorController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

// Routes publiques
router.get("/active", getActiveSponsorsController);

// Routes admin (protégées par middleware)
router.get("/", requireAdmin, getAllSponsorsController);
router.get("/:id", requireAdmin, getSponsorController);
router.post("/", requireAdmin, createSponsorController);
router.put("/:id", requireAdmin, updateSponsorController);
router.delete("/:id", requireAdmin, deleteSponsorController);

// Route pour incrémenter les stats (appelée depuis le frontend)
router.post("/:id/stats", incrementSponsorStatsController);

export default router;