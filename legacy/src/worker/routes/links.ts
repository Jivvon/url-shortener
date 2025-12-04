import { Hono } from 'hono';
import { authMiddleware, getCurrentUser } from '../middleware/auth';
import { getPlan } from '../lib/db';
import {
  createShortUrl,
  getLinks,
  getLinkById,
  updateLinkById,
  deleteLinkById,
} from '../services/urlService';
import { validationError, serverError } from '../lib/errors';

const links = new Hono<{ Bindings: Env }>();

// All routes require authentication
links.use('/*', authMiddleware);

// ============================================
// POST /api/links - Create new short URL
// ============================================

links.post('/', async (c) => {
  const user = getCurrentUser(c);
  const body = await c.req.json<{
    url: string;
    title?: string;
    custom_code?: string;
    expires_at?: string;
    click_limit?: number;
  }>();

  if (!body.url) {
    throw validationError('url', 'URL is required');
  }

  const plan = await getPlan(c.env.DB, user.plan_id);
  if (!plan) {
    throw serverError('User plan not found');
  }

  const result = await createShortUrl(
    c.env.DB,
    c.env.URL_CACHE,
    user,
    plan,
    {
      url: body.url,
      title: body.title,
      customCode: body.custom_code,
      expiresAt: body.expires_at,
      clickLimit: body.click_limit,
    },
    c.env.SHORT_DOMAIN
  );

  return c.json(
    {
      link: {
        id: result.link.id,
        short_code: result.link.short_code,
        short_url: result.shortUrl,
        original_url: result.link.original_url,
        title: result.link.title,
        is_active: result.link.is_active,
        expires_at: result.link.expires_at,
        click_limit: result.link.click_limit,
        total_clicks: result.link.total_clicks,
        created_at: result.link.created_at,
      },
    },
    201
  );
});

// ============================================
// GET /api/links - List user's links
// ============================================

links.get('/', async (c) => {
  const user = getCurrentUser(c);

  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
  const sort = c.req.query('sort') || 'created_at';
  const order = (c.req.query('order') || 'desc') as 'asc' | 'desc';
  const search = c.req.query('search');

  const result = await getLinks(c.env.DB, user.id, {
    page,
    limit,
    sort,
    order,
    search,
  });

  const shortDomain = c.env.SHORT_DOMAIN;

  return c.json({
    links: result.links.map((link) => ({
      id: link.id,
      short_code: link.short_code,
      short_url: `https://${shortDomain}/${link.short_code}`,
      original_url: link.original_url,
      title: link.title,
      is_active: link.is_active,
      expires_at: link.expires_at,
      click_limit: link.click_limit,
      total_clicks: link.total_clicks,
      created_at: link.created_at,
      updated_at: link.updated_at,
    })),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      total_pages: result.totalPages,
    },
  });
});

// ============================================
// GET /api/links/:id - Get single link
// ============================================

links.get('/:id', async (c) => {
  const user = getCurrentUser(c);
  const linkId = c.req.param('id');

  const link = await getLinkById(c.env.DB, linkId, user.id);
  const shortDomain = c.env.SHORT_DOMAIN;

  return c.json({
    link: {
      id: link.id,
      short_code: link.short_code,
      short_url: `https://${shortDomain}/${link.short_code}`,
      original_url: link.original_url,
      title: link.title,
      is_active: link.is_active,
      expires_at: link.expires_at,
      click_limit: link.click_limit,
      total_clicks: link.total_clicks,
      created_at: link.created_at,
      updated_at: link.updated_at,
    },
  });
});

// ============================================
// PATCH /api/links/:id - Update link
// ============================================

links.patch('/:id', async (c) => {
  const user = getCurrentUser(c);
  const linkId = c.req.param('id');
  const body = await c.req.json<{
    title?: string;
    is_active?: boolean;
    expires_at?: string;
    click_limit?: number;
  }>();

  const link = await updateLinkById(c.env.DB, c.env.URL_CACHE, linkId, user.id, {
    title: body.title,
    is_active: body.is_active,
    expires_at: body.expires_at,
    click_limit: body.click_limit,
  });

  const shortDomain = c.env.SHORT_DOMAIN;

  return c.json({
    link: {
      id: link.id,
      short_code: link.short_code,
      short_url: `https://${shortDomain}/${link.short_code}`,
      original_url: link.original_url,
      title: link.title,
      is_active: link.is_active,
      expires_at: link.expires_at,
      click_limit: link.click_limit,
      total_clicks: link.total_clicks,
      created_at: link.created_at,
      updated_at: link.updated_at,
    },
  });
});

// ============================================
// DELETE /api/links/:id - Delete link
// ============================================

links.delete('/:id', async (c) => {
  const user = getCurrentUser(c);
  const linkId = c.req.param('id');

  await deleteLinkById(c.env.DB, c.env.URL_CACHE, linkId, user.id);

  return c.json({ success: true });
});

export default links;
