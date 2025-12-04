import { validateUrl, generateTitleFromUrl, extractDomain } from './url-validator'

describe('URL Validator Utilities', () => {
  describe('validateUrl', () => {
    it('should return valid for correct URLs', () => {
      const result = validateUrl('https://example.com')
      expect(result.valid).toBe(true)
      expect(result.normalizedUrl).toBe('https://example.com/')
    })

    it('should return valid for URLs with query params', () => {
      const result = validateUrl('https://example.com?q=hello')
      expect(result.valid).toBe(true)
      expect(result.normalizedUrl).toBe('https://example.com/?q=hello')
    })

    it('should return invalid for malformed URLs', () => {
      const result = validateUrl('not-a-url')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return invalid for empty string', () => {
      const result = validateUrl('')
      expect(result.valid).toBe(false)
    })
  })

  describe('generateTitleFromUrl', () => {
    it('should extract hostname as title', () => {
      expect(generateTitleFromUrl('https://example.com/page')).toBe('example.com')
    })

    it('should remove www prefix', () => {
      expect(generateTitleFromUrl('https://www.google.com')).toBe('google.com')
    })

    it('should return Untitled for invalid URLs', () => {
      expect(generateTitleFromUrl('invalid')).toBe('Untitled')
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(extractDomain('https://sub.example.com/path')).toBe('sub.example.com')
    })

    it('should return null for invalid URLs', () => {
      expect(extractDomain('invalid')).toBeNull()
    })
  })
})
