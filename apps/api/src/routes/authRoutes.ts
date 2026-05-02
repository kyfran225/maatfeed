import { Router } from "express";
import {
  changePasswordController,
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
  resendVerificationController,
  resetPasswordController,
  verifyEmailController
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

// Registration & Login
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", requireAuth, meController);

// Email Verification
authRouter.get("/verify-email", verifyEmailController);
authRouter.post("/resend-verification", requireAuth, resendVerificationController);

// Password Reset
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/reset-password", resetPasswordController);
authRouter.post("/change-password", requireAuth, changePasswordController);
