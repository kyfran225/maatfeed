import type { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/User.js";

/**
 * Middleware pour vérifier que l'utilisateur est un administrateur
 */
export async function requireAdmin(request: Request, response: Response, next: NextFunction) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      response.status(401).json({ error: "Utilisateur non trouvé." });
      return;
    }

    if (user.role !== "admin") {
      response.status(403).json({ error: "Accès administrateur requis." });
      return;
    }

    // Ajouter l'utilisateur au locals pour les routes qui en ont besoin
    response.locals.user = user;
    next();
  } catch (error) {
    console.error("Erreur lors de la vérification des droits admin:", error);
    response.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * Vérifie si l'utilisateur est admin (fonction utilitaire)
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const user = await UserModel.findById(userId);
    return user?.role === "admin" || false;
  } catch (error) {
    console.error("Erreur lors de la vérification du rôle admin:", error);
    return false;
  }
}