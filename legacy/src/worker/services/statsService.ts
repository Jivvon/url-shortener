// Stats Service - Analytics and Statistics Logic

export interface StatsQueryOptions {
  period: '7d' | '30d' | '90d' | 'all';
}

export interface DailyStats {
  date: string;
  clicks: number;
  unique: number;
}

export interface LinkStats {
  summary: {
    total_clicks: number;
    unique_visitors: number;
    avg_daily_clicks: number;
  };
  daily: DailyStats[];
  countries: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  referers: Record<string, number>;
}

/**
 * Get link statistics for a given period
 */
export async function getLinkStats(
  db: D1Database,
  linkId: string,
  options: StatsQueryOptions
): Promise<LinkStats> {
  const dateFilter = getDateFilter(options.period);

  // Get summary stats
  const summary = await getSummaryStats(db, linkId, dateFilter);

  // Get daily breakdown
  const daily = await getDailyStats(db, linkId, dateFilter);

  // Get aggregated stats in parallel
  const [countries, devices, browsers, referers] = await Promise.all([
    getCountryStats(db, linkId, dateFilter),
    getDeviceStats(db, linkId, dateFilter),
    getBrowserStats(db, linkId, dateFilter),
    getRefererStats(db, linkId, dateFilter),
  ]);

  // Calculate average daily clicks
  const avg_daily_clicks =
    daily.length > 0
      ? Math.round(summary.total_clicks / daily.length)
      : 0;

  return {
    summary: {
      ...summary,
      avg_daily_clicks,
    },
    daily,
    countries,
    devices,
    browsers,
    referers,
  };
}

/**
 * Get date filter SQL clause based on period
 */
function getDateFilter(period: StatsQueryOptions['period']): string {
  switch (period) {
    case '7d':
      return "AND created_at >= datetime('now', '-7 days')";
    case '30d':
      return "AND created_at >= datetime('now', '-30 days')";
    case '90d':
      return "AND created_at >= datetime('now', '-90 days')";
    case 'all':
      return '';
    default:
      return "AND created_at >= datetime('now', '-7 days')";
  }
}

/**
 * Get summary statistics (total clicks, unique visitors)
 */
async function getSummaryStats(
  db: D1Database,
  linkId: string,
  dateFilter: string
): Promise<{ total_clicks: number; unique_visitors: number }> {
  const result = await db
    .prepare(
      `
      SELECT
        COUNT(*) as total_clicks,
        COUNT(DISTINCT ip_hash) as unique_visitors
      FROM clicks
      WHERE link_id = ?
      ${dateFilter}
    `
    )
    .bind(linkId)
    .first<{ total_clicks: number; unique_visitors: number }>();

  return {
    total_clicks: result?.total_clicks ?? 0,
    unique_visitors: result?.unique_visitors ?? 0,
  };
}

/**
 * Get daily click statistics
 */
async function getDailyStats(
  db: D1Database,
  linkId: string,
  dateFilter: string
): Promise<DailyStats[]> {
  const result = await db
    .prepare(
      `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as clicks,
        COUNT(DISTINCT ip_hash) as unique
      FROM clicks
      WHERE link_id = ?
      ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
    )
    .bind(linkId)
    .all<{ date: string; clicks: number; unique: number }>();

  return result.results || [];
}

/**
 * Get country statistics
 */
async function getCountryStats(
  db: D1Database,
  linkId: string,
  dateFilter: string
): Promise<Record<string, number>> {
  const result = await db
    .prepare(
      `
      SELECT
        COALESCE(country, 'unknown') as country,
        COUNT(*) as count
      FROM clicks
      WHERE link_id = ?
      ${dateFilter}
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `
    )
    .bind(linkId)
    .all<{ country: string; count: number }>();

  return aggregateResults(result.results || []);
}

/**
 * Get device statistics
 */
async function getDeviceStats(
  db: D1Database,
  linkId: string,
  dateFilter: string
): Promise<Record<string, number>> {
  const result = await db
    .prepare(
      `
      SELECT
        COALESCE(device, 'unknown') as device,
        COUNT(*) as count
      FROM clicks
      WHERE link_id = ?
      ${dateFilter}
      GROUP BY device
      ORDER BY count DESC
    `
    )
    .bind(linkId)
    .all<{ device: string; count: number }>();

  return aggregateResults(result.results || []);
}

/**
 * Get browser statistics
 */
async function getBrowserStats(
  db: D1Database,
  linkId: string,
  dateFilter: string
): Promise<Record<string, number>> {
  const result = await db
    .prepare(
      `
      SELECT
        COALESCE(browser, 'unknown') as browser,
        COUNT(*) as count
      FROM clicks
      WHERE link_id = ?
      ${dateFilter}
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 10
    `
    )
    .bind(linkId)
    .all<{ browser: string; count: number }>();

  return aggregateResults(result.results || []);
}

/**
 * Get referer statistics
 */
async function getRefererStats(
  db: D1Database,
  linkId: string,
  dateFilter: string
): Promise<Record<string, number>> {
  const result = await db
    .prepare(
      `
      SELECT
        referer,
        COUNT(*) as count
      FROM clicks
      WHERE link_id = ?
      ${dateFilter}
      GROUP BY referer
      ORDER BY count DESC
      LIMIT 10
    `
    )
    .bind(linkId)
    .all<{ referer: string | null; count: number }>();

  // Convert null referers to "direct"
  const stats: Record<string, number> = {};
  for (const row of result.results || []) {
    const key = row.referer ?? 'direct';
    stats[key] = row.count;
  }
  return stats;
}

/**
 * Helper to convert array results to record
 */
function aggregateResults(
  results: { count: number; [key: string]: string | number }[]
): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const row of results) {
    // Get the first string key that's not 'count'
    const key = Object.keys(row).find(
      (k) => k !== 'count' && typeof row[k] === 'string'
    );
    if (key) {
      stats[row[key] as string] = row.count;
    }
  }
  return stats;
}
