import { Router } from 'express';
import {
  getNearbyHelpers,
  registerAsVolunteer,
  toggleAvailability,
  requestNearbyHelpers,
} from '../controllers/helperController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/nearby', getNearbyHelpers);
router.post('/register', registerAsVolunteer);
router.put('/availability', toggleAvailability);
router.post('/request-help', requestNearbyHelpers);

export default router;
