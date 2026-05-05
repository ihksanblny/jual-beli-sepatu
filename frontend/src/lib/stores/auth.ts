import { writable } from 'svelte/store';
import { authApi } from '../api/auth.api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    register: async (userData: any) => {
      update(s => ({ ...s, loading: true, error: null }));
      try {
        const { data } = await authApi.register(userData);
        localStorage.setItem('authToken', data.token);
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        update(s => ({
          ...s,
          loading: false,
          error: err.response?.data?.message || 'Registration failed',
        }));
      }
    },
    login: async (credentials: any) => {
      update(s => ({ ...s, loading: true, error: null }));
      try {
        const { data } = await authApi.login(credentials);
        localStorage.setItem('authToken', data.token);
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        update(s => ({
          ...s,
          loading: false,
          error: err.response?.data?.message || 'Login failed',
        }));
      }
    },
    logout: () => {
      localStorage.removeItem('authToken');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    },
    init: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      update(s => ({ ...s, loading: true }));
      try {
        const { data } = await authApi.getMe();
        update(s => ({
          ...s,
          user: data.user,
          isAuthenticated: true,
          loading: false,
        }));
      } catch (err) {
        localStorage.removeItem('authToken');
        update(s => ({
          ...s,
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        }));
      }
    },
    updateUser: (user: User) => {
      update(s => ({ ...s, user }));
    },
    update,
    set,
  };
}

export const auth = createAuthStore();
