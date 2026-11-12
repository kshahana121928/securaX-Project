import api from './api';
import { SafetyCheckIn } from '../types';

export const safetyService = {
  async startTimer(durationMinutes: number, note?: string) {
    const res = await api.post('/safety/timer/start', { durationMinutes, note });
    return res.data;
  },

  async getActiveTimer(): Promise<{ success: boolean; checkIn: SafetyCheckIn | null }> {
    const res = await api.get('/safety/timer/active');
    return res.data;
  },

  async respondTimer(checkInId: string, status: 'safe' | 'help_needed' | 'expired_escalated', location?: { lat: number; lng: number }) {
    const res = await api.post('/safety/timer/respond', { checkInId, status, location });
    return res.data;
  },

  async verifyPin(pin: string, location?: { lat: number; lng: number }) {
    const res = await api.post('/safety/pin/verify', { pin, location });
    return res.data;
  },

  async setupPins(normalPin: string, secretEmergencyPin: string) {
    const res = await api.post('/safety/pin/setup', { normalPin, secretEmergencyPin });
    return res.data;
  },

  async getPinStatus() {
    const res = await api.get('/safety/pin/status');
    return res.data;
  },
};
