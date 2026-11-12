import api from './api';
import { NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(channel?: string, limit?: number): Promise<{
    success: boolean;
    count: number;
    notifications: NotificationItem[];
  }> {
    const res = await api.get('/notifications', {
      params: { channel, limit },
    });
    return res.data;
  },

  async sendTestNotification(channel: string = 'push', message?: string) {
    const res = await api.post('/notifications/test', { channel, message });
    return res.data;
  },
};
