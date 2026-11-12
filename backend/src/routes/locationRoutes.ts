import { Router } from 'express';
import {
  updateLocation,
  getCurrentLocation,
  getLocationHistory,
} from '../controllers/locationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/update', updateLocation);
router.get('/current', getCurrentLocation);
router.get('/history', getLocationHistory);

export default router;
