// ============================================
// KV Helper Functions for URL Caching
// ============================================

export interface UrlCacheMetadata {
  linkId: string;
  userId: string;
}

export interface CacheOptions {
  expirationTtl?: number;
  metadata?: UrlCacheMetadata;
}

/**
 * Cache a URL mapping in KV
 * @param kv - KV namespace
 * @param shortCode - Short code (key)
 * @param originalUrl - Original URL (value)
 * @param options - Optional expiration and metadata
 */
export async function cacheUrl(
  kv: KVNamespace,
  shortCode: string,
  originalUrl: string,
  options?: CacheOptions
): Promise<void> {
  const kvOptions: KVNamespacePutOptions | undefined = options
    ? {
        expirationTtl: options.expirationTtl,
        metadata: options.metadata,
      }
    : undefined;

  await kv.put(shortCode, originalUrl, kvOptions);
}

/**
 * Get cached URL by short code
 * @param kv - KV namespace
 * @param shortCode - Short code to look up
 * @returns Original URL or null if not found
 */
export async function getCachedUrl(
  kv: KVNamespace,
  shortCode: string
): Promise<string | null> {
  return await kv.get(shortCode);
}

/**
 * Get cached URL with metadata
 * @param kv - KV namespace
 * @param shortCode - Short code to look up
 * @returns Object containing value and metadata
 */
export async function getCachedUrlWithMetadata(
  kv: KVNamespace,
  shortCode: string
): Promise<{ value: string | null; metadata: UrlCacheMetadata | null }> {
  const result = await kv.getWithMetadata<UrlCacheMetadata>(shortCode);
  return {
    value: result.value,
    metadata: result.metadata,
  };
}

/**
 * Delete cached URL
 * @param kv - KV namespace
 * @param shortCode - Short code to delete
 */
export async function deleteCachedUrl(
  kv: KVNamespace,
  shortCode: string
): Promise<void> {
  await kv.delete(shortCode);
}

/**
 * Update cached URL (same as cacheUrl but semantically different)
 * Useful when updating expiration or metadata
 */
export async function updateCachedUrl(
  kv: KVNamespace,
  shortCode: string,
  originalUrl: string,
  options?: CacheOptions
): Promise<void> {
  await cacheUrl(kv, shortCode, originalUrl, options);
}

/**
 * Check if a short code exists in cache
 * @param kv - KV namespace
 * @param shortCode - Short code to check
 * @returns true if exists, false otherwise
 */
export async function isCached(
  kv: KVNamespace,
  shortCode: string
): Promise<boolean> {
  const result = await kv.get(shortCode);
  return result !== null;
}
