import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { authMiddleware, optionalAuthMiddleware } from '@worker/middleware/auth';
import { signToken } from '@worker/lib/jwt';
import { ApiError } from '@worker/lib/errors';

const TEST_SECRET = 'test-secret-key';

// Create test app with middleware
function createTestApp() {
  const app = new Hono<{
    Bindings: { JWT_SECRET: string; DB: D1Database };
    Variables: { userId: string; user: { id: string } };
  }>();

  // Add error handler like in main app
  app.onError((err, c) => {
    if (err instanceof ApiError) {
      return c.json(err.toJSON(), err.statusCode as 400 | 401 | 403 | 404 | 429 | 500);
    }
    return c.json({ error: { code: 'SERVER_ERROR', message: err.message } }, 500);
  });

  // Mock DB
  const mockDb = {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
      }),
    }),
  };

  // Apply middleware to test routes
  app.use('/protected/*', async (c, next) => {
    // Inject mock environment
    c.env = { JWT_SECRET: TEST_SECRET, DB: mockDb as unknown as D1Database };
    return authMiddleware(c, next);
  });

  app.use('/optional/*', async (c, next) => {
    c.env = { JWT_SECRET: TEST_SECRET, DB: mockDb as unknown as D1Database };
    return optionalAuthMiddleware(c, next);
  });

  app.get('/protected/data', (c) => {
    return c.json({ userId: c.get('userId') });
  });

  app.get('/optional/data', (c) => {
    const userId = c.get('userId');
    return c.json({ userId: userId || 'anonymous' });
  });

  return app;
}

describe('Auth Middleware', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();
  });

  describe('authMiddleware (required)', () => {
    it('should allow request with valid token', async () => {
      const token = await signToken({ userId: 'user_123' }, TEST_SECRET);

      const res = await app.request('/protected/data', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { userId: string };
      expect(body.userId).toBe('user_123');
    });

    it('should reject request without Authorization header', async () => {
      const res = await app.request('/protected/data');

      expect(res.status).toBe(401);
      const body = await res.json() as { error: { code: string } };
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with invalid token', async () => {
      const res = await app.request('/protected/data', {
        headers: { Authorization: 'Bearer invalid-token' },
      });

      expect(res.status).toBe(401);
    });

    it('should reject request with expired token', async () => {
      // Create a token that expires immediately
      const token = await signToken({ userId: 'user_123' }, TEST_SECRET, -1);

      const res = await app.request('/protected/data', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(401);
    });

    it('should reject request with wrong secret', async () => {
      const token = await signToken({ userId: 'user_123' }, 'wrong-secret');

      const res = await app.request('/protected/data', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(401);
    });
  });

  describe('optionalAuthMiddleware', () => {
    it('should allow request with valid token and set userId', async () => {
      const token = await signToken({ userId: 'user_123' }, TEST_SECRET);

      const res = await app.request('/optional/data', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { userId: string };
      expect(body.userId).toBe('user_123');
    });

    it('should allow request without token (anonymous)', async () => {
      const res = await app.request('/optional/data');

      expect(res.status).toBe(200);
      const body = await res.json() as { userId: string };
      expect(body.userId).toBe('anonymous');
    });

    it('should allow request with invalid token (treat as anonymous)', async () => {
      const res = await app.request('/optional/data', {
        headers: { Authorization: 'Bearer invalid-token' },
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { userId: string };
      expect(body.userId).toBe('anonymous');
    });
  });
});
