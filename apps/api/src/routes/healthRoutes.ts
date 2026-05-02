import { Router } from "express";
import { health, readiness } from "../controllers/healthController.js";

export const healthRouter = Router();

healthRouter.get("/health", health);
healthRouter.get("/readiness", readiness);
