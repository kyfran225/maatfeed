import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { ProfileModel } from "../models/Profile.js";
import { SessionModel } from "../models/Session.js";
import { UserModel } from "../models/User.js";
import {
  EmailVerificationTokenModel,
  generateVerificationToken,
  hashVerificationToken,
  VERIFICATION_TOKEN_EXPIRY_MS
} from "../models/EmailVerificationToken.js";
import {
  PasswordResetTokenModel,
  generatePasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TOKEN_EXPIRY_MS
} from "../models/PasswordResetToken.js";
import * as emailService from "./emailService.js";
import * as notificationService from "./notificationService.js";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/token.js";
import { logger } from "../config/logger.js";

type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_DURATION_MS = 15 * 60 * 1000;

function toProfileDto(
  userId: string,
  email: string,
  profile: {
    displayName: string;
    interests: Map<string, number> | Record<string, number>;
    savedContentIds: unknown[];
    onboardingCompleted: boolean;
    preferences?: { contentMix?: { viral: number; educational: number; deep: number } };
    avatar?: string | null;
    profileImageUrl?: string | null;
  },
  user?: { isEmailVerified: boolean; trustLevel: string } | null
) {
  return {
    id: userId,
    email,
    displayName: profile.displayName,
    interests:
      profile.interests instanceof Map ? Object.fromEntries(profile.interests.entries()) : profile.interests,
    savedContentIds: profile.savedContentIds.map(String),
    onboardingCompleted: profile.onboardingCompleted,
    preferences: profile.preferences || {},
    avatar: profile.avatar || null,
    profileImageUrl: profile.profileImageUrl || null,
    isEmailVerified: user?.isEmailVerified || false,
    trustLevel: user?.trustLevel || "visitor",
    role: user?.role
  };
}

async function createSession(userId: string, role: string) {
  const sessionId = new Types.ObjectId().toString();
  const refreshToken = signRefreshToken({ sub: userId, role, sessionId });
  const payload = verifyRefreshToken(refreshToken);

  const session = await SessionModel.create({
    _id: sessionId,
    userId,
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: new Date(((payload.exp ?? 0) * 1000) || Date.now())
  });

  const accessToken = signAccessToken({
    sub: userId,
    role,
    sessionId: session.id
  });

  return {
    accessToken,
    refreshToken
  };
}

export async function register(input: RegisterInput) {
  const existingUser = await UserModel.findOne({ email: input.email.toLowerCase() }).lean();

  if (existingUser) {
    throw new Error("Un compte avec cet email existe déjà.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({
    email: input.email.toLowerCase(),
    passwordHash,
    role: "user",
    authProviders: ["password"],
    isEmailVerified: false,
    trustLevel: "visitor"
  });

  const profile = await ProfileModel.create({
    userId: user._id,
    displayName: input.displayName,
    onboardingCompleted: false,
    interests: {},
    mutedTopics: [],
    savedContentIds: []
  });

  // Initialize notification preferences
  await notificationService.initializeNotificationPreferences(user._id.toString());

  // Generate and send verification email
  await sendVerificationEmail(user._id.toString(), input.displayName);

  // Send welcome notification
  await notificationService.createNotification({
    userId: user._id.toString(),
    type: "welcome",
    priority: "normal"
  });

  const tokens = await createSession(user.id, user.role);

  return {
    tokens,
    profile: toProfileDto(user.id, user.email, profile, user),
    requiresEmailVerification: true
  };
}

// Send verification email
async function sendVerificationEmail(userId: string, displayName: string): Promise<boolean> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }
  if (user.isEmailVerified) {
    return false; // Already verified, no email sent
  }

  // Generate token
  const token = generateVerificationToken();
  const tokenHash = hashVerificationToken(token);

  logger.info({
    msg: "Creating verification token",
    userId: user._id,
    tokenPrefix: token.substring(0, 16),
    tokenHashPrefix: tokenHash.substring(0, 16),
    tokenLength: token.length
  });

  // Store hashed token
  const createdToken = await EmailVerificationTokenModel.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
    usedAt: null
  });

  logger.info({
    msg: "Verification token stored",
    userId: user._id,
    tokenId: createdToken._id.toString(),
    tokenHashPrefix: tokenHash.substring(0, 16)
  });

  // Send email
  await emailService.sendVerificationEmail(user.email, displayName, token);

  logger.info({ msg: "Verification email sent", userId: user._id, email: user.email });
  return true;
}

