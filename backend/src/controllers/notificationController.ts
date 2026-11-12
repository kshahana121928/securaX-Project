import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { NotificationService } from '../services/notificationService.js';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const channel = req.query.channel as string;
  const limit = Math.min(Number(req.query.limit) || 50, 100);

  const query: any = { userId: req.userId };
  if (channel && ['push', 'email', 'sms'].includes(channel)) {
    query.channel = channel;
  }

  const notifications = await Notification.find(query).sort({ sentAt: -1 }).limit(limit);

  res.json({
    success: true,
    count: notifications.length,
    notifications,
  });
};

export const sendTestNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { channel = 'push', message = 'This is a test notification from SecuraX dispatch engine.' } = req.body;

  const records = await NotificationService.dispatchEmergencyAlerts({
    userId: req.userId!,
    alertType: 'SOS Activation',
    customMessage: `[SYSTEM TEST] ${message}`,
  });

  res.json({
    success: true,
    message: 'Test notification broadcasted to all channels and logged.',
    records,
  });
};
