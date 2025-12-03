# Database Schema
## Snip - URL Shortener Service

### Overview
Cloudflare D1 (SQLite) 기반 스키마

---

### ERD

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │     plans       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ google_id       │       │ name            │
│ email           │       │ price_cents     │
│ name            │       │ url_limit       │
│ avatar_url      │       │ stats_days      │
│ plan_id (FK)────┼──────▶│ features        │
│ stripe_customer │       │ created_at      │
│ created_at      │       └─────────────────┘
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     links       │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ short_code (UQ) │
│ original_url    │
│ title           │
│ is_active       │
│ expires_at      │
│ click_limit     │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     clicks      │
├─────────────────┤
│ id (PK)         │
│ link_id (FK)    │
│ clicked_at      │
│ country         │
│ device          │
│ browser         │
│ os              │
│ referer         │
│ ip_hash         │
└─────────────────┘
```

---

### Migration Files

#### 0001_initial.sql
```sql
-- Plans 테이블
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  url_limit INTEGER NOT NULL DEFAULT 50,
  stats_retention_days INTEGER NOT NULL DEFAULT 7,
  features TEXT NOT NULL DEFAULT '{}', -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 기본 플랜 데이터
INSERT INTO plans (id, name, price_cents, url_limit, stats_retention_days, features) VALUES
  ('free', 'Free', 0, 50, 7, '{"customAlias":false,"expiration":false,"bulk":false,"qrCustom":false}'),
  ('pro', 'Pro', 500, 1000, 90, '{"customAlias":true,"expiration":true,"bulk":100,"qrCustom":"color"}'),
  ('business', 'Business', 1500, -1, -1, '{"customAlias":true,"expiration":true,"bulk":500,"qrCustom":"logo","api":true}');

-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- nanoid
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free' REFERENCES plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  url_count_this_month INTEGER NOT NULL DEFAULT 0,
  month_reset_at TEXT NOT NULL DEFAULT (datetime('now', 'start of month', '+1 month')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);

-- Links 테이블
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY, -- nanoid
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  short_code TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  title TEXT,
  is_active INTEGER NOT NULL DEFAULT 1, -- boolean
  expires_at TEXT, -- nullable, datetime
  click_limit INTEGER, -- nullable
  total_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_short_code ON links(short_code);
CREATE INDEX idx_links_created_at ON links(created_at);
```

#### 0002_clicks.sql
```sql
-- Clicks 테이블 (통계용)
CREATE TABLE IF NOT EXISTS clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TEXT NOT NULL DEFAULT (datetime('now')),
  country TEXT, -- ISO 3166-1 alpha-2
  device TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT, -- 'chrome', 'firefox', 'safari', etc.
  os TEXT, -- 'windows', 'macos', 'ios', 'android', 'linux'
  referer TEXT,
  ip_hash TEXT -- 개인정보 보호를 위해 해시 저장
);

CREATE INDEX idx_clicks_link_id ON clicks(link_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX idx_clicks_link_date ON clicks(link_id, clicked_at);

-- 일별 통계 집계 테이블 (성능 최적화)
CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- 'YYYY-MM-DD'
  click_count INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  countries TEXT NOT NULL DEFAULT '{}', -- JSON: {"US": 10, "KR": 5}
  devices TEXT NOT NULL DEFAULT '{}', -- JSON: {"desktop": 8, "mobile": 7}
  browsers TEXT NOT NULL DEFAULT '{}', -- JSON
  referers TEXT NOT NULL DEFAULT '{}', -- JSON
  UNIQUE(link_id, date)
);

CREATE INDEX idx_daily_stats_link_date ON daily_stats(link_id, date);
```

---

### TypeScript Types

```typescript
// src/types/db.ts

export interface Plan {
  id: 'free' | 'pro' | 'business';
  name: string;
  price_cents: number;
  url_limit: number; // -1 = unlimited
  stats_retention_days: number; // -1 = unlimited
  features: PlanFeatures;
  created_at: string;
}

export interface PlanFeatures {
  customAlias: boolean;
  expiration: boolean;
  bulk: number | false; // false or max count
  qrCustom: false | 'color' | 'logo';
  api?: boolean;
}

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  plan_id: Plan['id'];
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  url_count_this_month: number;
  month_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: string;
  user_id: string;
  short_code: string;
  original_url: string;
  title: string | null;
  is_active: boolean;
  expires_at: string | null;
  click_limit: number | null;
  total_clicks: number;
  created_at: string;
  updated_at: string;
}

export interface Click {
  id: number;
  link_id: string;
  clicked_at: string;
  country: string | null;
  device: 'desktop' | 'mobile' | 'tablet' | null;
  browser: string | null;
  os: string | null;
  referer: string | null;
  ip_hash: string | null;
}

export interface DailyStats {
  id: number;
  link_id: string;
  date: string;
  click_count: number;
  unique_visitors: number;
  countries: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  referers: Record<string, number>;
}
```

---

### Common Queries

#### 사용자 링크 목록 (페이지네이션)
```sql
SELECT * FROM links 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT ? OFFSET ?;
```

#### 월간 URL 생성 수 확인
```sql
SELECT url_count_this_month, month_reset_at 
FROM users 
WHERE id = ?;
```

#### 일별 클릭 통계 (최근 N일)
```sql
SELECT date, click_count, unique_visitors
FROM daily_stats
WHERE link_id = ?
  AND date >= date('now', ? || ' days')
ORDER BY date ASC;
```

#### 통계 집계 (배치용)
```sql
INSERT INTO daily_stats (link_id, date, click_count, unique_visitors, countries, devices, browsers, referers)
SELECT 
  link_id,
  date(clicked_at) as date,
  COUNT(*) as click_count,
  COUNT(DISTINCT ip_hash) as unique_visitors,
  json_group_object(country, cnt) as countries,
  -- ... 생략
FROM clicks
WHERE clicked_at >= datetime('now', '-1 day')
GROUP BY link_id, date(clicked_at)
ON CONFLICT(link_id, date) DO UPDATE SET
  click_count = excluded.click_count,
  unique_visitors = excluded.unique_visitors;
```

---

### KV 데이터 구조

```typescript
// URL 매핑 (리다이렉트용)
// Key: short_code
// Value: original_url
// TTL: 없음 (영구) 또는 만료 설정 시 해당 시간

await env.URL_CACHE.put('abc123', 'https://example.com/very-long-url', {
  expirationTtl: 86400 * 30, // 30일 (optional)
  metadata: {
    linkId: 'link_xxx',
    userId: 'user_xxx',
  }
});

// 조회
const url = await env.URL_CACHE.get('abc123');
const { value, metadata } = await env.URL_CACHE.getWithMetadata('abc123');
```
