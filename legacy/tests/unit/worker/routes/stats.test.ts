import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import statsRoutes from '@worker/routes/stats';
import { signToken } from '@worker/lib/jwt';
import { ApiError } from '@worker/lib/errors';

const TEST_SECRET = 'test-secret-key';

// Create test app
function createTestApp() {
  const app = new Hono<{
    Bindings: { JWT_SECRET: string; DB: D1Database; SHORT_DOMAIN: string };
    Variables: { userId: string; user: { id: string } };
  }>();

  // Error handler
  app.onError((err, c) => {
    if (err instanceof ApiError) {
      return c.json(err.toJSON(), err.statusCode as 400 | 401 | 403 | 404 | 500);
    }
    return c.json({ error: { code: 'SERVER_ERROR', message: err.message } }, 500);
  });

  // Mock middleware to inject auth
  app.use('/api/links/*', async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      c.set('userId', 'user_123');
      c.set('user', { id: 'user_123' });
    }
    return next();
  });

  // Mount stats routes
  app.route('/api/links', statsRoutes);

  return app;
}

describe('Stats Routes', () => {
  let app: ReturnType<typeof createTestApp>;
  let mockDb: {
    prepare: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();

    mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        first: vi.fn(),
        all: vi.fn(),
      }),
    };
  });

  describe('GET /api/links/:id/stats', () => {
    it('should return stats for owned link', async () => {
      const mockLink = {
        id: 'link_123',
        user_id: 'user_123',
        short_code: 'abc123',
        original_url: 'https://example.com',
        is_active: 1,
      };

      const mockSummary = {
        total_clicks: 100,
        unique_visitors: 80,
      };

      const mockDaily = [
        { date: '2024-01-15', clicks: 50, unique: 40 },
        { date: '2024-01-16', clicks: 50, unique: 40 },
      ];

      // Configure mock responses
      const bindMock = vi.fn().mockReturnThis();
      const firstMock = vi.fn();
      const allMock = vi.fn();

      firstMock.mockResolvedValueOnce(mockLink); // getLink
      firstMock.mockResolvedValueOnce(mockSummary); // summary
      allMock.mockResolvedValueOnce({ results: mockDaily }); // daily
      allMock.mockResolvedValueOnce({ results: [] }); // countries
      allMock.mockResolvedValueOnce({ results: [] }); // devices
      allMock.mockResolvedValueOnce({ results: [] }); // browsers
      allMock.mockResolvedValueOnce({ results: [] }); // referers

      mockDb.prepare.mockReturnValue({
        bind: bindMock,
        first: firstMock,
        all: allMock,
      });

      const token = await signToken({ userId: 'user_123' }, TEST_SECRET);

      const res = await app.request('/api/links/link_123/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }, {
        JWT_SECRET: TEST_SECRET,
        DB: mockDb as unknown as D1Database,
        SHORT_DOMAIN: 's.lento.dev',
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { summary: { total_clicks: number } };
      expect(body.summary.total_clicks).toBe(100);
    });

    it('should return 401 without authentication', async () => {
      const res = await app.request('/api/links/link_123/stats');

      // Without auth header, the mock middleware doesn't set userId
      // The route should check for authentication
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent link', async () => {
      const bindMock = vi.fn().mockReturnThis();
      const firstMock = vi.fn().mockResolvedValue(null);

      mockDb.prepare.mockReturnValue({
        bind: bindMock,
        first: firstMock,
        all: vi.fn(),
      });

      const token = await signToken({ userId: 'user_123' }, TEST_SECRET);

      const res = await app.request('/api/links/nonexistent/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }, {
        JWT_SECRET: TEST_SECRET,
        DB: mockDb as unknown as D1Database,
        SHORT_DOMAIN: 's.lento.dev',
      });

      expect(res.status).toBe(404);
    });

    it('should return 403 for link not owned by user', async () => {
      const mockLink = {
        id: 'link_123',
        user_id: 'other_user', // Different user
        short_code: 'abc123',
        original_url: 'https://example.com',
        is_active: 1,
      };

      const bindMock = vi.fn().mockReturnThis();
      const firstMock = vi.fn().mockResolvedValue(mockLink);

      mockDb.prepare.mockReturnValue({
        bind: bindMock,
        first: firstMock,
        all: vi.fn(),
      });

      const token = await signToken({ userId: 'user_123' }, TEST_SECRET);

      const res = await app.request('/api/links/link_123/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }, {
        JWT_SECRET: TEST_SECRET,
        DB: mockDb as unknown as D1Database,
        SHORT_DOMAIN: 's.lento.dev',
      });

      expect(res.status).toBe(403);
    });

    it('should accept period query parameter', async () => {
      const mockLink = {
        id: 'link_123',
        user_id: 'user_123',
        short_code: 'abc123',
        is_active: 1,
      };

      const bindMock = vi.fn().mockReturnThis();
      const firstMock = vi.fn();
      const allMock = vi.fn();

      firstMock.mockResolvedValueOnce(mockLink);
      firstMock.mockResolvedValueOnce({ total_clicks: 0, unique_visitors: 0 });
      allMock.mockResolvedValue({ results: [] });

      mockDb.prepare.mockReturnValue({
        bind: bindMock,
        first: firstMock,
        all: allMock,
      });

      const token = await signToken({ userId: 'user_123' }, TEST_SECRET);

      const res = await app.request('/api/links/link_123/stats?period=30d', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }, {
        JWT_SECRET: TEST_SECRET,
        DB: mockDb as unknown as D1Database,
        SHORT_DOMAIN: 's.lento.dev',
      });

      expect(res.status).toBe(200);
    });
  });
});
