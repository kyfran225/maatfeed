import type { Request, Response } from "express";
import { Types } from "mongoose";
import { UserModel } from "../models/User.js";
import { ProfileModel } from "../models/Profile.js";
import { ConsentLogModel } from "../models/ConsentLog.js";
import { SessionModel } from "../models/Session.js";
import * as gdprEmailService from "../services/gdprEmailService.js";
import { logger } from "../config/logger.js";

export async function exportUserDataController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    
    if (!userId) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }

    // Récupérer toutes les données de l'utilisateur
    const user = await UserModel.findById(userId);
    const profile = await ProfileModel.findOne({ userId });
    const consentLogs = await ConsentLogModel.find({ userId });
    const sessions = await SessionModel.find({ userId });

    if (!user) {
      response.status(404).json({ error: "Utilisateur non trouvé." });
      return;
    }

    // Construire le package de données RGPD
    const userData = {
      personalData: {
        email: user.email,
        role: user.role,
        trustLevel: user.trustLevel,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      profile: profile ? {
        displayName: profile.displayName,
        interests: Object.fromEntries(profile.interests || new Map()),
        mutedTopics: profile.mutedTopics,
        preferences: profile.preferences,
        avatar: profile.avatar,
        profileImageUrl: profile.profileImageUrl,
        communityProfile: profile.communityProfile,
        categoryScores: Object.fromEntries(profile.categoryScores || new Map()),
        learningEvolution: profile.learningEvolution,
        learningRecommendations: profile.learningRecommendations,
        learningScore: profile.learningScore,
        onboardingCompleted: profile.onboardingCompleted,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      } : null,
      consentHistory: consentLogs.map(log => ({
        consentType: log.consentType,
        consentGiven: log.consentGiven,
        preferences: Object.fromEntries(log.preferences || new Map()),
        timestamp: log.timestamp,
        version: log.version,
        legalBasis: log.legalBasis,
        purpose: log.purpose,
        withdrawnAt: log.withdrawnAt
      })),
      sessionHistory: sessions.map(session => ({
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent
      })),
      exportMetadata: {
        exportDate: new Date().toISOString(),
        format: "JSON",
        version: "1.0",
        requestId: new Types.ObjectId().toString()
      }
    };

    // Log de l'export pour audit
    await ConsentLogModel.create({
      userId,
      consentType: "data_processing",
      consentGiven: true,
      purpose: "data_export_request",
      legalBasis: "explicit_consent",
      ipAddress: request.ip,
      userAgent: request.get("User-Agent")
    });

    // Envoyer l'email avec les données
    await gdprEmailService.sendDataExportEmail(user.email, userData);

    response.json({
      message: "Vos données ont été exportées et vous seront envoyées par email.",
      requestId: userData.exportMetadata.requestId
    });

  } catch (error) {
    logger.error({ err: error }, "Erreur lors de l'export des données utilisateur");
    response.status(500).json({ error: "Erreur lors de l'export des données." });
  }
}

export async function deleteUserDataController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    
    if (!userId) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      response.status(404).json({ error: "Utilisateur non trouvé." });
      return;
    }

    // Anonymiser les données (soft delete pour audit trail)
    const anonymizedEmail = `deleted_${userId}@deleted.com`;
    const anonymizedName = `Utilisateur supprimé ${Date.now()}`;

    await UserModel.findByIdAndUpdate(userId, {
      email: anonymizedEmail,
      passwordHash: "DELETED",
      role: "deleted_user",
      isEmailVerified: false,
      trustLevel: "visitor",
      verificationToken: null,
      verificationExpiresAt: null,
      lastLoginAt: null,
      loginAttempts: 0,
      lockUntil: null
    });

    // Supprimer le profil
    await ProfileModel.deleteOne({ userId });

    // Supprimer les sessions actives
    await SessionModel.deleteMany({ userId });

    // Log de la suppression pour audit
    await ConsentLogModel.create({
      userId,
      consentType: "data_processing",
      consentGiven: false,
      purpose: "account_deletion_request",
      legalBasis: "explicit_consent",
      ipAddress: request.ip,
      userAgent: request.get("User-Agent"),
      withdrawnAt: new Date()
    });

    // Envoyer email de confirmation
    await gdprEmailService.sendAccountDeletionEmail(anonymizedEmail, anonymizedName);

    // Déconnecter l'utilisateur
    response.clearCookie("refreshToken");
    response.clearCookie("accessToken");

    response.json({
      message: "Votre compte et toutes vos données personnelles ont été supprimés conformément à vos droits RGPD."
    });

  } catch (error) {
    logger.error({ err: error }, "Erreur lors de la suppression des données utilisateur");
    response.status(500).json({ error: "Erreur lors de la suppression des données." });
  }
}

