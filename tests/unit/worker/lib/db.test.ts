import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUser,
  getUserByGoogleId,
  createUser,
  getLink,
  getLinkByShortCode,
  createLink,
  deleteLink,
  getUserLinks,
  getPlan,
} from '@worker/lib/db';

// Mock D1Database
const mockD1 = {
  prepare: vi.fn(),
};

const mockStatement = {
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockD1.prepare.mockReturnValue(mockStatement);
});

describe('Database Helper Functions', () => {
  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
      };
      mockStatement.first.mockResolvedValue(mockUser);

      const result = await getUser(mockD1 as unknown as D1Database, 'user_123');

      expect(mockD1.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE id = ?')
      );
      expect(mockStatement.bind).toHaveBeenCalledWith('user_123');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockStatement.first.mockResolvedValue(null);

      const result = await getUser(mockD1 as unknown as D1Database, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserByGoogleId', () => {
    it('should find user by Google ID', async () => {
      const mockUser = { id: 'user_123', google_id: 'google_456' };
      mockStatement.first.mockResolvedValue(mockUser);

      const result = await getUserByGoogleId(mockD1 as unknown as D1Database, 'google_456');

      expect(mockD1.prepare).toHaveBeenCalledWith(
        expect.stringContaining('WHERE google_id = ?')
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      mockStatement.run.mockResolvedValue({ success: true });
      mockStatement.first.mockResolvedValue({
        id: 'user_new',
        email: 'new@example.com',
      });

      const userData = {
        google_id: 'google_789',
        email: 'new@example.com',
        name: 'New User',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const result = await createUser(mockD1 as unknown as D1Database, userData);

      expect(mockStatement.run).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getLink', () => {
    it('should return link when found', async () => {
      // DB returns is_active as integer (0 or 1)
      const mockLinkRow = {
        id: 'link_123',
        short_code: 'abc123',
        original_url: 'https://example.com',
        is_active: 1,
      };
      mockStatement.first.mockResolvedValue(mockLinkRow);

      const result = await getLink(mockD1 as unknown as D1Database, 'link_123');

      // Should transform is_active from 1 to true
      expect(result?.id).toBe('link_123');
      expect(result?.short_code).toBe('abc123');
      expect(result?.is_active).toBe(true);
    });

    it('should return null when link not found', async () => {
      mockStatement.first.mockResolvedValue(null);

      const result = await getLink(mockD1 as unknown as D1Database, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getLinkByShortCode', () => {
    it('should find link by short code', async () => {
      const mockLinkRow = { id: 'link_123', short_code: 'abc123', is_active: 1 };
      mockStatement.first.mockResolvedValue(mockLinkRow);

      const result = await getLinkByShortCode(mockD1 as unknown as D1Database, 'abc123');

      expect(mockD1.prepare).toHaveBeenCalledWith(
        expect.stringContaining('WHERE short_code = ?')
      );
      expect(result?.id).toBe('link_123');
      expect(result?.short_code).toBe('abc123');
      expect(result?.is_active).toBe(true);
    });
  });

  describe('getUserLinks', () => {
    it('should return paginated links for user', async () => {
      const mockLinkRows = [
        { id: 'link_1', short_code: 'abc123', is_active: 1 },
        { id: 'link_2', short_code: 'def456', is_active: 0 },
      ];
      mockStatement.all.mockResolvedValue({ results: mockLinkRows });
      mockStatement.first.mockResolvedValue({ count: 10 });

      const result = await getUserLinks(mockD1 as unknown as D1Database, 'user_123', {
        page: 1,
        limit: 20,
      });

      expect(result.links.length).toBe(2);
      expect(result.links[0].is_active).toBe(true);
      expect(result.links[1].is_active).toBe(false);
      expect(result.total).toBe(10);
    });
  });

  describe('createLink', () => {
    it('should create a new link', async () => {
      mockStatement.run.mockResolvedValue({ success: true });
      const mockLinkRow = {
        id: 'link_new',
        short_code: 'xyz789',
        original_url: 'https://example.com',
        is_active: 1,
      };
      mockStatement.first.mockResolvedValue(mockLinkRow);

      const linkData = {
        user_id: 'user_123',
        short_code: 'xyz789',
        original_url: 'https://example.com',
        title: 'Test Link',
      };

      const result = await createLink(mockD1 as unknown as D1Database, linkData);

      expect(result).toBeDefined();
      expect(result.short_code).toBe('xyz789');
      expect(mockStatement.run).toHaveBeenCalled();
    });
  });

  describe('deleteLink', () => {
    it('should delete link by id', async () => {
      mockStatement.run.mockResolvedValue({ success: true, meta: { changes: 1 } });

      const result = await deleteLink(mockD1 as unknown as D1Database, 'link_123');

      expect(mockD1.prepare).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM links WHERE id = ?')
      );
      expect(result).toBe(true);
    });

    it('should return false if link not found', async () => {
      mockStatement.run.mockResolvedValue({ success: true, meta: { changes: 0 } });

      const result = await deleteLink(mockD1 as unknown as D1Database, 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getPlan', () => {
    it('should return plan when found', async () => {
      const mockPlan = {
        id: 'free',
        name: 'Free',
        url_limit: 50,
        features: '{"customAlias":false}',
      };
      mockStatement.first.mockResolvedValue(mockPlan);

      const result = await getPlan(mockD1 as unknown as D1Database, 'free');

      expect(result).toBeDefined();
      expect(result?.id).toBe('free');
      expect(result?.features.customAlias).toBe(false);
    });
  });
});
