import { Router } from 'express';
import {
  getNotifications,
  sendTestNotification,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.post('/test', sendTestNotification);

export default router;
