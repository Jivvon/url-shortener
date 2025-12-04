// ============================================
// Short Code Generator
// 6-digit Base62 encoding (62^6 = ~56.8 billion combinations)
// ============================================

export const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const CODE_LENGTH = 6;

/**
 * Generate a random short code using crypto API
 * @returns 6-character Base62 encoded string
 */
export function generateShortCode(): string {
  const array = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(array);

  return Array.from(array)
    .map((byte) => CHARSET[byte % CHARSET.length])
    .join('');
}

/**
 * Validate if a string is a valid short code
 * @param code - String to validate
 * @returns true if valid short code format
 */
export function isValidShortCode(code: string | null | undefined): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  if (code.length !== CODE_LENGTH) {
    return false;
  }

  // Check each character is in charset
  for (const char of code) {
    if (!CHARSET.includes(char)) {
      return false;
    }
  }

  return true;
}

/**
 * Generate a unique short code with collision checking
 * @param checkExists - Function to check if code already exists
 * @param maxAttempts - Maximum retry attempts (default: 3)
 * @returns Unique short code
 * @throws Error if unable to generate unique code after max attempts
 */
export async function generateUniqueShortCode(
  checkExists: (code: string) => Promise<boolean>,
  maxAttempts: number = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateShortCode();
    const exists = await checkExists(code);

    if (!exists) {
      return code;
    }
  }

  throw new Error('Unable to generate unique short code after maximum attempts');
}

/**
 * Validate custom alias
 * More permissive than auto-generated codes
 * @param alias - Custom alias to validate
 * @returns true if valid custom alias
 */
export function isValidCustomAlias(alias: string): boolean {
  if (!alias || typeof alias !== 'string') {
    return false;
  }

  // Custom alias: 3-20 characters, alphanumeric and hyphens
  if (alias.length < 3 || alias.length > 20) {
    return false;
  }

  // Allow alphanumeric and hyphens, but not starting/ending with hyphen
  const validPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
  return validPattern.test(alias);
}
