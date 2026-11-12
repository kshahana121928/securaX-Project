import api from './api';
import { VolunteerItem } from '../types';

export const helperService = {
  async getNearbyHelpers(lat?: number, lng?: number, radiusKm?: number): Promise<{
    success: boolean;
    count: number;
    helpers: VolunteerItem[];
  }> {
    const res = await api.get('/helpers/nearby', {
      params: { lat, lng, radiusKm },
    });
    return res.data;
  },

  async registerVolunteer(data: {
    phone: string;
    address: string;
    coordinates: { lat: number; lng: number };
    skills: string[];
  }) {
    const res = await api.post('/helpers/register', data);
    return res.data;
  },

  async toggleAvailability(isAvailable: boolean) {
    const res = await api.put('/helpers/availability', { isAvailable });
    return res.data;
  },

  async requestHelp(location?: { lat: number; lng: number }, emergencyMessage?: string) {
    const res = await api.post('/helpers/request-help', { location, emergencyMessage });
    return res.data;
  },
};
