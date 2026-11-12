import api from './api';
import { UserSettings } from '../types';

export const settingsService = {
  async getSettings(): Promise<{ success: boolean; settings: UserSettings }> {
    const res = await api.get('/settings');
    return res.data;
  },

  async updateSettings(settings: Partial<UserSettings>) {
    const res = await api.put('/settings', settings);
    return res.data;
  },
};
