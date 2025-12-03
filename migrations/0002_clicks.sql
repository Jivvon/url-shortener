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

CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_clicks_link_date ON clicks(link_id, clicked_at);

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

CREATE INDEX IF NOT EXISTS idx_daily_stats_link_date ON daily_stats(link_id, date);
