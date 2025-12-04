# 새로운 기술 스택 명세

## 🏗️ 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                 │
│                     App Router + RSC + shadcn/ui            │
├─────────────────────────────────────────────────────────────┤
│                     API Routes (Next.js)                     │
│              /api/auth, /api/links, /api/stats              │
├─────────────────────────────────────────────────────────────┤
│                  External Services Layer                     │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Supabase   │    Polar     │   Resend     │    Posthog     │
│  (Auth+DB)   │  (Payment)   │   (Email)    │  (Analytics)   │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

---

## 🛠️ 기술 스택 상세

### 1. Frontend Framework: **Next.js 15**

**선택 이유:**
- App Router를 활용한 현대적인 개발
- React Server Components (RSC)로 성능 최적화
- Built-in 이미지 최적화
- SEO 최적화를 위한 SSR/SSG
- API Routes로 백엔드 통합

**주요 기능:**
- `app/` 디렉토리 구조
- Server Actions
- Streaming & Suspense
- Metadata API for SEO

**설정:**
```json
{
  "framework": "Next.js 15",
  "typescript": true,
  "eslint": true,
  "tailwindcss": true,
  "src": false,
  "app": true,
  "importAlias": "@/*"
}
```

---

### 2. UI Library: **shadcn/ui**

**선택 이유:**
- 복사-붙여넣기 기반 컴포넌트 (의존성 최소화)
- Radix UI 기반의 접근성
- Tailwind CSS와 완벽한 통합
- 커스터마이징 자유도 높음

**필수 컴포넌트:**
- Button
- Input
- Card
- Dialog
- Sheet
- Dropdown Menu
- Table
- Form
- Toast
- Tabs
- Select
- Badge
- Avatar
- Skeleton

**테마 설정:**
```css
/* app/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 239 84% 67%; /* Indigo */
  --primary-foreground: 210 40% 98%;
  --secondary: 276 62% 65%; /* Purple */
  --secondary-foreground: 222.2 47.4% 11.2%;
}
```

---

### 3. Backend & Database: **Supabase**

**선택 이유:**
- PostgreSQL 기반 (Cloudflare D1보다 강력)
- 실시간 기능
- Row Level Security (RLS)
- Storage for QR codes
- Edge Functions (필요시)

**데이터베이스 스키마:**

```sql
-- Users (Supabase Auth 연동)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan_id TEXT DEFAULT 'free',
  url_count_this_month INTEGER DEFAULT 0,
  month_reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plans
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url_limit INTEGER,
  custom_alias BOOLEAN DEFAULT FALSE,
  price_monthly INTEGER,
  features JSONB
);

-- Links
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  short_code TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  title TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  total_clicks INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  click_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clicks
CREATE TABLE clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  country TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  referer TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_links_short_code ON links(short_code);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_clicks_link_id ON clicks(link_id);
CREATE INDEX idx_clicks_created_at ON clicks(created_at);
```

**RLS 정책:**
```sql
-- Links: Users can only see their own links
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own links"
  ON links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links"
  ON links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links"
  ON links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
  ON links FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 4. Authentication: **Supabase Auth**

**지원 제공자:**
- Google OAuth
- GitHub OAuth (추가 가능)
- Email/Password (옵션)

**설정:**
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side client
import { createServerClient } from '@supabase/ssr'

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Cookie handling for Server Components
      }
    }
  )
}
```

---

### 5. Payment: **Polar**

**선택 이유:**
- 개발자 친화적
- SaaS에 최적화
- Lemon Squeezy 대안
- Webhook 지원

**플랜 구조:**
```typescript
// Free: $0/month
{
  id: 'free',
  urls: 50,
  features: ['Basic analytics', '7-day history']
}

// Pro: $9/month
{
  id: 'pro',
  urls: 1000,
  features: ['Custom aliases', '90-day history', 'QR codes']
}

// Business: $29/month
{
  id: 'business',
  urls: -1, // unlimited
  features: ['API access', 'Unlimited history', 'Priority support']
}
```

