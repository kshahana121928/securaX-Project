import api from './api';
import { Journey } from '../types';

export const journeyService = {
  async startJourney(payload: {
    startPoint: { lat: number; lng: number; address?: string };
    destination: { lat: number; lng: number; address?: string };
    plannedRoute?: Array<{ lat: number; lng: number }>;
    expectedDurationMinutes: number;
    cabDetails?: {
      cabProvider: string;
      vehicleNumber: string;
      driverName: string;
      driverPhone?: string;
    };
    trustedContactIds?: string[];
    safetyCheckFrequencyMinutes?: number;
  }) {
    const res = await api.post('/journey/start', payload);
    return res.data;
  },

  async getActiveJourney(): Promise<{ success: boolean; journey: Journey | null }> {
    const res = await api.get('/journey/active');
    return res.data;
  },

  async checkIn(journeyId: string, isSafe: boolean, reason?: string) {
    const res = await api.post('/journey/check-in', { journeyId, isSafe, reason });
    return res.data;
  },

  async endJourney(journeyId: string) {
    const res = await api.post('/journey/end', { journeyId });
    return res.data;
  },

  async checkRouteDeviation(journeyId: string, currentCoordinates: { lat: number; lng: number }, thresholdMeters?: number) {
    const res = await api.post('/journey/deviation-check', {
      journeyId,
      currentCoordinates,
      thresholdMeters,
    });
    return res.data;
  },
};
