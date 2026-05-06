import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getUsers: async (params: any = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getOrders: async (params: any = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },
  getOrderById: async (orderId: string) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },
  updateOrderStatus: async (orderId: string, statusData: any) => {
    const response = await api.put(`/admin/orders/${orderId}/status`, statusData);
    return response.data;
  },
};
