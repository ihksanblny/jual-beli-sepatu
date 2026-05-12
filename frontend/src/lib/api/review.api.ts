import { api } from './client';

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
