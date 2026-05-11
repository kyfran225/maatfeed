import { Router } from 'express';
import {
  registerController,
  loginController,
  logoutController,
  refreshController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  meController,
  resendVerificationController
} from '../../controllers/authController';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshController);
router.get('/verify-email', verifyEmailController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/resend-verification', resendVerificationController);

// Protected routes
router.use(authenticateToken);
router.get('/me', meController);
router.post('/logout', logoutController);
router.post('/change-password', changePasswordController);

export default router;
