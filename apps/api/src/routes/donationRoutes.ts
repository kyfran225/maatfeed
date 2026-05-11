import { Router } from "express";
import {
  createDonationController,
  getCreatorDonationsController,
  getUserDonationsController,
  getCreatorDonationStatsController,
  getTrendingCreatorsController,
  getDonationAmountsController,
  donationWebhookController
} from "../controllers/donationController.js";
import { requireAuth } from "../middleware/auth.js";

export const donationRouter = Router();

// Public routes
donationRouter.get("/amounts", getDonationAmountsController);
donationRouter.get("/trending", getTrendingCreatorsController);
donationRouter.get("/creator/:creatorId", getCreatorDonationsController);
donationRouter.get("/creator/:creatorId/stats", getCreatorDonationStatsController);

// Protected routes
donationRouter.post("/create", requireAuth, createDonationController);
donationRouter.get("/my-donations", requireAuth, getUserDonationsController);

// Webhook
donationRouter.post("/webhook", donationWebhookController);
