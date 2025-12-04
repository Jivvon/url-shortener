import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cacheUrl,
  getCachedUrl,
  deleteCachedUrl,
  getCachedUrlWithMetadata,
} from '@worker/lib/kv';

// Mock KVNamespace
const mockKV = {
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  getWithMetadata: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('KV Helper Functions', () => {
  describe('cacheUrl', () => {
    it('should cache URL with short code', async () => {
      mockKV.put.mockResolvedValue(undefined);

      await cacheUrl(mockKV as unknown as KVNamespace, 'abc123', 'https://example.com');

      expect(mockKV.put).toHaveBeenCalledWith('abc123', 'https://example.com', undefined);
    });

    it('should cache URL with metadata', async () => {
      mockKV.put.mockResolvedValue(undefined);

      const metadata = { linkId: 'link_123', userId: 'user_456' };
      await cacheUrl(mockKV as unknown as KVNamespace, 'abc123', 'https://example.com', {
        metadata,
      });

      expect(mockKV.put).toHaveBeenCalledWith(
        'abc123',
        'https://example.com',
        expect.objectContaining({ metadata })
      );
    });

    it('should cache URL with expiration TTL', async () => {
      mockKV.put.mockResolvedValue(undefined);

      await cacheUrl(mockKV as unknown as KVNamespace, 'abc123', 'https://example.com', {
        expirationTtl: 86400,
      });

      expect(mockKV.put).toHaveBeenCalledWith(
        'abc123',
        'https://example.com',
        expect.objectContaining({ expirationTtl: 86400 })
      );
    });
  });

  describe('getCachedUrl', () => {
    it('should return cached URL', async () => {
      mockKV.get.mockResolvedValue('https://example.com');

      const result = await getCachedUrl(mockKV as unknown as KVNamespace, 'abc123');

      expect(mockKV.get).toHaveBeenCalledWith('abc123');
      expect(result).toBe('https://example.com');
    });

    it('should return null for non-existent key', async () => {
      mockKV.get.mockResolvedValue(null);

      const result = await getCachedUrl(mockKV as unknown as KVNamespace, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getCachedUrlWithMetadata', () => {
    it('should return URL with metadata', async () => {
      const mockResult = {
        value: 'https://example.com',
        metadata: { linkId: 'link_123', userId: 'user_456' },
      };
      mockKV.getWithMetadata.mockResolvedValue(mockResult);

      const result = await getCachedUrlWithMetadata(mockKV as unknown as KVNamespace, 'abc123');

      expect(mockKV.getWithMetadata).toHaveBeenCalledWith('abc123');
      expect(result).toEqual(mockResult);
    });

    it('should return null value and metadata for non-existent key', async () => {
      mockKV.getWithMetadata.mockResolvedValue({ value: null, metadata: null });

      const result = await getCachedUrlWithMetadata(mockKV as unknown as KVNamespace, 'nonexistent');

      expect(result.value).toBeNull();
      expect(result.metadata).toBeNull();
    });
  });

  describe('deleteCachedUrl', () => {
    it('should delete cached URL', async () => {
      mockKV.delete.mockResolvedValue(undefined);

      await deleteCachedUrl(mockKV as unknown as KVNamespace, 'abc123');

      expect(mockKV.delete).toHaveBeenCalledWith('abc123');
    });
  });
});
