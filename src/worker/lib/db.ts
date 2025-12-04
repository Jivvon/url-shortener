import { nanoid } from 'nanoid';
import type { User, Link, Plan, PlanFeatures } from '@/types';

// ============================================
// User Operations
// ============================================

export async function getUser(db: D1Database, id: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<User>();
  return result;
}

export async function getUserByGoogleId(db: D1Database, googleId: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE google_id = ?')
    .bind(googleId)
    .first<User>();
  return result;
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first<User>();
  return result;
}

export interface CreateUserData {
  google_id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
}

export async function createUser(db: D1Database, data: CreateUserData): Promise<User> {
  const id = nanoid();

  await db
    .prepare(`
      INSERT INTO users (id, google_id, email, name, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(id, data.google_id, data.email, data.name, data.avatar_url || null)
    .run();

  const user = await getUser(db, id);
  if (!user) throw new Error('Failed to create user');
  return user;
}

export interface UpdateUserData {
  name?: string;
  avatar_url?: string | null;
  plan_id?: Plan['id'];
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  url_count_this_month?: number;
  month_reset_at?: string;
}

export async function updateUser(
  db: D1Database,
  id: string,
  data: UpdateUserData
): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.avatar_url !== undefined) {
    fields.push('avatar_url = ?');
    values.push(data.avatar_url);
  }
  if (data.plan_id !== undefined) {
    fields.push('plan_id = ?');
    values.push(data.plan_id);
  }
  if (data.stripe_customer_id !== undefined) {
    fields.push('stripe_customer_id = ?');
    values.push(data.stripe_customer_id);
  }
  if (data.stripe_subscription_id !== undefined) {
    fields.push('stripe_subscription_id = ?');
    values.push(data.stripe_subscription_id);
  }
  if (data.url_count_this_month !== undefined) {
    fields.push('url_count_this_month = ?');
    values.push(data.url_count_this_month);
  }
  if (data.month_reset_at !== undefined) {
    fields.push('month_reset_at = ?');
    values.push(data.month_reset_at);
  }

  if (fields.length === 0) return getUser(db, id);

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await db
    .prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return getUser(db, id);
}

export async function incrementUserUrlCount(db: D1Database, userId: string): Promise<void> {
  await db
    .prepare(`
      UPDATE users
      SET url_count_this_month = url_count_this_month + 1,
          updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(userId)
    .run();
}

// ============================================
// Link Operations
// ============================================

export async function getLink(db: D1Database, id: string): Promise<Link | null> {
  const result = await db
    .prepare('SELECT * FROM links WHERE id = ?')
    .bind(id)
    .first<LinkRow>();
  return result ? transformLink(result) : null;
}

export async function getLinkByShortCode(db: D1Database, shortCode: string): Promise<Link | null> {
  const result = await db
    .prepare('SELECT * FROM links WHERE short_code = ?')
    .bind(shortCode)
    .first<LinkRow>();
  return result ? transformLink(result) : null;
}

interface LinkRow {
  id: string;
  user_id: string;
  short_code: string;
  original_url: string;
  title: string | null;
  is_active: number;
  expires_at: string | null;
  click_limit: number | null;
  total_clicks: number;
  created_at: string;
  updated_at: string;
}

function transformLink(row: LinkRow): Link {
  return {
    ...row,
    is_active: row.is_active === 1,
  };
}

export interface GetUserLinksOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface GetUserLinksResult {
  links: Link[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getUserLinks(
  db: D1Database,
  userId: string,
  options: GetUserLinksOptions = {}
): Promise<GetUserLinksResult> {
  const {
    page = 1,
    limit = 20,
    sort = 'created_at',
    order = 'desc',
    search,
  } = options;

  const offset = (page - 1) * limit;
  const allowedSorts = ['created_at', 'total_clicks', 'title'];
  const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  let whereClause = 'WHERE user_id = ?';
  const bindings: unknown[] = [userId];

  if (search) {
    whereClause += ' AND (original_url LIKE ? OR title LIKE ?)';
    bindings.push(`%${search}%`, `%${search}%`);
  }

  // Get total count
  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM links ${whereClause}`)
    .bind(...bindings)
    .first<{ count: number }>();
  const total = countResult?.count || 0;

  // Get paginated results
  const results = await db
    .prepare(
      `SELECT * FROM links ${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`
    )
    .bind(...bindings, limit, offset)
    .all<LinkRow>();

  const links = (results.results || []).map(transformLink);

  return {
    links,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export interface CreateLinkData {
  user_id: string;
  short_code: string;
  original_url: string;
  title?: string | null;
  expires_at?: string | null;
  click_limit?: number | null;
}

export async function createLink(db: D1Database, data: CreateLinkData): Promise<Link> {
  const id = nanoid();

  await db
    .prepare(`
      INSERT INTO links (id, user_id, short_code, original_url, title, expires_at, click_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      data.user_id,
      data.short_code,
      data.original_url,
      data.title || null,
      data.expires_at || null,
      data.click_limit || null
    )
    .run();

  const link = await getLink(db, id);
  if (!link) throw new Error('Failed to create link');
  return link;
}

export interface UpdateLinkData {
  title?: string | null;
  is_active?: boolean;
  expires_at?: string | null;
  click_limit?: number | null;
}

export async function updateLink(
  db: D1Database,
  id: string,
  data: UpdateLinkData
): Promise<Link | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }
  if (data.expires_at !== undefined) {
    fields.push('expires_at = ?');
    values.push(data.expires_at);
  }
  if (data.click_limit !== undefined) {
    fields.push('click_limit = ?');
    values.push(data.click_limit);
  }

  if (fields.length === 0) return getLink(db, id);

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await db
    .prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return getLink(db, id);
}

export async function deleteLink(db: D1Database, id: string): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM links WHERE id = ?')
    .bind(id)
    .run();
  return (result.meta?.changes || 0) > 0;
}

export async function incrementLinkClicks(db: D1Database, linkId: string): Promise<void> {
  await db
    .prepare(`
      UPDATE links
      SET total_clicks = total_clicks + 1,
          updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(linkId)
    .run();
}

export async function checkShortCodeExists(db: D1Database, shortCode: string): Promise<boolean> {
  const result = await db
    .prepare('SELECT 1 FROM links WHERE short_code = ?')
    .bind(shortCode)
    .first();
  return result !== null;
}

// ============================================
// Plan Operations
// ============================================

interface PlanRow {
  id: string;
  name: string;
  price_cents: number;
  url_limit: number;
  stats_retention_days: number;
  features: string;
  created_at: string;
}

export async function getPlan(db: D1Database, id: string): Promise<Plan | null> {
  const result = await db
    .prepare('SELECT * FROM plans WHERE id = ?')
    .bind(id)
    .first<PlanRow>();

  if (!result) return null;

  return {
    ...result,
    id: result.id as Plan['id'],
    features: JSON.parse(result.features) as PlanFeatures,
  };
}

export async function getAllPlans(db: D1Database): Promise<Plan[]> {
  const results = await db
    .prepare('SELECT * FROM plans ORDER BY price_cents ASC')
    .all<PlanRow>();

  return (results.results || []).map((row) => ({
    ...row,
    id: row.id as Plan['id'],
    features: JSON.parse(row.features) as PlanFeatures,
  }));
}

// ============================================
// Click Operations (for redirect worker)
// ============================================

export interface CreateClickData {
  link_id: string;
  country?: string | null;
  device?: 'desktop' | 'mobile' | 'tablet' | null;
  browser?: string | null;
  os?: string | null;
  referer?: string | null;
  ip_hash?: string | null;
}

export async function createClick(db: D1Database, data: CreateClickData): Promise<void> {
  await db
    .prepare(`
      INSERT INTO clicks (link_id, country, device, browser, os, referer, ip_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.link_id,
      data.country || null,
      data.device || null,
      data.browser || null,
      data.os || null,
      data.referer || null,
      data.ip_hash || null
    )
    .run();
}
