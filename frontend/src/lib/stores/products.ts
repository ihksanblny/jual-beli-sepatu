import { writable } from 'svelte/store';
import { productApi } from '../api/product.api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: 'men' | 'women' | 'kids' | 'unisex';
  brand: string;
  price: number;
  discountPrice?: number;
  sizes: { size: string; stock: number }[];
  colors: string[];
  images: { url: string; altText: string; publicId?: string }[];
  rating: number;
  reviewCount: number;
  sku: string;
  featured: boolean;
  specifications?: {
    material?: string;
    sole?: string;
  };
  createdAt: string;
}

interface ProductState {
  items: Product[];
  currentProduct: Product | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  currentProduct: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  loading: false,
  error: null,
};

function createProductStore() {
  const { subscribe, set, update } = writable<ProductState>(initialState);

  return {
    subscribe,
    fetchProducts: async (params: any = {}) => {
      update(s => ({ ...s, loading: true, error: null }));
      try {
        const data = await productApi.getProducts(params);
        update(s => ({
          ...s,
          items: data.products,
          pagination: data.pagination,
          loading: false,
        }));
      } catch (err: any) {
        update(s => ({
          ...s,
          loading: false,
          error: err.response?.data?.message || 'Failed to fetch products',
        }));
      }
    },
    fetchProduct: async (id: string) => {
      update(s => ({ ...s, loading: true, error: null }));
      try {
        const { data } = await productApi.getProduct(id);
        update(s => ({
          ...s,
          currentProduct: data,
          loading: false,
        }));
      } catch (err: any) {
        update(s => ({
          ...s,
          loading: false,
          error: err.response?.data?.message || 'Failed to fetch product',
        }));
      }
    },
    // Admin functions can be added here
  };
}

export const products = createProductStore();
