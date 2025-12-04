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

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

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

CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);
