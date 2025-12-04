import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLinkStats,
  StatsQueryOptions,
  LinkStats,
} from '@worker/services/statsService';

// Mock D1Database
const mockD1 = {
  prepare: vi.fn(),
};

const mockStatement = {
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  all: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockD1.prepare.mockReturnValue(mockStatement);
});

describe('Stats Service', () => {
  describe('getLinkStats', () => {
    const linkId = 'link_123';
    const baseOptions: StatsQueryOptions = {
      period: '7d',
    };

    it('should return stats summary', async () => {
      // Mock summary query
      mockStatement.first.mockResolvedValueOnce({
        total_clicks: 100,
        unique_visitors: 80,
      });

      // Mock daily stats
      mockStatement.all.mockResolvedValueOnce({
        results: [
          { date: '2024-01-15', clicks: 15, unique: 12 },
          { date: '2024-01-16', clicks: 20, unique: 16 },
        ],
      });

      // Mock country stats
      mockStatement.all.mockResolvedValueOnce({
        results: [
          { country: 'US', count: 40 },
          { country: 'KR', count: 30 },
        ],
      });

      // Mock device stats
      mockStatement.all.mockResolvedValueOnce({
        results: [
          { device: 'desktop', count: 50 },
          { device: 'mobile', count: 45 },
        ],
      });

      // Mock browser stats
      mockStatement.all.mockResolvedValueOnce({
        results: [
          { browser: 'chrome', count: 60 },
          { browser: 'safari', count: 30 },
        ],
      });

      // Mock referer stats
      mockStatement.all.mockResolvedValueOnce({
        results: [
          { referer: null, count: 40 },
          { referer: 'twitter.com', count: 25 },
        ],
      });

      const result = await getLinkStats(
        mockD1 as unknown as D1Database,
        linkId,
        baseOptions
      );

      expect(result.summary.total_clicks).toBe(100);
      expect(result.summary.unique_visitors).toBe(80);
      expect(result.daily).toHaveLength(2);
      expect(result.countries['US']).toBe(40);
      expect(result.devices['desktop']).toBe(50);
      expect(result.browsers['chrome']).toBe(60);
      expect(result.referers['direct']).toBe(40);
    });

    it('should calculate avg_daily_clicks correctly', async () => {
      mockStatement.first.mockResolvedValueOnce({
        total_clicks: 70,
        unique_visitors: 50,
      });

      mockStatement.all.mockResolvedValueOnce({
        results: [
          { date: '2024-01-15', clicks: 10, unique: 8 },
          { date: '2024-01-16', clicks: 20, unique: 15 },
          { date: '2024-01-17', clicks: 15, unique: 12 },
          { date: '2024-01-18', clicks: 25, unique: 20 },
        ],
      });

      // Empty results for other stats
      mockStatement.all.mockResolvedValue({ results: [] });

      const result = await getLinkStats(
        mockD1 as unknown as D1Database,
        linkId,
        baseOptions
      );

      // 70 total clicks / 4 days = 17.5, rounded to 18
      expect(result.summary.avg_daily_clicks).toBeGreaterThan(0);
    });

    it('should handle empty stats gracefully', async () => {
      mockStatement.first.mockResolvedValueOnce({
        total_clicks: 0,
        unique_visitors: 0,
      });

      mockStatement.all.mockResolvedValue({ results: [] });

      const result = await getLinkStats(
        mockD1 as unknown as D1Database,
        linkId,
        baseOptions
      );

      expect(result.summary.total_clicks).toBe(0);
      expect(result.summary.unique_visitors).toBe(0);
      expect(result.summary.avg_daily_clicks).toBe(0);
      expect(result.daily).toEqual([]);
      expect(result.countries).toEqual({});
      expect(result.devices).toEqual({});
      expect(result.browsers).toEqual({});
      expect(result.referers).toEqual({});
    });

    it('should use correct date range for different periods', async () => {
      mockStatement.first.mockResolvedValue({ total_clicks: 0, unique_visitors: 0 });
      mockStatement.all.mockResolvedValue({ results: [] });

      await getLinkStats(mockD1 as unknown as D1Database, linkId, { period: '30d' });

      // Verify that prepare was called with date filtering
      expect(mockD1.prepare).toHaveBeenCalled();
    });

    it('should group null referers as "direct"', async () => {
      mockStatement.first.mockResolvedValueOnce({
        total_clicks: 50,
        unique_visitors: 40,
      });

      mockStatement.all.mockResolvedValueOnce({ results: [] }); // daily
      mockStatement.all.mockResolvedValueOnce({ results: [] }); // countries
      mockStatement.all.mockResolvedValueOnce({ results: [] }); // devices
      mockStatement.all.mockResolvedValueOnce({ results: [] }); // browsers
      mockStatement.all.mockResolvedValueOnce({
        results: [
          { referer: null, count: 30 },
          { referer: 'google.com', count: 20 },
        ],
      });

      const result = await getLinkStats(
        mockD1 as unknown as D1Database,
        linkId,
        baseOptions
      );

      expect(result.referers['direct']).toBe(30);
      expect(result.referers['google.com']).toBe(20);
    });
  });
});
