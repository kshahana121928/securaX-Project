import api from './api';
import { EmergencyContact } from '../types';

export const contactService = {
  async getContacts(): Promise<{ success: boolean; count: number; contacts: EmergencyContact[] }> {
    const res = await api.get('/contacts');
    return res.data;
  },

  async createContact(contact: Partial<EmergencyContact>) {
    const res = await api.post('/contacts', contact);
    return res.data;
  },

  async updateContact(id: string, contact: Partial<EmergencyContact>) {
    const res = await api.put(`/contacts/${id}`, contact);
    return res.data;
  },

  async deleteContact(id: string) {
    const res = await api.delete(`/contacts/${id}`);
    return res.data;
  },

  async testContactAlert(id: string) {
    const res = await api.post(`/contacts/${id}/test`);
    return res.data;
  },
};
