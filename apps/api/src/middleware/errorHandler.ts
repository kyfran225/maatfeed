import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";

// Error messages that should return 401 Unauthorized
const AUTH_ERROR_MESSAGES = [
  "identifiants invalides",
  "invalid credentials",
  "user not found",
  "utilisateur non trouvé",
  "invalid refresh session",
  "session invalide",
  "mot de passe actuel incorrect",
  "current password incorrect",
  "authentification requise"
];

// Error messages that should return 400 Bad Request
const BAD_REQUEST_MESSAGES = [
  "déjà existe",
  "already exists",
  "déjà inscrit",
  "already registered",
  "requis",
  "required",
  "invalide",
  "invalid",
  "expiré",
  "expired"
];

function getStatusCode(errorMessage: string): number {
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes("not allowed by cors")) {
    return 403;
  }

  if (lowerMessage.includes("json") && lowerMessage.includes("position")) {
    return 400;
  }

  // Check for auth errors (401)
  if (AUTH_ERROR_MESSAGES.some(msg => lowerMessage.includes(msg))) {
    return 401;
  }

  // Check for bad request errors (400)
  if (BAD_REQUEST_MESSAGES.some(msg => lowerMessage.includes(msg))) {
    return 400;
  }

  // Profile not found is a 404
  if (lowerMessage.includes("profile not found") || lowerMessage.includes("profil non trouvé")) {
    return 404;
  }

  return 500;
}

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  const statusCode = getStatusCode(error.message);

  // Log as warning for client errors, error for server errors
  if (statusCode >= 500) {
    logger.error({ err: error }, "Server error");
  } else {
    logger.warn({ err: error, statusCode }, "Client error");
  }

  response.status(statusCode).json({
    error: {
      message: error.message || "Une erreur est survenue",
      code: statusCode
    }
  });
}
