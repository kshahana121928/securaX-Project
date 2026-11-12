import api from './api';
import { EmergencySession, LocationPoint } from '../types';

export const emergencyService = {
  async activateSos(payload: {
    triggerType?: string;
    triggerSource?: string;
    location?: LocationPoint;
    notes?: string;
  }) {
    const res = await api.post('/emergency/activate', payload);
    return res.data;
  },

  async silentActivate(payload: { location?: LocationPoint; notes?: string }) {
    const res = await api.post('/emergency/silent-activate', payload);
    return res.data;
  },

  async cancelSos(reason: string, notes?: string) {
    const res = await api.post('/emergency/cancel', { reason, notes });
    return res.data;
  },

  async getActiveEmergency(): Promise<{
    success: boolean;
    isActive: boolean;
    session: EmergencySession | null;
    shareUrl: string | null;
  }> {
    const res = await api.get('/emergency/active');
    return res.data;
  },

  async getHistory(): Promise<{ success: boolean; count: number; sessions: EmergencySession[] }> {
    const res = await api.get('/emergency/history');
    return res.data;
  },

  async getPublicTracking(shareToken: string) {
    const res = await api.get(`/emergency/track/${shareToken}`);
    return res.data;
  },

  async updateLocation(coords: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    address?: string;
  }) {
    const res = await api.post('/location/update', coords);
    return res.data;
  },
};
