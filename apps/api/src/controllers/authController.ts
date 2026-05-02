import type { Request, Response } from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerificationEmail,
  resetPassword,
  verifyEmail
} from "../services/authService.js";

export async function registerController(request: Request, response: Response) {
  const result = await register(request.body);
  response.status(201).json(result);
}

// Email verification
export async function verifyEmailController(request: Request, response: Response) {
  const { token } = request.query;

  if (!token || typeof token !== "string") {
    response.status(400).json({ error: "Token de vérification requis." });
    return;
  }

  const result = await verifyEmail(token);
  response.json(result);
}

export async function resendVerificationController(request: Request, response: Response) {
  // User must be authenticated to resend verification
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const result = await resendVerificationEmail(userId);
  response.json(result);
}

export async function loginController(request: Request, response: Response) {
  const ipAddress = request.ip || request.socket.remoteAddress;
  const result = await login(request.body, ipAddress);
  response.json(result);
}

// Password reset
export async function forgotPasswordController(request: Request, response: Response) {
  const { email } = request.body;
  const ipAddress = request.ip || request.socket.remoteAddress;

  if (!email || typeof email !== "string") {
    response.status(400).json({ error: "Email requis." });
    return;
  }

  const result = await forgotPassword(email, ipAddress);
  response.json(result);
}

export async function resetPasswordController(request: Request, response: Response) {
  const { token, newPassword } = request.body;

  if (!token || typeof token !== "string") {
    response.status(400).json({ error: "Token de réinitialisation requis." });
    return;
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    response.status(400).json({ error: "Nouveau mot de passe requis (min. 8 caractères)." });
    return;
  }

  const result = await resetPassword(token, newPassword);
  response.json(result);
}

export async function changePasswordController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const { currentPassword, newPassword } = request.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    response.status(400).json({ error: "Mot de passe actuel et nouveau mot de passe requis (min. 8 caractères)." });
    return;
  }

  const result = await changePassword(userId, currentPassword, newPassword);
  response.json(result);
}

export async function refreshController(request: Request, response: Response) {
  const tokens = await refresh(request.body.refreshToken);
  response.json({ tokens });
}

export async function logoutController(request: Request, response: Response) {
  await logout(request.body.refreshToken);
  response.status(204).send();
}

export async function meController(_request: Request, response: Response) {
  const profile = await me(response.locals.auth.userId);
  response.json({ profile });
}
