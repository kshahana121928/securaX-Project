import { Router } from 'express';
import {
  startSafetyTimer,
  getActiveSafetyTimer,
  respondSafetyTimer,
  verifyPIN,
  setupPINs,
  getPINStatus,
} from '../controllers/safetyController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { pinLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

// Safety Check-In Timer endpoints
router.post('/timer/start', startSafetyTimer);
router.get('/timer/active', getActiveSafetyTimer);
router.post('/timer/respond', respondSafetyTimer);

// Dual PIN Verification & Setup endpoints (Feature 5)
router.post('/pin/verify', pinLimiter, verifyPIN);
router.post('/pin/setup', setupPINs);
router.get('/pin/status', getPINStatus);

export default router;
