// API Client for Snip backend

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      const data = await response.json() as T | { error: ApiError };

      if (!response.ok) {
        const errorData = data as { error?: ApiError };
        return { error: errorData.error || { code: 'UNKNOWN', message: 'An error occurred' } };
      }

      return { data: data as T };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }
  }

  // Auth endpoints
  async getGoogleLoginUrl(): Promise<string> {
    return `${this.baseUrl}/auth/google/login`;
  }

  async handleGoogleCallback(code: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User; plan: Plan }>> {
    return this.request('/auth/me');
  }

  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    const response = await this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
    return response;
  }

  // Links endpoints
  async getLinks(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }): Promise<ApiResponse<{ links: Link[]; pagination: Pagination }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return this.request(`/links${query ? `?${query}` : ''}`);
  }

  async getLink(id: string): Promise<ApiResponse<{ link: Link }>> {
    return this.request(`/links/${id}`);
  }

  async createLink(data: {
    url: string;
    title?: string;
    custom_code?: string;
    expires_at?: string;
    click_limit?: number;
  }): Promise<ApiResponse<{ link: Link }>> {
    return this.request('/links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLink(
    id: string,
    data: {
      title?: string;
      is_active?: boolean;
      expires_at?: string;
      click_limit?: number;
    }
  ): Promise<ApiResponse<{ link: Link }>> {
    return this.request(`/links/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLink(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/links/${id}`, {
      method: 'DELETE',
    });
  }

  // Stats endpoints
  async getLinkStats(
    id: string,
    period: '7d' | '30d' | '90d' | 'all' = '7d'
  ): Promise<ApiResponse<LinkStats>> {
    return this.request(`/links/${id}/stats?period=${period}`);
  }
}

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  plan_id: string;
  url_count_this_month: number;
  month_reset_at?: string;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  url_limit: number;
  stats_retention_days: number;
  features: {
    customAlias: boolean;
    expiration: boolean;
    bulk: boolean;
    qrCustom: boolean;
  };
}

export interface Link {
  id: string;
  short_code: string;
  short_url: string;
  original_url: string;
  title: string | null;
  is_active: boolean;
  expires_at: string | null;
  click_limit: number | null;
  total_clicks: number;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface LinkStats {
  summary: {
    total_clicks: number;
    unique_visitors: number;
    avg_daily_clicks: number;
  };
  daily: Array<{
    date: string;
    clicks: number;
    unique: number;
  }>;
  countries: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  referers: Record<string, number>;
}

// Export singleton instance
export const api = new ApiClient(API_BASE);
export type { ApiError, ApiResponse };
