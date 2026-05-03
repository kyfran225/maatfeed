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

const router = Router();

// Routes publiques
router.get("/active", getActiveSponsorsController);

// Routes admin (TODO: ajouter middleware d'authentification admin)
router.get("/", getAllSponsorsController);
router.get("/:id", getSponsorController);
router.post("/", createSponsorController);
router.put("/:id", updateSponsorController);
router.delete("/:id", deleteSponsorController);

// Route pour incrémenter les stats (appelée depuis le frontend)
router.post("/:id/stats", incrementSponsorStatsController);

export default router;