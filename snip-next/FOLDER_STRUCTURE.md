# Next.js 프로젝트 폴더 구조

```
snip-next/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group route
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── callback/
│   │       └── page.tsx          # OAuth callback
│   │
│   ├── (marketing)/              # Marketing group route
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Marketing layout
│   │
│   ├── (dashboard)/              # Dashboard group route
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── links/
│   │   │   │   ├── page.tsx      # Links list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx  # Link detail
│   │   │   │   └── new/
│   │   │   │       └── page.tsx  # Create link
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── layout.tsx            # Dashboard layout
│   │
│   ├── [shortCode]/              # Dynamic redirect route
│   │   └── page.tsx              # Redirect handler
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   └── me/
│   │   │       └── route.ts
│   │   ├── links/
│   │   │   ├── route.ts          # GET, POST /api/links
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PATCH, DELETE
│   │   ├── stats/
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       ├── polar/
│   │       │   └── route.ts
│   │       └── resend/
│   │           └── route.ts
│   │
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── providers.tsx             # Context providers
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   └── mobile-nav.tsx
│   │
│   ├── dashboard/                # Dashboard specific
│   │   ├── link-card.tsx
│   │   ├── stats-chart.tsx
│   │   ├── qr-generator.tsx
│   │   └── link-form.tsx
│   │
│   └── marketing/                # Marketing specific
│       ├── hero.tsx
│       ├── features.tsx
│       ├── pricing-table.tsx
│       └── cta.tsx
│
├── lib/                          # Utility libraries
│   ├── supabase/
│   │   ├── client.ts             # Client-side Supabase
│   │   ├── server.ts             # Server-side Supabase
│   │   ├── middleware.ts         # Auth middleware
│   │   └── types.ts              # Database types
│   │
│   ├── polar/
│   │   ├── client.ts
│   │   └── webhook.ts
│   │
│   ├── resend/
│   │   └── client.ts
│   │
│   ├── posthog/
│   │   ├── client.ts
│   │   └── provider.tsx
│   │
│   ├── utils.ts                  # General utilities
│   ├── constants.ts              # App constants
│   └── validations.ts            # Zod schemas
│
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts
│   ├── use-links.ts
│   ├── use-stats.ts
│   └── use-toast.ts
│
├── types/                        # TypeScript types
│   ├── database.ts               # Supabase generated types
│   ├── api.ts                    # API types
│   └── index.ts                  # Exports
│
├── emails/                       # React Email templates
│   ├── welcome.tsx
│   ├── link-created.tsx
│   └── monthly-report.tsx
│
├── public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── components.json               # shadcn/ui config
├── .env.local                    # Environment variables
├── .env.example                  # Example env file
└── package.json

```

## 폴더별 설명

### `app/` - Next.js App Router
- **Route Groups** `(auth)`, `(marketing)`, `(dashboard)`: URL에 영향 없이 라우트 조직화
- **Dynamic Routes** `[shortCode]`: 짧은 URL 리다이렉트 처리
- **API Routes**: RESTful API 엔드포인트

### `components/`
- **ui/**: shadcn/ui 컴포넌트 (복사-붙여넣기 방식)
- **layout/**: 재사용 가능한 레이아웃 컴포넌트
- **dashboard/**: 대시보드 전용 컴포넌트
- **marketing/**: 마케팅 페이지 전용 컴포넌트

### `lib/`
- 외부 서비스 클라이언트 (Supabase, Polar, Resend, Posthog)
- 유틸리티 함수
- 검증 스키마

### `hooks/`
- 커스텀 React hooks
- 상태 관리 로직

### `emails/`
- React Email 템플릿
- Resend로 전송

## 명명 규칙

- **컴포넌트**: PascalCase (`LinkCard.tsx`)
- **유틸리티**: camelCase (`formatDate.ts`)
- **상수**: UPPER_SNAKE_CASE
- **타입/인터페이스**: PascalCase

## 파일 구조 원칙

1. **Colocation**: 관련 파일은 가까이
2. **Domain-driven**: 기능별로 그룹화
3. **Flat is better**: 깊은 중첩 피하기
4. **Explicit imports**: 명시적 import 경로
