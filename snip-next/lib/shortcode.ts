import { customAlphabet } from 'nanoid'

// Base62 alphabet (0-9, a-z, A-Z)
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const nanoid = customAlphabet(alphabet, 6)

/**
 * Generate a unique 6-character short code
 */
export function generateShortCode(): string {
  return nanoid()
}

/**
 * Validate custom alias format
 * - 3-20 characters
 * - Alphanumeric and hyphens only
 * - Cannot start or end with hyphen
 */
export function isValidCustomAlias(alias: string): boolean {
  const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{1,18}[a-zA-Z0-9])?$/
  return pattern.test(alias)
}

/**
 * Reserved short codes that cannot be used
 */
const RESERVED_CODES = [
  'api',
  'app',
  'dashboard',
  'login',
  'logout',
  'signup',
  'auth',
  'admin',
  'settings',
  'pricing',
  'docs',
  'help',
  'about',
  'terms',
  'privacy',
  'contact',
]

/**
 * Check if a short code is reserved
 */
export function isReservedCode(code: string): boolean {
  return RESERVED_CODES.includes(code.toLowerCase())
}
