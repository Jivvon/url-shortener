// ============================================
// JWT Utilities for Cloudflare Workers
// Using Web Crypto API (available in Workers)
// ============================================

export interface JWTPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface VerifyResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

// Default expiration: 7 days
const DEFAULT_EXPIRATION = 7 * 24 * 60 * 60;

/**
 * Base64URL encode
 */
function base64UrlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64URL decode
 */
function base64UrlDecode(data: string): string {
  const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64);
}

/**
 * Create HMAC-SHA256 signature using Web Crypto API
 */
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const message = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  const signatureArray = new Uint8Array(signature);
  const signatureString = String.fromCharCode(...signatureArray);

  return base64UrlEncode(signatureString);
}

/**
 * Verify HMAC-SHA256 signature
 */
async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await createSignature(data, secret);

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Sign a JWT token
 * @param payload - Token payload
 * @param secret - Secret key for signing
 * @param expiresIn - Expiration time in seconds (default: 7 days)
 * @returns Signed JWT token
 */
export async function signToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: number = DEFAULT_EXPIRATION
): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = await createSignature(dataToSign, secret);

  return `${dataToSign}.${signature}`;
}

/**
 * Verify a JWT token
 * @param token - JWT token to verify
 * @param secret - Secret key for verification
 * @returns Verification result with payload if valid
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<VerifyResult> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const isValidSignature = await verifySignature(dataToVerify, signature, secret);
    if (!isValidSignature) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JWTPayload;

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Decode a JWT token without verification
 * Useful for reading payload when signature verification is not needed
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid format
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(base64UrlDecode(parts[1])) as {
      userId?: string;
      iat?: number;
      exp?: number;
      [key: string]: unknown;
    };

    if (!decoded.userId) {
      return null;
    }

    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
