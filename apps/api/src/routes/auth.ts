import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserModel } from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../utils/auth.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { logger } from '../config/logger.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, username, password } = validatedData;

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new UserModel({
      email,
      username,
      passwordHash: hashedPassword,
      role: 'user',
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await user.save();

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    logger.info({ userId: user._id, email: user.email }, 'User registered successfully');

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error({ error: (error as Error).message }, 'Registration failed');
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error',
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    logger.info({ userId: user._id, email: user.email }, 'User logged in successfully');

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPremium: user.isPremium || false,
        lastLoginAt: user.lastLoginAt,
      },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error({ error: (error as Error).message }, 'Login failed');
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error',
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const validatedData = refreshSchema.parse(req.body);
    const { refreshToken } = validatedData;

    // Verify refresh token
    const { userId } = verifyRefreshToken(refreshToken);

    // Find user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'User not found',
      });
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    logger.info({ userId: user._id }, 'Token refreshed successfully');

    res.json({
      message: 'Token refreshed successfully',
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error({ error: (error as Error).message }, 'Token refresh failed');
    res.status(401).json({
      error: 'Token refresh failed',
      message: 'Invalid or expired refresh token',
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // In a real implementation, you might want to:
    // 1. Add the refresh token to a blacklist
    // 2. Remove the user from active sessions
    // 3. Clear any server-side session data

    logger.info({ userId: req.user?.userId }, 'User logged out successfully');

    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Logout failed');
    res.status(500).json({
      error: 'Logout failed',
      message: 'Internal server error',
    });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await UserModel.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPremium: user.isPremium || false,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Get user info failed');
    res.status(500).json({
      error: 'Failed to get user info',
      message: 'Internal server error',
    });
  }
});

export default router;
