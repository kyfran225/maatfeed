import { Request, Response, NextFunction } from 'express';
import { verifyJWT, extractTokenFromHeader } from '../utils/auth.js';
import { logger } from '../config/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
    role: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
    }

    const decoded = verifyJWT(token);
    req.user = decoded;
    
    logger.debug({ userId: decoded.userId }, 'Token authenticated successfully');
    next();
  } catch (error) {
    logger.warn({ error: (error as Error).message }, 'Token authentication failed');
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'Authentication failed' 
    });
  }
}

export function requireRole(roles: string | string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No user found in request' 
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: 'Access denied' 
      });
    }

    next();
  };
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyJWT(token);
      req.user = decoded;
      logger.debug({ userId: decoded.userId }, 'Optional token authenticated successfully');
    }
    
    next();
  } catch (error) {
    // For optional auth, we continue without user if token is invalid
    logger.debug({ error: (error as Error).message }, 'Optional token authentication failed, continuing without user');
    next();
  }
}
