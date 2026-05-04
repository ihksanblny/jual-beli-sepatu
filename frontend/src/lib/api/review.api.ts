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

export const reviewApi = {
  getProductReviews: async (productId: string, params: any = {}) => {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },
  createReview: async (productId: string, reviewData: any) => {
    const response = await api.post(`/products/${productId}/reviews`, { ...reviewData, productId });
    return response.data;
  },
  updateReview: async (productId: string, reviewId: string, reviewData: any) => {
    const response = await api.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
    return response.data;
  },
  deleteReview: async (productId: string, reviewId: string) => {
    const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },
};
