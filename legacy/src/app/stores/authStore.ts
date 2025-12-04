import { create } from 'zustand';
import { api } from '../lib/api';
import type { User, Plan } from '@/types';

interface AuthState {
  user: User | null;
  plan: Plan | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setToken: (token: string) => void;
  fetchCurrentUser: () => Promise<void>;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  plan: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  login: async (token: string) => {
    get().setToken(token);
    await get().fetchCurrentUser();
    return !!get().user;
  },

  fetchCurrentUser: async () => {
    const { token } = get();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const data = await api.get<{ user: User; plan: Plan | null }>('/auth/me', { token });
      set({ user: data.user, plan: data.plan, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({ user: null, plan: null, token: null, isAuthenticated: false, isLoading: false, error: 'Failed to authenticate' });
      localStorage.removeItem('token');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, plan: null, token: null, isAuthenticated: false });
  },
}));
