import { Router } from "express";
import {
  exportUserDataController,
  deleteUserDataController,
  rectifyUserDataController,
  getConsentHistoryController,
  withdrawConsentController
} from "../controllers/gdprController.js";

const router = Router();

// Routes RGPD - nécessitent une authentification
router.post("/export", exportUserDataController);
router.delete("/delete", deleteUserDataController);
router.put("/rectify", rectifyUserDataController);
router.get("/consent-history", getConsentHistoryController);
router.post("/withdraw-consent", withdrawConsentController);

export default router;
