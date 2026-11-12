import api from './api';
import { User } from '../types';

export const authService = {
  async register(data: any) {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('securax_token', res.data.token);
      localStorage.setItem('securax_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post('/auth/login', data);
    if (res.data.token) {
      localStorage.setItem('securax_token', res.data.token);
      localStorage.setItem('securax_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async demoLogin() {
    const res = await api.post('/auth/demo-login');
    if (res.data.token) {
      localStorage.setItem('securax_token', res.data.token);
      localStorage.setItem('securax_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('securax_token');
      localStorage.removeItem('securax_user');
    }
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data: Partial<User>) {
    const res = await api.put('/auth/profile', data);
    if (res.data.user) {
      localStorage.setItem('securax_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
};
