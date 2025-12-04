import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import type { User, Plan } from '../lib/api';

interface AuthState {
  user: User | null;
  plan: Plan | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null, plan?: Plan | null) => void;
  login: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      plan: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      setUser: (user, plan = null) => {
        set({
          user,
          plan,
          isAuthenticated: !!user,
          error: null,
        });
      },

      login: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.handleGoogleCallback(code);
          if (response.error) {
            set({ error: response.error.message, isLoading: false });
            return false;
          }
          if (response.data) {
            api.setToken(response.data.token);
            // Fetch full user info with plan
            await get().fetchCurrentUser();
            return true;
          }
          return false;
        } catch (error) {
          set({ error: 'Login failed', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await api.logout();
        set({
          user: null,
          plan: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      fetchCurrentUser: async () => {
        const token = api.getToken();
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await api.getCurrentUser();
          if (response.error) {
            // Token invalid or expired
            api.setToken(null);
            set({
              user: null,
              plan: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }
          if (response.data) {
            set({
              user: response.data.user,
              plan: response.data.plan,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist minimal auth state
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
