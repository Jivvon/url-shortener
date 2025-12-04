import { ApiError } from '@/worker/lib/errors';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = (await response.json()) as { error?: { code: string; message: string; details?: unknown } } & T;

  if (!response.ok) {
    throw new ApiError(
      (data.error?.code || 'UNKNOWN_ERROR') as import('@/worker/lib/errors').ErrorCode,
      data.error?.message || 'An unknown error occurred',
      response.status,
      data.error?.details as Record<string, unknown> | undefined
    );
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  getGoogleLoginUrl: () => request<{ url: string }>('/auth/google/login'),
};
