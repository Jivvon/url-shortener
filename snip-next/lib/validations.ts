import { z } from 'zod'

/**
 * Create link schema
 */
export const createLinkSchema = z.object({
  url: z.string().url('Invalid URL format'),
  title: z.string().optional(),
  customCode: z
    .string()
    .min(3, 'Custom code must be at least 3 characters')
    .max(20, 'Custom code must be at most 20 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Custom code can only contain letters, numbers, and hyphens')
    .optional(),
  expiresAt: z.string().datetime().optional(),
  clickLimit: z.number().int().positive().optional(),
})

/**
 * Update link schema
 */
export const updateLinkSchema = z.object({
  title: z.string().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
  clickLimit: z.number().int().positive().optional(),
})

/**
 * Link query params schema
 */
export const linkQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'total_clicks', 'title']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
export type LinkQueryParams = z.infer<typeof linkQuerySchema>
