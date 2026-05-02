import type { Request, Response, NextFunction, RequestHandler } from "express";
import { createRedisClient } from "../db/redis.js";
import { env } from "../config/env.js";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  errorMessage: string;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  comment: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 comments per minute
    keyPrefix: "rate:comment",
    errorMessage: "Too many comments. Please wait a moment before commenting again."
  },
  reply: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 replies per minute
    keyPrefix: "rate:reply",
    errorMessage: "Too many replies. Please wait a moment before replying again."
  },
  edit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 edits per minute
    keyPrefix: "rate:edit",
    errorMessage: "Too many edits. Please wait a moment before editing again."
  },
  like: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 likes per minute
    keyPrefix: "rate:like",
    errorMessage: "Too many likes. Please slow down."
  },
  report: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 reports per minute
    keyPrefix: "rate:report",
    errorMessage: "Too many reports. Please wait before reporting again."
  }
};

export function rateLimiter(
  type: keyof typeof RATE_LIMITS,
  getIdentifier?: (req: Request) => string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting if Redis is not available
    let redis;
    try {
      redis = createRedisClient();
    } catch {
      // Redis unavailable, skip rate limiting
      return next();
    }

    const config = RATE_LIMITS[type];
    const identifier = getIdentifier?.(req) || res.locals.auth?.userId || req.ip || "anonymous";
    const key = `${config.keyPrefix}:${identifier}`;

    try {
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Use Redis sorted set for sliding window rate limiting
      // Remove old entries outside the window
      await redis.zremrangebyscore(key, 0, windowStart);

      // Count current requests in window
      const currentCount = await redis.zcard(key);

      if (currentCount >= config.maxRequests) {
        const oldestEntry = await redis.zrange(key, 0, 0, "WITHSCORES");
        const resetTime = oldestEntry.length > 0
          ? Math.ceil((parseInt(oldestEntry[1]) + config.windowMs - now) / 1000)
          : Math.ceil(config.windowMs / 1000);

        return res.status(429).json({
          success: false,
          error: config.errorMessage,
          retryAfter: resetTime,
          limit: config.maxRequests,
          windowMs: config.windowMs
        });
      }

      // Add current request to the window
      await redis.zadd(key, now, `${now}-${Math.random()}`);

      // Set expiration on the key
      await redis.expire(key, Math.ceil(config.windowMs / 1000));

      // Add rate limit headers
      const remaining = config.maxRequests - currentCount - 1;
      res.setHeader("X-RateLimit-Limit", config.maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
      res.setHeader("X-RateLimit-Window", `${config.windowMs / 1000}s`);

      next();
    } catch (error) {
      console.error(`Rate limiting error for ${type}:`, error);
      // Fail open - allow request if rate limiting fails
      next();
    }
  };
}

// Convenience middlewares - return RequestHandler directly
export const commentRateLimiter = (): RequestHandler => rateLimiter("comment") as unknown as RequestHandler;
export const replyRateLimiter = (): RequestHandler => rateLimiter("reply") as unknown as RequestHandler;
export const editRateLimiter = (): RequestHandler => rateLimiter("edit") as unknown as RequestHandler;
export const likeRateLimiter = (): RequestHandler => rateLimiter("like") as unknown as RequestHandler;
export const reportRateLimiter = (): RequestHandler => rateLimiter("report") as unknown as RequestHandler;

// Strict rate limiter for suspicious activity
export async function strictRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip if Redis is not available
  let redis;
  try {
    redis = createRedisClient();
  } catch {
    return next();
  }

  const identifier = res.locals.auth?.userId || req.ip || "anonymous";
  const key = `rate:strict:${identifier}`;
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxRequests = 50; // 50 requests per 5 minutes

  try {
    const now = Date.now();
    const windowStart = now - windowMs;

    await redis.zremrangebyscore(key, 0, windowStart);
    const currentCount = await redis.zcard(key);

    if (currentCount >= maxRequests) {
      // Log suspicious activity
      console.warn(`Strict rate limit hit for user: ${identifier}`);

      return res.status(429).json({
        success: false,
        error: "Activity limit exceeded. Please try again later.",
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, Math.ceil(windowMs / 1000));

    next();
  } catch (error) {
    console.error("Strict rate limiting error:", error);
    next();
  }
}

// Get rate limit status for a user
export async function getRateLimitStatus(
  type: keyof typeof RATE_LIMITS,
  identifier: string
): Promise<{
  limit: number;
  remaining: number;
  resetAt: Date;
  windowMs: number;
}> {
  const config = RATE_LIMITS[type];
  const redis = createRedisClient();
  const key = `${config.keyPrefix}:${identifier}`;

  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Clean and count
  await redis.zremrangebyscore(key, 0, windowStart);
  const currentCount = await redis.zcard(key);

  // Get oldest entry for reset time
  const oldestEntry = await redis.zrange(key, 0, 0, "WITHSCORES");
  const resetAt = oldestEntry.length > 0
    ? new Date(parseInt(oldestEntry[1]) + config.windowMs)
    : new Date(now + config.windowMs);

  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - currentCount),
    resetAt,
    windowMs: config.windowMs
  };
}
