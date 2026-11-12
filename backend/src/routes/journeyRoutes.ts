import { Router } from 'express';
import {
  startJourney,
  getActiveJourney,
  journeySafetyCheckIn,
  endJourney,
  checkRouteDeviation,
} from '../controllers/journeyController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/start', startJourney);
router.get('/active', getActiveJourney);
router.post('/check-in', journeySafetyCheckIn);
router.post('/end', endJourney);
router.post('/deviation-check', checkRouteDeviation);

export default router;
