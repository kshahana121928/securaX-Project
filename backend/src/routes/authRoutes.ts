import { Router } from 'express';
import {
  register,
  login,
  demoLogin,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/demo-login', demoLogin);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
