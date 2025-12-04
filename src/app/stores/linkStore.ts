import { create } from 'zustand';
import { api } from '../lib/api';
import type { Link, Pagination, LinkStats } from '../lib/api';

interface LinkState {
  links: Link[];
  pagination: Pagination | null;
  currentLink: Link | null;
  currentStats: LinkStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLinks: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }) => Promise<void>;
  fetchLink: (id: string) => Promise<void>;
  createLink: (data: {
    url: string;
    title?: string;
    custom_code?: string;
    expires_at?: string;
    click_limit?: number;
  }) => Promise<Link | null>;
  updateLink: (
    id: string,
    data: {
      title?: string;
      is_active?: boolean;
      expires_at?: string;
      click_limit?: number;
    }
  ) => Promise<boolean>;
  deleteLink: (id: string) => Promise<boolean>;
  fetchLinkStats: (id: string, period?: '7d' | '30d' | '90d' | 'all') => Promise<void>;
  clearCurrentLink: () => void;
  clearError: () => void;
}

export const useLinkStore = create<LinkState>()((set) => ({
  links: [],
  pagination: null,
  currentLink: null,
  currentStats: null,
  isLoading: false,
  error: null,

  fetchLinks: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getLinks(params);
      if (response.error) {
        set({ error: response.error.message, isLoading: false });
        return;
      }
      if (response.data) {
        set({
          links: response.data.links,
          pagination: response.data.pagination,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to fetch links', isLoading: false });
    }
  },

  fetchLink: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getLink(id);
      if (response.error) {
        set({ error: response.error.message, isLoading: false });
        return;
      }
      if (response.data) {
        set({ currentLink: response.data.link, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch link', isLoading: false });
    }
  },

  createLink: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.createLink(data);
      if (response.error) {
        set({ error: response.error.message, isLoading: false });
        return null;
      }
      if (response.data) {
        // Add new link to the beginning of the list
        set((state) => ({
          links: [response.data!.link, ...state.links],
          isLoading: false,
        }));
        return response.data.link;
      }
      return null;
    } catch (error) {
      set({ error: 'Failed to create link', isLoading: false });
      return null;
    }
  },

  updateLink: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.updateLink(id, data);
      if (response.error) {
        set({ error: response.error.message, isLoading: false });
        return false;
      }
      if (response.data) {
        // Update link in the list
        set((state) => ({
          links: state.links.map((link) =>
            link.id === id ? response.data!.link : link
          ),
          currentLink:
            state.currentLink?.id === id ? response.data!.link : state.currentLink,
          isLoading: false,
        }));
        return true;
      }
      return false;
    } catch (error) {
      set({ error: 'Failed to update link', isLoading: false });
      return false;
    }
  },

  deleteLink: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.deleteLink(id);
      if (response.error) {
        set({ error: response.error.message, isLoading: false });
        return false;
      }
      // Remove link from the list
      set((state) => ({
        links: state.links.filter((link) => link.id !== id),
        currentLink: state.currentLink?.id === id ? null : state.currentLink,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to delete link', isLoading: false });
      return false;
    }
  },

  fetchLinkStats: async (id, period = '7d') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getLinkStats(id, period);
      if (response.error) {
        set({ error: response.error.message, isLoading: false });
        return;
      }
      if (response.data) {
        set({ currentStats: response.data, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch stats', isLoading: false });
    }
  },

  clearCurrentLink: () => set({ currentLink: null, currentStats: null }),
  clearError: () => set({ error: null }),
}));
