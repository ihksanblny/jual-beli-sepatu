import { api } from './client';

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
