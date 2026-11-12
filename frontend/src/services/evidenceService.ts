import api from './api';
import { EvidenceFile } from '../types';

export const evidenceService = {
  async uploadAudio(formData: FormData) {
    const res = await api.post('/evidence/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getEvidenceList(): Promise<{
    success: boolean;
    count: number;
    disclaimer: string;
    evidence: EvidenceFile[];
  }> {
    const res = await api.get('/evidence');
    return res.data;
  },

  async deleteEvidence(id: string) {
    const res = await api.delete(`/evidence/${id}`);
    return res.data;
  },
};
