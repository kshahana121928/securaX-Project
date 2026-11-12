import { Router } from 'express';
import {
  activateEmergency,
  silentEmergencyActivation,
  cancelEmergency,
  getActiveEmergency,
  getEmergencyHistory,
  getPublicTracking,
} from '../controllers/emergencyController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public route for emergency contact tracking
router.get('/track/:shareToken', getPublicTracking);

// Protected routes
router.use(authenticate);

router.post('/activate', activateEmergency);
router.post('/silent-activate', silentEmergencyActivation);
router.post('/cancel', cancelEmergency);
router.get('/active', getActiveEmergency);
router.get('/history', getEmergencyHistory);

export default router;
