# Technical Specification
## Snip - URL Shortener Service

### 1. 기술 스택

#### 1.1 Frontend
```
Framework: React 18 + TypeScript
Build Tool: Vite
Styling: Tailwind CSS
State: Zustand (경량)
Router: React Router v6
Charts: Recharts
QR Code: qrcode.react
HTTP Client: fetch (native)
Testing: Vitest + React Testing Library
```

#### 1.2 Backend (Cloudflare)
```
Runtime: Cloudflare Workers
KV Store: Cloudflare KV (URL 매핑 캐시)
Database: Cloudflare D1 (SQLite)
Auth: Google OAuth 2.0 + JWT
```

#### 1.3 External Services
```
Payment: Stripe (Phase 2)
Analytics: Cloudflare Analytics (내장)
```

---

### 2. 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Cloudflare                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ snip.lento.dev   │    │ s.lento.dev      │              │
│  │ (Pages)          │    │ (Worker)         │              │
│  │                  │    │                  │              │
│  │ - React SPA      │    │ - Redirect       │              │
│  │ - Static Assets  │    │ - Click Logging  │              │
│  └────────┬─────────┘    └────────┬─────────┘              │
│           │                       │                         │
│           ▼                       ▼                         │
│  ┌──────────────────────────────────────────┐              │
│  │           API Worker                      │              │
│  │  /api/auth/*    - 인증                    │              │
│  │  /api/links/*   - 링크 CRUD               │              │
│  │  /api/stats/*   - 통계                    │              │
│  └────────┬───────────────────┬─────────────┘              │
│           │                   │                             │
│           ▼                   ▼                             │
│  ┌─────────────┐     ┌─────────────┐                       │
│  │     D1      │     │     KV      │                       │
│  │  (SQLite)   │     │  (Cache)    │                       │
│  │             │     │             │                       │
│  │ - users     │     │ - URL map   │                       │
│  │ - links     │     │   (short→   │                       │
│  │ - clicks    │     │    long)    │                       │
│  │ - plans     │     │             │                       │
│  └─────────────┘     └─────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Cloudflare 리소스 설정

#### 3.1 Workers
```toml
# wrangler.toml

name = "snip-api"
main = "src/worker/index.ts"
compatibility_date = "2024-01-01"

# KV Namespace
[[kv_namespaces]]
binding = "URL_CACHE"
id = "<KV_NAMESPACE_ID>"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "snip-db"
database_id = "<D1_DATABASE_ID>"

# Environment Variables
[vars]
GOOGLE_CLIENT_ID = ""
JWT_SECRET = ""
SHORT_DOMAIN = "s.lento.dev"
APP_DOMAIN = "snip.lento.dev"

# Production secrets (set via wrangler secret)
# GOOGLE_CLIENT_SECRET
# STRIPE_SECRET_KEY (Phase 2)
# STRIPE_WEBHOOK_SECRET (Phase 2)
```

#### 3.2 Pages
```toml
# Frontend는 Cloudflare Pages로 배포
# GitHub 연동 또는 wrangler pages deploy

[build]
command = "npm run build"
output_directory = "dist"
```

---

### 4. 프로젝트 구조

```
snip/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── wrangler.toml
│
├── src/
│   ├── app/                    # React 앱
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   │
│   │   ├── components/         # 공통 컴포넌트
│   │   │   ├── ui/            # 기본 UI (Button, Input, Card...)
│   │   │   ├── layout/        # Header, Footer, Sidebar
│   │   │   └── shared/        # LinkCard, StatsChart...
│   │   │
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── Landing.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Callback.tsx   # OAuth callback
│   │   │   └── dashboard/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Links.tsx
│   │   │       ├── LinkDetail.tsx
│   │   │       ├── NewLink.tsx
│   │   │       └── Settings.tsx
│   │   │
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useLinks.ts
│   │   │   └── useStats.ts
│   │   │
│   │   ├── stores/            # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── linkStore.ts
│   │   │
│   │   ├── lib/               # 유틸리티
│   │   │   ├── api.ts         # API client
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── types/             # TypeScript 타입
│   │       └── index.ts
│   │
│   ├── worker/                # Cloudflare Worker
│   │   ├── index.ts           # Entry point
│   │   ├── router.ts          # Hono router
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.ts        # /api/auth/*
│   │   │   ├── links.ts       # /api/links/*
│   │   │   └── stats.ts       # /api/stats/*
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT 검증
│   │   │   └── cors.ts
│   │   │
│   │   ├── services/
│   │   │   ├── urlService.ts
│   │   │   ├── authService.ts
│   │   │   └── statsService.ts
│   │   │
│   │   └── lib/
│   │       ├── db.ts          # D1 헬퍼
│   │       ├── kv.ts          # KV 헬퍼
│   │       └── jwt.ts
│   │
│   └── redirect/              # 리다이렉트 Worker (별도)
│       └── index.ts           # s.lento.dev 전용
│
├── migrations/                # D1 마이그레이션
│   ├── 0001_initial.sql
│   └── 0002_clicks.sql
│
├── tests/
│   ├── unit/
│   │   ├── worker/
│   │   └── app/
│   └── e2e/
│
└── docs/
    ├── PRD.md
    ├── TECH_SPEC.md
    ├── API.md
    └── DB_SCHEMA.md
```

---

### 5. 단축 코드 생성 알고리즘

```typescript
// 6자리 Base62 인코딩
// 62^6 = 56,800,235,584 (568억 개 조합)

const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const CODE_LENGTH = 6;

function generateShortCode(): string {
  const array = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => CHARSET[b % 62])
    .join('');
}

// 충돌 처리: 생성 후 KV에서 존재 여부 확인
// 충돌 시 재생성 (최대 3회)
```

---

### 6. 인증 플로우

```
1. 사용자가 "Google로 로그인" 클릭
   └─> /api/auth/google/login

2. Worker가 Google OAuth URL로 리다이렉트
   └─> https://accounts.google.com/o/oauth2/v2/auth
       ?client_id=...
       &redirect_uri=https://snip.lento.dev/callback
       &response_type=code
       &scope=email profile

3. 사용자가 Google에서 승인

4. Google이 callback으로 리다이렉트
   └─> https://snip.lento.dev/callback?code=...

5. Frontend가 code를 Backend로 전송
   └─> POST /api/auth/google/callback { code }

6. Worker가 Google에서 토큰 교환
   └─> https://oauth2.googleapis.com/token

7. Worker가 사용자 정보 조회
   └─> https://www.googleapis.com/oauth2/v2/userinfo

8. D1에 사용자 생성/업데이트

9. JWT 토큰 생성 및 반환
   └─> { token, user }

10. Frontend가 토큰 저장 (localStorage)
    └─> 이후 요청에 Authorization: Bearer <token>
```

---

### 7. 리다이렉트 Worker (s.lento.dev)

```typescript
// src/redirect/index.ts

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const shortCode = url.pathname.slice(1); // /abc123 -> abc123

    if (!shortCode) {
      return Response.redirect('https://snip.lento.dev', 302);
    }

    // 1. KV에서 원본 URL 조회
    const originalUrl = await env.URL_CACHE.get(shortCode);

    if (!originalUrl) {
      return new Response('Link not found', { status: 404 });
    }

    // 2. 클릭 로깅 (비동기, 응답 차단 안 함)
    const clickData = {
      shortCode,
      timestamp: Date.now(),
      country: request.cf?.country,
      device: parseUserAgent(request.headers.get('user-agent')),
      referer: request.headers.get('referer'),
    };
    
    // D1에 클릭 기록 (waitUntil로 비동기 처리)
    ctx.waitUntil(logClick(env.DB, clickData));

    // 3. 리다이렉트
    return Response.redirect(originalUrl, 302);
  }
};
```

---

### 8. 환경 변수

#### Development (.dev.vars)
```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
JWT_SECRET=dev-secret-key
```

#### Production (wrangler secret)
```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put JWT_SECRET
# Phase 2
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

---

### 9. 테스트 전략

#### 9.1 Unit Tests
- URL 생성/검증 로직
- JWT 토큰 생성/검증
- 통계 집계 로직

#### 9.2 Integration Tests
- API 엔드포인트 (miniflare 활용)
- D1/KV 연동

#### 9.3 E2E Tests (Phase 2)
- Playwright로 주요 플로우 테스트
- 로그인 → 링크 생성 → 통계 확인
