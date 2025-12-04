import { generateShortCode, isValidCustomAlias, isReservedCode } from './shortcode'

// Mock nanoid
let counter = 0
jest.mock('nanoid', () => ({
  customAlphabet: () => () => {
    counter++
    // Pad to ensure 6 characters
    return `cd${counter.toString().padStart(4, '0')}`
  },
}))

describe('Shortcode Utilities', () => {
  describe('generateShortCode', () => {
    it('should generate a string of length 6', () => {
      const code = generateShortCode()
      expect(code).toHaveLength(6)
    })

    it('should generate alphanumeric characters', () => {
      const code = generateShortCode()
      expect(code).toMatch(/^[a-zA-Z0-9]+$/)
    })

    it('should generate unique codes', () => {
      const code1 = generateShortCode()
      const code2 = generateShortCode()
      expect(code1).not.toBe(code2)
    })
  })

  describe('isValidCustomAlias', () => {
    it('should return true for valid aliases', () => {
      expect(isValidCustomAlias('my-link')).toBe(true)
      expect(isValidCustomAlias('summer2024')).toBe(true)
      expect(isValidCustomAlias('abc')).toBe(true)
    })

    it('should return false for aliases too short', () => {
      expect(isValidCustomAlias('ab')).toBe(false)
    })

    it('should return false for aliases too long', () => {
      expect(isValidCustomAlias('a'.repeat(21))).toBe(false)
    })

    it('should return false for invalid characters', () => {
      expect(isValidCustomAlias('my link')).toBe(false)
      expect(isValidCustomAlias('link!')).toBe(false)
      expect(isValidCustomAlias('link@')).toBe(false)
    })

    it('should return false if starting or ending with hyphen', () => {
      expect(isValidCustomAlias('-link')).toBe(false)
      expect(isValidCustomAlias('link-')).toBe(false)
    })
  })

  describe('isReservedCode', () => {
    it('should return true for reserved codes', () => {
      expect(isReservedCode('api')).toBe(true)
      expect(isReservedCode('dashboard')).toBe(true)
      expect(isReservedCode('login')).toBe(true)
    })

    it('should be case insensitive', () => {
      expect(isReservedCode('API')).toBe(true)
      expect(isReservedCode('Dashboard')).toBe(true)
    })

    it('should return false for non-reserved codes', () => {
      expect(isReservedCode('mylink')).toBe(false)
      expect(isReservedCode('random')).toBe(false)
    })
  })
})
