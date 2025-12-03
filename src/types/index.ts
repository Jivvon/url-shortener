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
