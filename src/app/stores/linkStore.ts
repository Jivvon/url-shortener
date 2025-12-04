import { create } from 'zustand';
import { api } from '../lib/api';
import { useAuthStore } from './authStore';
import type { Link, DailyStats } from '@/types';

export interface EnrichedLink extends Link {
  short_url: string;
}

interface LinkState {
  links: EnrichedLink[];
  currentLink: EnrichedLink | null;
  currentStats: {
    summary: {
      total_clicks: number;
      unique_visitors: number;
      avg_daily_clicks: number;
    };
    daily: DailyStats[];
    countries: Record<string, number>;
    devices: Record<string, number>;
    browsers: Record<string, number>;
    referers: Record<string, number>;
  } | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    total_pages: number; // Alias
  };
  total: number; // Keep for backward compatibility if needed, or remove if pagination covers it
  isLoading: boolean;
  error: string | null;

  fetchLinks: (options?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  fetchLink: (id: string) => Promise<void>;
  fetchLinkStats: (id: string, period?: string) => Promise<void>;
  createLink: (data: { url: string; title?: string; custom_code?: string; expires_at?: string }) => Promise<EnrichedLink>;
  updateLink: (id: string, data: Partial<Link>) => Promise<boolean>;
  deleteLink: (id: string) => Promise<boolean>;
  clearCurrentLink: () => void;
  clearError: () => void;
}

export const useLinkStore = create<LinkState>((set) => ({
  links: [],
  currentLink: null,
  currentStats: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    total_pages: 0,
  },
  total: 0,
  isLoading: false,
  error: null,

  fetchLinks: async (options = {}) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    const { page = 1, limit = 20, search = '' } = options;

    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const data = await api.get<{
        links: EnrichedLink[];
        pagination: { total: number; total_pages: number; page: number; limit: number };
      }>(`/links?${queryParams}`, { token });

      set({
        links: data.links,
        pagination: {
          total: data.pagination.total,
          totalPages: data.pagination.total_pages,
          page: data.pagination.page,
          limit: data.pagination.limit,
          total_pages: data.pagination.total_pages, // Add alias for compatibility
        } as any,
        total: data.pagination.total,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch links' });
    }
  },

  fetchLink: async (id: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const data = await api.get<{ link: EnrichedLink }>(`/links/${id}`, { token });
      set({ currentLink: data.link, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch link details' });
    }
  },

  fetchLinkStats: async (id: string, period = '7d') => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const data = await api.get<LinkState['currentStats']>(`/links/${id}/stats?period=${period}`, { token });
      set({ currentStats: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch link stats' });
    }
  },

  createLink: async (data) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ link: EnrichedLink }>('/links', data, { token });
      const newLink = response.link;

      set((state) => ({
        links: [newLink, ...state.links],
        total: state.total + 1,
        isLoading: false,
      }));

      return newLink;
    } catch (error: any) {
      const message = error.message || 'Failed to create link';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  updateLink: async (id: string, data: Partial<Link>) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<{ link: EnrichedLink }>(`/links/${id}`, data, { token });
      const updatedLink = response.link;

      set((state) => ({
        links: state.links.map((l) => (l.id === id ? updatedLink : l)),
        currentLink: state.currentLink?.id === id ? updatedLink : state.currentLink,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to update link' });
      return false;
    }
  },

  deleteLink: async (id: string) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    try {
      await api.delete(`/links/${id}`, { token });
      set((state) => ({
        links: state.links.filter((l) => l.id !== id),
        total: state.total - 1,
        currentLink: state.currentLink?.id === id ? null : state.currentLink,
      }));
      return true;
    } catch (error) {
      console.error('Failed to delete link:', error);
      return false;
    }
  },

  clearCurrentLink: () => {
    set({ currentLink: null, currentStats: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
