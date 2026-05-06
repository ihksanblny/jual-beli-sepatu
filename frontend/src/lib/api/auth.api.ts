import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/me', userData);
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },
  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
  updatePassword: async (passwordData: any) => {
    const response = await api.put('/auth/update-password', passwordData);
    return response.data;
  },
  deleteAccount: async () => {
    const response = await api.delete('/auth/delete-me');
    return response.data;
  },
};
