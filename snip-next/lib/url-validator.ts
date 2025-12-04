import { z } from 'zod'

/**
 * URL validation schema
 */
export const urlSchema = z.string().url('Invalid URL format').min(1, 'URL is required')

/**
 * Validate and normalize URL
 */
export function validateUrl(url: string): {
  valid: boolean
  normalizedUrl?: string
  error?: string
} {
  try {
    // Validate with Zod
    urlSchema.parse(url)

    // Normalize URL
    const urlObj = new URL(url)
    const normalizedUrl = urlObj.toString()

    return { valid: true, normalizedUrl }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors?.[0]?.message || 'Invalid URL format'
      return { valid: false, error: message }
    }
    return { valid: false, error: 'Invalid URL' }
  }
}

/**
 * Generate title from URL
 */
export function generateTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Use hostname as title (remove www. if present)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return 'Untitled'
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return null
  }
}
