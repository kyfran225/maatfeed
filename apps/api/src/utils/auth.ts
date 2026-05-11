import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(userData: {
  userId: string;
  email: string;
  username: string;
  role: string;
}): TokenPair {
  const accessToken = jwt.sign(
    {
      userId: userData.userId,
      email: userData.email,
      username: userData.username,
      role: userData.role,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: userData.userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export function verifyJWT(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}
