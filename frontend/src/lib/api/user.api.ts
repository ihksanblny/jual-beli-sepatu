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

export const userApi = {
  getAddresses: async () => {
    const response = await api.get('/user/addresses');
    return response.data;
  },
  addAddress: async (addressData: any) => {
    const response = await api.post('/user/address', addressData);
    return response.data;
  },
  updateAddress: async (id: string, addressData: any) => {
    const response = await api.put(`/user/address/${id}`, addressData);
    return response.data;
  },
  deleteAddress: async (id: string) => {
    const response = await api.delete(`/user/address/${id}`);
    return response.data;
  },
};