export async function rectifyUserDataController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    const { field, newValue } = request.body;
    
    if (!userId) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }

    if (!field || newValue === undefined) {
      response.status(400).json({ error: "Champ et nouvelle valeur requis." });
      return;
    }

    // Champs autorisés à la modification
    const allowedFields = ["displayName"];
    if (!allowedFields.includes(field)) {
      response.status(400).json({ error: "Ce champ ne peut pas être modifié directement." });
      return;
    }

    let updateResult;
    
    if (field === "displayName") {
      updateResult = await ProfileModel.findOneAndUpdate(
        { userId },
        { displayName: newValue },
        { new: true }
      );
    }

    if (!updateResult) {
      response.status(404).json({ error: "Profil non trouvé." });
      return;
    }

    // Log de la modification pour audit
    await ConsentLogModel.create({
      userId,
      consentType: "data_processing",
      consentGiven: true,
      purpose: "data_rectification_request",
      legalBasis: "explicit_consent",
      preferences: { [field]: true },
      ipAddress: request.ip,
      userAgent: request.get("User-Agent")
    });

    response.json({
      message: "Vos données ont été mises à jour.",
      field,
      newValue
    });

  } catch (error) {
    logger.error({ err: error }, "Erreur lors de la rectification des données utilisateur");
    response.status(500).json({ error: "Erreur lors de la mise à jour des données." });
  }
}

export async function getConsentHistoryController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    
    if (!userId) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }

    const consentHistory = await ConsentLogModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);

    response.json({
      consentHistory: consentHistory.map(log => ({
        consentType: log.consentType,
        consentGiven: log.consentGiven,
        preferences: Object.fromEntries(log.preferences || new Map()),
        timestamp: log.timestamp,
        version: log.version,
        legalBasis: log.legalBasis,
        purpose: log.purpose,
        withdrawnAt: log.withdrawnAt
      }))
    });

  } catch (error) {
    logger.error({ err: error }, "Erreur lors de la récupération de l'historique de consentement");
    response.status(500).json({ error: "Erreur lors de la récupération de l'historique." });
  }
}

export async function withdrawConsentController(request: Request, response: Response) {
  try {
    const userId = response.locals.auth?.userId;
    const { consentType } = request.body;
    
    if (!userId) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }

    if (!consentType) {
      response.status(400).json({ error: "Type de consentement requis." });
      return;
    }

    // Marquer le consentement comme retiré
    await ConsentLogModel.updateMany(
      { 
        userId, 
        consentType, 
        consentGiven: true,
        withdrawnAt: null 
      },
      { 
        withdrawnAt: new Date(),
        consentGiven: false 
      }
    );

    // Log du retrait de consentement
    await ConsentLogModel.create({
      userId,
      consentType,
      consentGiven: false,
      purpose: "consent_withdrawal",
      legalBasis: "explicit_consent",
      ipAddress: request.ip,
      userAgent: request.get("User-Agent"),
      withdrawnAt: new Date()
    });

    response.json({
      message: "Votre consentement a été retiré.",
      consentType
    });

  } catch (error) {
    logger.error({ err: error }, "Erreur lors du retrait du consentement");
    response.status(500).json({ error: "Erreur lors du retrait du consentement." });
  }
}
