import { Router } from 'express';
import {
  getGlobalFeedController,
  getPersonalizedFeedController,
  getSessionFeedController,
  updateSessionFeedController
} from '../../controllers/feedController';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/global', getGlobalFeedController);
router.get('/session', getSessionFeedController);
router.post('/session', updateSessionFeedController);

// Protected routes
router.use(authenticateToken);
router.get('/personalized', getPersonalizedFeedController);

export default router;
