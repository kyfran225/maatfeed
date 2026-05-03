import type { Request, Response, NextFunction } from "express";
import { ConsentLogModel } from "../models/ConsentLog.js";
import { logger } from "../config/logger.js";

export async function logConsentMiddleware(
  consentType: string,
  consentGiven: boolean,
  legalBasis: "explicit_consent" | "legitimate_interest" | "contractual_necessity" = "explicit_consent"
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.auth?.userId;
      
      await ConsentLogModel.create({
        userId,
        consentType,
        consentGiven,
        legalBasis,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        purpose: `${req.method} ${req.path}`,
        version: "1.0"
      });
      
      next();
    } catch (error) {
      logger.error({ err: error }, "Erreur lors du logging du consentement");
      next(); // Ne pas bloquer la requête en cas d'erreur de logging
    }
  };
}

export async function requireExplicitConsent(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: "Authentification requise." });
      return;
    }

    // Vérifier si l'utilisateur a donné son consentement pour le traitement des données
    const consent = await ConsentLogModel.findOne({
      userId,
      consentType: "data_processing",
      consentGiven: true,
      withdrawnAt: null
    });

    if (!consent) {
      res.status(403).json({ 
        error: "Consentement requis",
        message: "Vous devez donner votre consentement explicite pour le traitement de vos données.",
        consentRequired: true
      });
      return;
    }

    next();
  } catch (error) {
    logger.error({ err: error }, "Erreur lors de la vérification du consentement");
    res.status(500).json({ error: "Erreur lors de la vérification du consentement." });
  }
}
