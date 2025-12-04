import { Hono } from 'hono';
import { getLinkStats } from '../services/statsService';
import type { StatsQueryOptions } from '../services/statsService';
import { getLink } from '../lib/db';
import { unauthorizedError, notFoundError, forbiddenError } from '../lib/errors';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  SHORT_DOMAIN: string;
}

interface Variables {
  userId: string;
  user: { id: string };
}

const stats = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /:id/stats - Get link statistics
 */
stats.get('/:id/stats', async (c) => {
  const userId = c.get('userId');

  if (!userId) {
    throw unauthorizedError('Authentication required');
  }

  const linkId = c.req.param('id');
  const period = (c.req.query('period') || '7d') as StatsQueryOptions['period'];

  // Validate period
  const validPeriods = ['7d', '30d', '90d', 'all'];
  const normalizedPeriod = validPeriods.includes(period) ? period : '7d';

  // Get the link and verify ownership
  const link = await getLink(c.env.DB, linkId);

  if (!link) {
    throw notFoundError('Link not found');
  }

  if (link.user_id !== userId) {
    throw forbiddenError('You do not have access to this link');
  }

  // Get statistics
  const statsData = await getLinkStats(c.env.DB, linkId, {
    period: normalizedPeriod as StatsQueryOptions['period'],
  });

  return c.json(statsData);
});

export default stats;
