import { writable, derived } from 'svelte/store';
import { cartApi } from '../api/cart.api';
import type { Product } from './products';

export interface CartItem {
  _id: string;
  productId: Product;
  quantity: number;
  size: string;
  color?: string;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

function createCartStore() {
  const { subscribe, set, update } = writable<CartState>(initialState);

  return {
    subscribe,
    fetchCart: async () => {
      update(s => ({ ...s, loading: true }));
      try {
        const { data } = await cartApi.getCart();
        update(s => ({ ...s, items: data.items, loading: false }));
      } catch (err: any) {
        update(s => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to fetch cart' }));
      }
    },
    addItem: async (itemData: { productId: string; quantity: number; size: string; color?: string }) => {
      update(s => ({ ...s, loading: true }));
      try {
        const { data } = await cartApi.addItem(itemData);
        update(s => ({ ...s, items: data.items, loading: false }));
      } catch (err: any) {
        update(s => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to add item' }));
        throw err;
      }
    },
    updateQuantity: async (itemId: string, quantity: number) => {
      update(s => ({ ...s, loading: true }));
      try {
        const { data } = await cartApi.updateQuantity(itemId, quantity);
        update(s => ({ ...s, items: data.items, loading: false }));
      } catch (err: any) {
        update(s => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to update quantity' }));
      }
    },
    removeItem: async (itemId: string) => {
      update(s => ({ ...s, loading: true }));
      try {
        const { data } = await cartApi.removeItem(itemId);
        update(s => ({ ...s, items: data.items, loading: false }));
      } catch (err: any) {
        update(s => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to remove item' }));
      }
    },
    clearCart: async () => {
      update(s => ({ ...s, loading: true }));
      try {
        await cartApi.clearCart();
        update(s => ({ ...s, items: [], loading: false }));
      } catch (err: any) {
        update(s => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to clear cart' }));
      }
    }
  };
}

export const cart = createCartStore();

export const cartTotal = derived(cart, ($cart) => {
  return $cart.items.reduce((total, item) => {
    const price = item.productId.discountPrice || item.productId.price;
    return total + price * item.quantity;
  }, 0);
});

export const cartCount = derived(cart, ($cart) => {
  return $cart.items.reduce((count, item) => count + item.quantity, 0);
});
