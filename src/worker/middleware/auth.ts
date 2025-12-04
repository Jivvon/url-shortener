import type { Context, Next } from 'hono';
import { verifyToken, extractBearerToken } from '../lib/jwt';
import { getUser } from '../lib/db';
import { unauthorizedError } from '../lib/errors';
import type { User } from '@/types';

// Extend Hono context to include auth variables
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    user: User;
  }
}

/**
 * Authentication middleware (required)
 * Validates JWT token and attaches user info to context
 * Returns 401 if token is missing or invalid
 */
export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  const token = extractBearerToken(authHeader ?? null);

  if (!token) {
    throw unauthorizedError('Authentication required');
  }

  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET not configured');
    throw unauthorizedError('Server configuration error');
  }

  const result = await verifyToken(token, jwtSecret);

  if (!result.valid || !result.payload?.userId) {
    throw unauthorizedError(result.error || 'Invalid token');
  }

  // Optionally fetch full user from database
  const user = await getUser(c.env.DB, result.payload.userId);
  if (!user) {
    throw unauthorizedError('User not found');
  }

  // Attach user info to context
  c.set('userId', result.payload.userId);
  c.set('user', user);

  await next();
}

/**
 * Optional authentication middleware
 * Validates JWT token if present, but allows anonymous requests
 * Sets userId and user to undefined if not authenticated
 */
export async function optionalAuthMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  const token = extractBearerToken(authHeader ?? null);

  if (token) {
    const jwtSecret = c.env.JWT_SECRET;

    if (jwtSecret) {
      const result = await verifyToken(token, jwtSecret);

      if (result.valid && result.payload?.userId) {
        const user = await getUser(c.env.DB, result.payload.userId);
        if (user) {
          c.set('userId', result.payload.userId);
          c.set('user', user);
        }
      }
    }
  }

  await next();
}

/**
 * Get current user from context (throws if not authenticated)
 */
export function getCurrentUser(c: Context): User {
  const user = c.get('user');
  if (!user) {
    throw unauthorizedError('Authentication required');
  }
  return user;
}

/**
 * Get current user ID from context (throws if not authenticated)
 */
export function getCurrentUserId(c: Context): string {
  const userId = c.get('userId');
  if (!userId) {
    throw unauthorizedError('Authentication required');
  }
  return userId;
}

/**
 * Check if current request is authenticated
 */
export function isAuthenticated(c: Context): boolean {
  return !!c.get('userId');
}
