import { writable } from 'svelte/store';
import { wishlistApi } from '../api/wishlist.api';
import type { Product } from './products';

interface WishlistState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

function createWishlistStore() {
  const { subscribe, set, update } = writable<WishlistState>(initialState);

  return {
    subscribe,
    fetchWishlist: async () => {
      update(s => ({ ...s, loading: true, error: null }));
      try {
        const { data } = await wishlistApi.getWishlist();
        update(s => ({ ...s, items: data, loading: false }));
      } catch (err: any) {
        update(s => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to fetch wishlist' }));
      }
    },
    toggle: async (productId: string) => {
      try {
        const { message } = await wishlistApi.toggleWishlist(productId);
        // Refresh wishlist after toggle to ensure UI is in sync
        const { data } = await wishlistApi.getWishlist();
        update(s => ({ ...s, items: data }));
        return { success: true, message };
      } catch (err: any) {
        return { success: false, message: err.response?.data?.message || 'Action failed' };
      }
    },
    isInWishlist: (productId: string, items: Product[]) => {
      return items.some(item => item._id === productId);
    }
  };
}

export const wishlist = createWishlistStore();
