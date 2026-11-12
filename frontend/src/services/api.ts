import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('securax_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized and not on login/register/landing, clear session
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/' && !path.startsWith('/track/')) {
        localStorage.removeItem('securax_token');
        localStorage.removeItem('securax_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
