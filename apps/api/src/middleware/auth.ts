import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token.js";
import { UserModel } from "../models/User.js";

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Missing bearer token." });
    return;
  }

  try {
    const payload = verifyAccessToken(authorization.replace("Bearer ", ""));
    response.locals.auth = {
      userId: payload.sub,
      role: payload.role,
      sessionId: payload.sessionId ?? null
    };
    next();
  } catch {
    response.status(401).json({ message: "Invalid access token." });
  }
}

export function optionalAuth(request: Request, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    // No token provided, continue without auth
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(authorization.replace("Bearer ", ""));
    response.locals.auth = {
      userId: payload.sub,
      role: payload.role,
      sessionId: payload.sessionId ?? null
    };
  } catch {
    // Invalid token, continue without auth
  }

  next();
}

/**
 * Middleware that requires authentication AND verified email
 * Returns 403 Forbidden if email is not verified (user is authenticated but not allowed)
 */
export async function requireVerifiedEmail(request: Request, response: Response, next: NextFunction) {
  // First check authentication
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({
      error: "Authentication required",
      code: "MISSING_AUTH",
      message: "Vous devez être connecté pour effectuer cette action."
    });
    return;
  }

  try {
    const payload = verifyAccessToken(authorization.replace("Bearer ", ""));
    const userId = payload.sub;

    // Check if email is verified
    const user = await UserModel.findById(userId).select<{ isEmailVerified: boolean; email: string }>("isEmailVerified email").lean();

    if (!user || Array.isArray(user)) {
      response.status(401).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
        message: "Utilisateur introuvable."
      });
      return;
    }

    if (!user.isEmailVerified) {
      response.status(403).json({
        error: "Email not verified",
        code: "EMAIL_NOT_VERIFIED",
        message: "Veuillez vérifier votre adresse email pour effectuer cette action.",
        action: {
          type: "RESEND_VERIFICATION",
          endpoint: "/api/auth/resend-verification",
          message: "Renvoyer l'email de vérification"
        }
      });
      return;
    }

    // Set auth context
    response.locals.auth = {
      userId: payload.sub,
      role: payload.role,
      sessionId: payload.sessionId ?? null
    };

    next();
  } catch {
    response.status(401).json({
      error: "Invalid access token",
      code: "INVALID_TOKEN",
      message: "Session invalide. Veuillez vous reconnecter."
    });
  }
}

/**
 * Middleware that allows optional auth but attaches verification status
 * Useful for endpoints that work both authenticated and anonymously
 */
export async function optionalAuthWithVerification(request: Request, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    // No token provided, continue without auth
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(authorization.replace("Bearer ", ""));
    const userId = payload.sub;

    // Check verification status
    const user = await UserModel.findById(userId).select<{ isEmailVerified: boolean }>("isEmailVerified").lean();

    response.locals.auth = {
      userId: payload.sub,
      role: payload.role,
      sessionId: payload.sessionId ?? null,
      isEmailVerified: (!Array.isArray(user) && user?.isEmailVerified) ?? false
    };
  } catch {
    // Invalid token, continue without auth
  }

  next();
}
