import { describe, it, expect } from 'vitest';
import { generateShortCode, isValidShortCode, CHARSET, CODE_LENGTH } from '@worker/lib/shortcode';

describe('Short Code Generator', () => {
  describe('generateShortCode', () => {
    it('should generate a code of correct length', () => {
      const code = generateShortCode();
      expect(code.length).toBe(CODE_LENGTH);
    });

    it('should only contain valid Base62 characters', () => {
      const code = generateShortCode();
      for (const char of code) {
        expect(CHARSET.includes(char)).toBe(true);
      }
    });

    it('should generate unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        codes.add(generateShortCode());
      }
      // All 1000 codes should be unique
      expect(codes.size).toBe(1000);
    });

    it('should generate random codes (not sequential)', () => {
      const code1 = generateShortCode();
      const code2 = generateShortCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe('isValidShortCode', () => {
    it('should accept valid short codes', () => {
      expect(isValidShortCode('abc123')).toBe(true);
      expect(isValidShortCode('ABC123')).toBe(true);
      expect(isValidShortCode('aBc123')).toBe(true);
      expect(isValidShortCode('000000')).toBe(true);
      expect(isValidShortCode('ZZZZZZ')).toBe(true);
    });

    it('should reject codes with invalid characters', () => {
      expect(isValidShortCode('abc-12')).toBe(false);
      expect(isValidShortCode('abc_12')).toBe(false);
      expect(isValidShortCode('abc 12')).toBe(false);
      expect(isValidShortCode('abc!12')).toBe(false);
    });

    it('should reject codes with wrong length', () => {
      expect(isValidShortCode('abc')).toBe(false);
      expect(isValidShortCode('abcdefg')).toBe(false);
      expect(isValidShortCode('')).toBe(false);
    });

    it('should reject empty or null values', () => {
      expect(isValidShortCode('')).toBe(false);
      // @ts-expect-error testing invalid input
      expect(isValidShortCode(null)).toBe(false);
      // @ts-expect-error testing invalid input
      expect(isValidShortCode(undefined)).toBe(false);
    });
  });

  describe('CHARSET and CODE_LENGTH constants', () => {
    it('should have correct charset length (Base62)', () => {
      expect(CHARSET.length).toBe(62);
    });

    it('should have default code length of 6', () => {
      expect(CODE_LENGTH).toBe(6);
    });

    it('should have charset containing 0-9, A-Z, a-z', () => {
      expect(CHARSET).toContain('0');
      expect(CHARSET).toContain('9');
      expect(CHARSET).toContain('A');
      expect(CHARSET).toContain('Z');
      expect(CHARSET).toContain('a');
      expect(CHARSET).toContain('z');
    });
  });
});
