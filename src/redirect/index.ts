import { Hono } from 'hono';

// Environment bindings for redirect worker
interface RedirectEnv {
  URL_CACHE: KVNamespace;
  DB: D1Database;
  APP_DOMAIN: string;
}

interface UrlMetadata {
  linkId: string;
  userId: string;
}

const app = new Hono<{ Bindings: RedirectEnv }>();

// ============================================
// Redirect Handler
// ============================================

app.get('/:shortCode', async (c) => {
  const shortCode = c.req.param('shortCode');

  // Skip favicon and other common paths
  if (shortCode === 'favicon.ico' || shortCode === 'robots.txt') {
    return c.notFound();
  }

  // 1. Lookup URL in KV cache
  const { value: originalUrl, metadata } = await c.env.URL_CACHE.getWithMetadata<UrlMetadata>(shortCode);

  if (!originalUrl) {
    // URL not found - redirect to main app
    const appDomain = c.env.APP_DOMAIN || 'snip.lento.dev';
    return c.redirect(`https://${appDomain}?error=not_found`, 302);
  }

  // 2. Log click asynchronously (don't block redirect)
  if (metadata?.linkId) {
    const clickData = {
      linkId: metadata.linkId,
      country: (c.req.raw.cf as { country?: string })?.country || null,
      userAgent: c.req.header('user-agent') || null,
      referer: c.req.header('referer') || null,
      ip: c.req.header('cf-connecting-ip') || null,
    };

    // Use waitUntil for async click logging
    c.executionCtx.waitUntil(logClick(c.env.DB, clickData));

    // Also increment total clicks in links table
    c.executionCtx.waitUntil(incrementClicks(c.env.DB, metadata.linkId));
  }

  // 3. Redirect to original URL
  return c.redirect(originalUrl, 302);
});

// Root path redirects to main app
app.get('/', (c) => {
  const appDomain = c.env.APP_DOMAIN || 'snip.lento.dev';
  return c.redirect(`https://${appDomain}`, 302);
});

// ============================================
// Click Logging Functions
// ============================================

interface ClickData {
  linkId: string;
  country: string | null;
  userAgent: string | null;
  referer: string | null;
  ip: string | null;
}

async function logClick(db: D1Database, data: ClickData): Promise<void> {
  try {
    const { device, browser, os } = parseUserAgent(data.userAgent);
    const ipHash = data.ip ? await hashIP(data.ip) : null;

    await db
      .prepare(`
        INSERT INTO clicks (link_id, country, device, browser, os, referer, ip_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        data.linkId,
        data.country,
        device,
        browser,
        os,
        data.referer ? extractRefererDomain(data.referer) : null,
        ipHash
      )
      .run();
  } catch (error) {
    console.error('Failed to log click:', error);
  }
}

async function incrementClicks(db: D1Database, linkId: string): Promise<void> {
  try {
    await db
      .prepare(`
        UPDATE links
        SET total_clicks = total_clicks + 1,
            updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(linkId)
      .run();
  } catch (error) {
    console.error('Failed to increment clicks:', error);
  }
}

// ============================================
// User Agent Parsing
// ============================================

interface ParsedUserAgent {
  device: 'desktop' | 'mobile' | 'tablet' | null;
  browser: string | null;
  os: string | null;
}

function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) {
    return { device: null, browser: null, os: null };
  }

  const ua = userAgent.toLowerCase();

  // Detect device
  let device: 'desktop' | 'mobile' | 'tablet' | null = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    device = 'mobile';
  }

  // Detect browser
  let browser: string | null = null;
  if (ua.includes('edg/')) browser = 'edge';
  else if (ua.includes('chrome')) browser = 'chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('opera') || ua.includes('opr/')) browser = 'opera';
  else if (ua.includes('msie') || ua.includes('trident')) browser = 'ie';

  // Detect OS (check iOS before macOS since iOS UA contains "Mac OS")
  let os: string | null = null;
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) os = 'ios';
  else if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac os') || ua.includes('macos')) os = 'macos';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('linux')) os = 'linux';

  return { device, browser, os };
}

// ============================================
// Helper Functions
// ============================================

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16); // Use first 16 chars of hash
}

function extractRefererDomain(referer: string): string | null {
  try {
    const url = new URL(referer);
    return url.hostname;
  } catch {
    return null;
  }
}

export default app;
