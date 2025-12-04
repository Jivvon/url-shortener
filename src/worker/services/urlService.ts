import {
  createLink,
  getLink,
  getLinkByShortCode,
  getUserLinks,
  updateLink,
  deleteLink,
  checkShortCodeExists,
  incrementUserUrlCount,
  updateUser,
  type GetUserLinksOptions,
  type GetUserLinksResult,
  type CreateLinkData,
  type UpdateLinkData,
} from '../lib/db';
import { cacheUrl, deleteCachedUrl } from '../lib/kv';
import { generateUniqueShortCode, isValidCustomAlias } from '../lib/shortcode';
import { validateUrl, generateTitleFromUrl } from '../lib/urlValidator';
import {
  invalidUrlError,
  codeTakenError,
  planLimitError,
  featureLockedError,
  notFoundError,
  forbiddenError,
} from '../lib/errors';
import {
  canCreateUrl,
  needsMonthlyReset,
  getNextMonthResetDate,
} from './authService';
import type { User, Link, Plan } from '@/types';

// ============================================
// URL Service
// ============================================

export interface CreateUrlInput {
  url: string;
  title?: string;
  customCode?: string;
  expiresAt?: string;
  clickLimit?: number;
}

export interface CreateUrlResult {
  link: Link;
  shortUrl: string;
}

/**
 * Create a new shortened URL
 */
export async function createShortUrl(
  db: D1Database,
  kv: KVNamespace,
  user: User,
  plan: Plan,
  input: CreateUrlInput,
  shortDomain: string
): Promise<CreateUrlResult> {
  // Validate URL
  const validation = validateUrl(input.url);
  if (!validation.valid || !validation.normalizedUrl) {
    throw invalidUrlError(validation.error);
  }

  // Check and reset monthly counter if needed
  if (needsMonthlyReset(user)) {
    await updateUser(db, user.id, {
      url_count_this_month: 0,
      month_reset_at: getNextMonthResetDate(),
    });
    user.url_count_this_month = 0;
  }

  // Check plan limits
  if (!canCreateUrl(user, plan)) {
    throw planLimitError(plan.url_limit, user.url_count_this_month);
  }

  // Handle custom code
  let shortCode: string;
  if (input.customCode) {
    // Check if custom alias feature is available
    if (!plan.features.customAlias) {
      throw featureLockedError('customAlias');
    }

    // Validate custom code format
    if (!isValidCustomAlias(input.customCode)) {
      throw invalidUrlError('Invalid custom code format (3-20 alphanumeric characters or hyphens)');
    }

    // Check if code is taken
    const exists = await checkShortCodeExists(db, input.customCode);
    if (exists) {
      throw codeTakenError(input.customCode);
    }

    shortCode = input.customCode;
  } else {
    // Generate unique short code
    shortCode = await generateUniqueShortCode(
      (code) => checkShortCodeExists(db, code)
    );
  }

  // Handle expiration (Pro+ feature)
  let expiresAt: string | null = null;
  if (input.expiresAt) {
    if (!plan.features.expiration) {
      throw featureLockedError('expiration');
    }
    expiresAt = input.expiresAt;
  }

  // Handle click limit (Pro+ feature)
  let clickLimit: number | null = null;
  if (input.clickLimit) {
    if (!plan.features.expiration) {
      throw featureLockedError('clickLimit');
    }
    clickLimit = input.clickLimit;
  }

  // Generate title if not provided
  const title = input.title || generateTitleFromUrl(validation.normalizedUrl);

  // Create link in database
  const linkData: CreateLinkData = {
    user_id: user.id,
    short_code: shortCode,
    original_url: validation.normalizedUrl,
    title,
    expires_at: expiresAt,
    click_limit: clickLimit,
  };

  const link = await createLink(db, linkData);

  // Cache URL in KV for fast redirects
  const cacheOptions = expiresAt
    ? { expirationTtl: Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000) }
    : undefined;

  await cacheUrl(kv, shortCode, validation.normalizedUrl, {
    ...cacheOptions,
    metadata: { linkId: link.id, userId: user.id },
  });

  // Increment user's URL count
  await incrementUserUrlCount(db, user.id);

  const shortUrl = `https://${shortDomain}/${shortCode}`;

  return { link, shortUrl };
}

/**
 * Get user's links with pagination
 */
export async function getLinks(
  db: D1Database,
  userId: string,
  options: GetUserLinksOptions
): Promise<GetUserLinksResult> {
  return getUserLinks(db, userId, options);
}

/**
 * Get a single link by ID
 */
export async function getLinkById(
  db: D1Database,
  linkId: string,
  userId: string
): Promise<Link> {
  const link = await getLink(db, linkId);

  if (!link) {
    throw notFoundError('Link');
  }

  // Check ownership
  if (link.user_id !== userId) {
    throw forbiddenError('You do not own this link');
  }

  return link;
}

/**
 * Update a link
 */
export async function updateLinkById(
  db: D1Database,
  kv: KVNamespace,
  linkId: string,
  userId: string,
  updates: UpdateLinkData
): Promise<Link> {
  const link = await getLinkById(db, linkId, userId);

  const updatedLink = await updateLink(db, linkId, updates);

  if (!updatedLink) {
    throw notFoundError('Link');
  }

  // If link is deactivated, remove from cache
  if (updates.is_active === false) {
    await deleteCachedUrl(kv, link.short_code);
  }

  return updatedLink;
}

/**
 * Delete a link
 */
export async function deleteLinkById(
  db: D1Database,
  kv: KVNamespace,
  linkId: string,
  userId: string
): Promise<void> {
  const link = await getLinkById(db, linkId, userId);

  const deleted = await deleteLink(db, linkId);

  if (!deleted) {
    throw notFoundError('Link');
  }

  // Remove from cache
  await deleteCachedUrl(kv, link.short_code);
}

/**
 * Get link for redirect (public, no auth needed)
 */
export async function getLinkForRedirect(
  db: D1Database,
  shortCode: string
): Promise<Link | null> {
  const link = await getLinkByShortCode(db, shortCode);

  if (!link) {
    return null;
  }

  // Check if link is active
  if (!link.is_active) {
    return null;
  }

  // Check expiration
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return null;
  }

  // Check click limit
  if (link.click_limit && link.total_clicks >= link.click_limit) {
    return null;
  }

  return link;
}
