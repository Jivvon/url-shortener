// ============================================
// URL Validation Utilities
// ============================================

// Allowed protocols for shortened URLs
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

// Blocked domains (basic blocklist - can be expanded)
const BLOCKED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  // Add more as needed
];

export interface ValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  error?: string;
}

/**
 * Check if a URL string is valid
 * @param url - URL string to validate
 * @returns true if valid HTTP/HTTPS URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Normalize a URL string
 * - Add https:// if no protocol
 * - Remove trailing slash
 * - Trim whitespace
 * @param url - URL string to normalize
 * @returns Normalized URL string
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add https:// if no protocol
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slash (except for root path)
  if (normalized.endsWith('/') && normalized.split('/').length > 4) {
    normalized = normalized.slice(0, -1);
  } else if (normalized.match(/^https?:\/\/[^/]+\/$/)) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Extract domain from URL
 * @param url - URL string
 * @returns Domain string or null if invalid
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if URL domain is blocked
 * @param url - URL string
 * @returns true if domain is blocked
 */
export function isBlockedDomain(url: string): boolean {
  const domain = extractDomain(url);
  if (!domain) return false;

  return BLOCKED_DOMAINS.some(
    (blocked) => domain === blocked || domain.endsWith(`.${blocked}`)
  );
}

/**
 * Comprehensive URL validation
 * @param url - URL string to validate
 * @returns Validation result with normalized URL or error
 */
export function validateUrl(url: string): ValidationResult {
  // Check empty
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return {
      valid: false,
      error: 'URL is required',
    };
  }

  // Normalize first
  const normalizedUrl = normalizeUrl(url);

  // Check URL format
  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
    };
  }

  // Check protocol
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return {
      valid: false,
      error: `Invalid protocol: only http and https are allowed`,
    };
  }

  // Check blocked domains
  if (isBlockedDomain(normalizedUrl)) {
    return {
      valid: false,
      error: 'This domain is not allowed',
    };
  }

  // Check URL length (reasonable limit)
  if (normalizedUrl.length > 2048) {
    return {
      valid: false,
      error: 'URL is too long (max 2048 characters)',
    };
  }

  return {
    valid: true,
    normalizedUrl,
  };
}

/**
 * Generate a title from URL if not provided
 * @param url - URL string
 * @returns Extracted title or domain
 */
export function generateTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Use pathname if it's descriptive, otherwise use domain
    if (parsed.pathname && parsed.pathname !== '/') {
      // Get last meaningful path segment
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        // Clean up the segment (remove extension, decode URI)
        return decodeURIComponent(lastSegment.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
    return parsed.hostname;
  } catch {
    return url.slice(0, 50);
  }
}