**Webhook 처리:**
```typescript
// app/api/webhooks/polar/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get('polar-signature')
  const payload = await req.text()

  // Verify signature
  // Update user subscription in Supabase
  // Send confirmation email via Resend
}
```

---

### 6. Email: **Resend**

**선택 이유:**
- 개발자 친화적 API
- React Email 통합
- 높은 전송률
- 저렴한 가격

**이메일 템플릿:**
```typescript
// emails/welcome.tsx
import { Html } from '@react-email/html';

export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <h1>Welcome to Snip, {name}!</h1>
      <p>Start shortening your URLs today.</p>
    </Html>
  );
}
```

**전송:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Snip <noreply@snip.example.com>',
  to: user.email,
  subject: 'Welcome to Snip!',
  react: WelcomeEmail({ name: user.name })
});
```

---

### 7. Analytics: **Posthog**

**선택 이유:**
- Self-hosted 옵션
- Session replay
- Feature flags
- A/B testing
- Funnel analysis

**이벤트 추적:**
```typescript
// lib/posthog.ts
import posthog from 'posthog-js'

export function initPosthog() {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false // We'll track manually
  })
}

// Track events
posthog.capture('link_created', {
  short_code: 'abc123',
  url_length: originalUrl.length
})
```

**주요 이벤트:**
- `link_created`
- `link_clicked`
- `qr_generated`
- `subscription_started`
- `subscription_cancelled`

---

### 8. Documentation: **Mintlify**

**선택 이유:**
- 아름다운 문서 사이트
- MDX 지원
- API 자동 문서화
- 검색 기능 내장

**구조:**
```
docs/
├── mint.json          # Configuration
├── introduction.mdx   # Getting started
├── api/
│   ├── authentication.mdx
│   ├── links.mdx
│   └── stats.mdx
├── guides/
│   ├── quickstart.mdx
│   ├── custom-domains.mdx
│   └── webhooks.mdx
└── changelog.mdx
```

---

## 📦 패키지 구조

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "posthog-js": "^1.96.0",
    "resend": "^3.0.0",
    "@radix-ui/react-*": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.307.0",
    "recharts": "^2.10.0",
    "qrcode.react": "^3.1.0",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "eslint": "^8",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 🌍 환경 변수

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...

# Polar
POLAR_API_KEY=polar_...
POLAR_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Posthog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=https://snip.example.com
```

---

## 🚀 배포

**Vercel (권장):**
- Automatic deployments from Git
- Edge Functions for redirects
- Analytics built-in
- Zero-config

**대안:**
- Netlify
- Self-hosted on Railway/Fly.io

---

## 📊 성능 목표

| 메트릭 | 목표 |
|--------|------|
| **리다이렉트 속도** | < 100ms |
| **API 응답 시간** | < 200ms |
| **Lighthouse Performance** | 90+ |
| **Lighthouse Accessibility** | 95+ |
| **Lighthouse SEO** | 95+ |

---

## 🔒 보안

1. **Supabase RLS**: 모든 테이블에 정책 적용
2. **CORS**: Next.js API Routes에서 관리
3. **Rate Limiting**: Vercel Edge Config
4. **환경 변수**: Vercel Secrets
5. **HTTPS Only**: Vercel 기본 제공

---

## 📈 스케일링 전략

1. **Database**: Supabase 자동 스케일링
2. **CDN**: Vercel Edge Network
3. **Caching**: Vercel Edge Cache + SWR
4. **Images**: Next.js Image Optimization

---

## ✅ 마이그레이션 체크리스트

- [ ] Next.js 15 프로젝트 생성
- [ ] shadcn/ui 설정
- [ ] Supabase 프로젝트 및 스키마
- [ ] Supabase Auth 통합
- [ ] Polar 계정 및 제품 설정
- [ ] Resend 계정 및 도메인 인증
- [ ] Posthog 프로젝트
- [ ] Mintlify 문서 사이트
- [ ] Vercel 배포 설정
