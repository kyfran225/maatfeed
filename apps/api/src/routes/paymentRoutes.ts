import { Router } from "express";
import {
  createCheckoutController,
  getCurrentSubscriptionController,
  getPaymentHistoryController,
  getPaymentPlansController,
  paymentWebhookController
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

export const paymentRouter = Router();

paymentRouter.get("/plans", getPaymentPlansController);
paymentRouter.post("/checkout", requireAuth, createCheckoutController);
paymentRouter.get("/subscription", requireAuth, getCurrentSubscriptionController);
paymentRouter.get("/history", requireAuth, getPaymentHistoryController);
paymentRouter.post("/webhooks/:provider", paymentWebhookController);