// Verify email with token
export async function verifyEmail(token: string) {
  const tokenHash = hashVerificationToken(token);

  logger.info({
    msg: "Verifying email token",
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 16),
    tokenHashPrefix: tokenHash.substring(0, 16)
  });

  // Validate token format (should be 96 hex characters for 48 bytes)
  if (!/^[a-f0-9]{96}$/.test(token)) {
    logger.warn({
      msg: "Invalid token format",
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 16),
      isHex: /^[a-f0-9]+$/.test(token)
    });
    throw new Error("Lien de vérification invalide ou expiré.");
  }

  // Find token - check by hash only first for debugging
  const anyToken = await EmailVerificationTokenModel.findOne({ tokenHash });
  if (!anyToken) {
    // Try to find any tokens for debugging
    const recentTokens = await EmailVerificationTokenModel.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(5).select("tokenHash createdAt usedAt").lean();

    logger.warn({
      msg: "Token not found by hash",
      tokenHashPrefix: tokenHash.substring(0, 16),
      tokenPrefix: token.substring(0, 16),
      recentTokensCount: recentTokens.length,
      recentTokens: recentTokens.map(t => ({
        hashPrefix: t.tokenHash.substring(0, 16),
        createdAt: t.createdAt,
        usedAt: t.usedAt
      }))
    });
    throw new Error("Lien de vérification invalide ou expiré.");
  }

  // Check if user is already verified (idempotent - for StrictMode double-render)
  const existingUser = await UserModel.findById(anyToken.userId);
  if (existingUser?.isEmailVerified) {
    logger.info({ msg: "User already verified", userId: anyToken.userId });
    return { success: true, alreadyVerified: true, message: "Votre email est déjà vérifié." };
  }

  // Now check if expired or used
  if (anyToken.usedAt) {
    logger.warn({ msg: "Token already used", userId: anyToken.userId });
    throw new Error("Ce lien de vérification a déjà été utilisé.");
  }

  if (anyToken.expiresAt < new Date()) {
    logger.warn({ msg: "Token expired", userId: anyToken.userId, expiresAt: anyToken.expiresAt });
    throw new Error("Ce lien de vérification a expiré.");
  }

  // Mark token as used
  anyToken.usedAt = new Date();
  await anyToken.save();

  // Update user
  const user = await UserModel.findByIdAndUpdate(
    anyToken.userId,
    {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      trustLevel: "verified"
    },
    { new: true }
  );

  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  // Send notification
  await notificationService.createNotification({
    userId: user._id.toString(),
    type: "email_verified",
    priority: "normal"
  });

  logger.info({ msg: "Email verified", userId: user._id, email: user.email });

  return { success: true, email: user.email };
}

// Resend verification email
export async function resendVerificationEmail(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  if (user.isEmailVerified) {
    return { success: true, alreadyVerified: true, message: "Votre email est déjà vérifié." };
  }

  // Get user profile for display name
  const profile = await ProfileModel.findOne({ userId });
  const displayName = profile?.displayName || user.email.split("@")[0];

  // Send new verification email
  const sent = await sendVerificationEmail(userId, displayName);

  if (!sent) {
    return { success: true, alreadyVerified: true, message: "Votre email est déjà vérifié." };
  }

  return { success: true, alreadyVerified: false, message: "Email de vérification envoyé. Vérifiez votre boîte de réception (et vos spams)." };
}

// Login
export async function login(input: LoginInput, ipAddress?: string) {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });

  if (!user) {
    throw new Error("Identifiants invalides.");
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error("Compte temporairement verrouillé. Réessayez plus tard.");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOGIN_LOCK_DURATION_MS);
      await user.save();

      await notificationService.sendSecurityAlert({
        userId: user._id.toString(),
        alertType: "Tentatives de connexion échouées",
        details: "Votre compte a été temporairement verrouillé après plusieurs tentatives de connexion échouées.",
        ipAddress,
        url: "/auth"
      });
    } else {
      await user.save();
    }

    throw new Error("Identifiants invalides.");
  }

  const profile = await ProfileModel.findOne({ userId: user._id });

  if (!profile) {
    throw new Error("Profile not found for this account.");
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  // Check if we should auto-upgrade trust level
  await notificationService.checkAndUpgradeTrustLevel(user._id.toString());

  const tokens = await createSession(user.id, user.role);

  return {
    tokens,
    profile: toProfileDto(user.id, user.email, profile, user),
    requiresEmailVerification: !user.isEmailVerified
  };
}

