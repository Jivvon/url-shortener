import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signToken, verifyToken, decodeToken } from '@worker/lib/jwt';

const TEST_SECRET = 'test-secret-key-for-testing-purposes-only';

describe('JWT Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  describe('signToken', () => {
    it('should create a valid JWT token', async () => {
      const payload = { userId: 'user_123', email: 'test@example.com' };

      const token = await signToken(payload, TEST_SECRET);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should create token with default expiration', async () => {
      const payload = { userId: 'user_123' };

      const token = await signToken(payload, TEST_SECRET);
      const decoded = decodeToken(token);

      expect(decoded?.exp).toBeDefined();
      // Default expiration is 7 days from now
      const expectedExp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      expect(decoded?.exp).toBe(expectedExp);
    });

    it('should create token with custom expiration', async () => {
      const payload = { userId: 'user_123' };
      const expiresIn = 3600; // 1 hour

      const token = await signToken(payload, TEST_SECRET, expiresIn);
      const decoded = decodeToken(token);

      const expectedExp = Math.floor(Date.now() / 1000) + expiresIn;
      expect(decoded?.exp).toBe(expectedExp);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const payload = { userId: 'user_123', email: 'test@example.com' };
      const token = await signToken(payload, TEST_SECRET);

      const result = await verifyToken(token, TEST_SECRET);

      expect(result.valid).toBe(true);
      expect(result.payload?.userId).toBe('user_123');
      expect(result.payload?.email).toBe('test@example.com');
    });

    it('should reject an expired token', async () => {
      const payload = { userId: 'user_123' };
      const token = await signToken(payload, TEST_SECRET, 1); // 1 second

      // Advance time by 2 seconds
      vi.advanceTimersByTime(2000);

      const result = await verifyToken(token, TEST_SECRET);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token expired');
    });

    it('should reject a token with invalid signature', async () => {
      const payload = { userId: 'user_123' };
      const token = await signToken(payload, TEST_SECRET);

      const result = await verifyToken(token, 'wrong-secret');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('should reject a malformed token', async () => {
      const result = await verifyToken('not-a-valid-token', TEST_SECRET);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject a tampered token', async () => {
      const payload = { userId: 'user_123' };
      const token = await signToken(payload, TEST_SECRET);

      // Tamper with the payload
      const parts = token.split('.');
      const tamperedPayload = btoa(JSON.stringify({ userId: 'hacker' }));
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const result = await verifyToken(tamperedToken, TEST_SECRET);

      expect(result.valid).toBe(false);
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', async () => {
      const payload = { userId: 'user_123', custom: 'data' };
      const token = await signToken(payload, TEST_SECRET);

      const decoded = decodeToken(token);

      expect(decoded?.userId).toBe('user_123');
      expect(decoded?.custom).toBe('data');
    });

    it('should return null for invalid token format', () => {
      const decoded = decodeToken('invalid');

      expect(decoded).toBeNull();
    });
  });
});
