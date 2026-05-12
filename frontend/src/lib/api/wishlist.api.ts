import { api } from './client';

export const wishlistApi = {
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },
  toggleWishlist: async (productId: string) => {
    const response = await api.post('/wishlist/toggle', { productId });
    return response.data;
  },
};