// Forgot password - send reset email
export async function forgotPassword(email: string, ipAddress?: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true, message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." };
  }

  // Delete old tokens for this user
  await PasswordResetTokenModel.deleteMany({ userId: user._id });

  // Generate new token
  const token = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);

  // Store token
  await PasswordResetTokenModel.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS),
    ipAddress
  });

  // Get display name
  const profile = await ProfileModel.findOne({ userId: user._id });
  const displayName = profile?.displayName || user.email.split("@")[0];

  // Send email
  await emailService.sendPasswordResetEmail(user.email, displayName, token, ipAddress);

  logger.info({ msg: "Password reset email sent", userId: user._id, email: user.email, ipAddress });

  return { success: true, message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." };
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashPasswordResetToken(token);

  // Find token
  const tokenRecord = await PasswordResetTokenModel.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
    usedAt: null
  });

  if (!tokenRecord) {
    throw new Error("Lien de réinitialisation invalide ou expiré.");
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update user password
  const user = await UserModel.findByIdAndUpdate(
    tokenRecord.userId,
    { passwordHash },
    { new: true }
  );

  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  // Mark all tokens as used
  await PasswordResetTokenModel.updateMany(
    { userId: user._id },
    { usedAt: new Date() }
  );

  // Invalidate all sessions
  await SessionModel.deleteMany({ userId: user._id });

  // Send confirmation email
  const profile = await ProfileModel.findOne({ userId: user._id });
  const displayName = profile?.displayName || user.email.split("@")[0];
  await emailService.sendPasswordChangedEmail(user.email, displayName, tokenRecord.ipAddress || undefined);

  // Send notification
  await notificationService.createNotification({
    userId: user._id.toString(),
    type: "password_changed",
    priority: "high"
  });

  logger.info({ msg: "Password reset successful", userId: user._id, email: user.email });

  return { success: true, message: "Votre mot de passe a été réinitialisé avec succès." };
}

// Change password (when logged in)
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  // Verify current password
  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!passwordMatches) {
    throw new Error("Mot de passe actuel incorrect.");
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  user.passwordHash = passwordHash;
  await user.save();

  // Invalidate all sessions except current (would need session ID)
  await SessionModel.deleteMany({ userId: user._id });

  // Send confirmation email
  const profile = await ProfileModel.findOne({ userId });
  const displayName = profile?.displayName || user.email.split("@")[0];
  await emailService.sendPasswordChangedEmail(user.email, displayName);

  // Send notification
  await notificationService.createNotification({
    userId: user._id.toString(),
    type: "password_changed",
    priority: "high"
  });

  logger.info({ msg: "Password changed", userId: user._id });

  return { success: true, message: "Votre mot de passe a été changé avec succès." };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const session = await SessionModel.findById(payload.sessionId ?? null);

  if (!session || session.refreshTokenHash !== hashToken(refreshToken)) {
    throw new Error("Invalid refresh session.");
  }

  const user = await UserModel.findById(payload.sub);

  if (!user) {
    throw new Error("User not found.");
  }

  await SessionModel.findByIdAndDelete(session._id);

  return createSession(user.id, user.role);
}

export async function logout(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const session = await SessionModel.findById(payload.sessionId ?? null);

  if (!session) {
    return;
  }

  if (session.refreshTokenHash === hashToken(refreshToken)) {
    await SessionModel.findByIdAndDelete(session._id);
  }
}

export async function me(userId: string) {
  const user = await UserModel.findById(userId);
  const profile = await ProfileModel.findOne({ userId });

  if (!user || !profile) {
    throw new Error("Utilisateur authentifié non trouvé.");
  }

  return toProfileDto(user.id, user.email, profile, user);
}
