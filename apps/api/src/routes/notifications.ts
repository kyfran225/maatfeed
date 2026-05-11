import { Router } from 'express';
import {
  getNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
  getPreferencesController,
  updatePreferencesController,
  getVapidPublicKeyController,
  subscribeToPushController,
  unsubscribeFromPushController,
  testPushController
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Notification CRUD routes
router.get('/', getNotificationsController);
router.get('/unread/count', getUnreadCountController);
router.patch('/:notificationId/read', markAsReadController);
router.patch('/read-all', markAllAsReadController);

// Notification preferences
router.get('/preferences', getPreferencesController);
router.put('/preferences', updatePreferencesController);

// Web push notifications
router.get('/push/vapid-public-key', getVapidPublicKeyController);
router.post('/push/subscribe', subscribeToPushController);
router.post('/push/unsubscribe', unsubscribeFromPushController);

// Test endpoint (development only)
router.post('/test-push', testPushController);

export default router;
