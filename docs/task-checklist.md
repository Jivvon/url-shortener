# Task Checklist
## Snip - URL Shortener Service

### Phase 1: MVP (핵심 기능)

---

#### 1. 프로젝트 초기 설정
- [ ] **1.1** Vite + React + TypeScript 프로젝트 생성
  ```bash
  npm create vite@latest snip -- --template react-ts
  ```
- [ ] **1.2** 필수 의존성 설치
  ```bash
  npm install react-router-dom zustand recharts qrcode.react
  npm install -D tailwindcss postcss autoprefixer @types/node
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  npm install -D wrangler hono nanoid
  ```
- [ ] **1.3** Tailwind CSS 설정
- [ ] **1.4** 프로젝트 구조 생성 (폴더/파일)
- [ ] **1.5** TypeScript 타입 정의 (`src/types/index.ts`)
- [ ] **1.6** ESLint/Prettier 설정
- [ ] **1.7** `.gitignore`, `README.md` 작성

---

#### 2. Cloudflare 인프라 설정
- [ ] **2.1** `wrangler.toml` 설정 파일 작성
- [ ] **2.2** Cloudflare D1 데이터베이스 생성
  ```bash
  wrangler d1 create snip-db
  ```
- [ ] **2.3** Cloudflare KV 네임스페이스 생성
  ```bash
  wrangler kv:namespace create URL_CACHE
  ```
- [ ] **2.4** D1 마이그레이션 파일 작성
  - `migrations/0001_initial.sql`
  - `migrations/0002_clicks.sql`
- [ ] **2.5** 마이그레이션 실행
  ```bash
  wrangler d1 migrations apply snip-db
  ```
- [ ] **2.6** 환경 변수 설정 (`.dev.vars`)

---

#### 3. Worker 기반 구축
- [ ] **3.1** Hono 라우터 설정 (`src/worker/index.ts`)
- [ ] **3.2** CORS 미들웨어 구현
- [ ] **3.3** D1 헬퍼 함수 작성 (`src/worker/lib/db.ts`)
- [ ] **3.4** KV 헬퍼 함수 작성 (`src/worker/lib/kv.ts`)
- [ ] **3.5** 에러 핸들링 미들웨어

---

#### 4. 인증 시스템
- [ ] **4.1** Google OAuth 설정 (Google Cloud Console)
  - OAuth 2.0 클라이언트 ID 생성
  - Redirect URI 등록: `https://snip.lento.dev/callback`
- [ ] **4.2** JWT 유틸리티 함수 (`src/worker/lib/jwt.ts`)
  - `signToken(payload)`
  - `verifyToken(token)`
- [ ] **4.3** Auth 라우트 구현 (`src/worker/routes/auth.ts`)
  - `GET /api/auth/google/login`
  - `POST /api/auth/google/callback`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- [ ] **4.4** Auth 미들웨어 구현 (`src/worker/middleware/auth.ts`)
- [ ] **4.5** Auth 서비스 로직 (`src/worker/services/authService.ts`)

**테스트**:
- [ ] **4.T1** JWT 토큰 생성/검증 테스트
- [ ] **4.T2** Auth 미들웨어 테스트

---

#### 5. URL 단축 핵심 기능
- [ ] **5.1** Short code 생성 함수 (6자리 Base62)
- [ ] **5.2** URL 유효성 검증 함수
- [ ] **5.3** Links 라우트 구현 (`src/worker/routes/links.ts`)
  - `POST /api/links` - 생성
  - `GET /api/links` - 목록
  - `GET /api/links/:id` - 상세
  - `PATCH /api/links/:id` - 수정
  - `DELETE /api/links/:id` - 삭제
- [ ] **5.4** URL 서비스 로직 (`src/worker/services/urlService.ts`)
- [ ] **5.5** KV에 URL 매핑 저장 로직

**테스트**:
- [ ] **5.T1** Short code 생성 테스트 (유니크성, 길이)
- [ ] **5.T2** URL 유효성 검증 테스트
- [ ] **5.T3** Links CRUD API 테스트

---

#### 6. 리다이렉트 Worker
- [ ] **6.1** 리다이렉트 Worker 생성 (`src/redirect/index.ts`)
- [ ] **6.2** KV에서 URL 조회 로직
- [ ] **6.3** 클릭 로깅 로직 (비동기)
- [ ] **6.4** User-Agent 파싱 (device, browser, OS)
- [ ] **6.5** 만료/비활성 링크 처리
- [ ] **6.6** 별도 wrangler 설정 (`wrangler.redirect.toml`)

**테스트**:
- [ ] **6.T1** 리다이렉트 로직 테스트
- [ ] **6.T2** 클릭 로깅 테스트

---

#### 7. 통계 기능
- [ ] **7.1** Stats 라우트 구현 (`src/worker/routes/stats.ts`)
  - `GET /api/links/:id/stats`
- [ ] **7.2** Stats 서비스 로직 (`src/worker/services/statsService.ts`)
- [ ] **7.3** 일별 통계 집계 쿼리
- [ ] **7.4** 국가/디바이스/브라우저/리퍼러 집계

**테스트**:
- [ ] **7.T1** 통계 집계 쿼리 테스트

---

#### 8. 프론트엔드 기반
- [ ] **8.1** React Router 설정 (`src/app/router.tsx`)
- [ ] **8.2** API 클라이언트 (`src/app/lib/api.ts`)
- [ ] **8.3** Auth Store (`src/app/stores/authStore.ts`)
- [ ] **8.4** Link Store (`src/app/stores/linkStore.ts`)
- [ ] **8.5** 기본 UI 컴포넌트 (Button, Input, Card, Modal)
- [ ] **8.6** Layout 컴포넌트 (Header, Footer, Sidebar)

---

#### 9. 프론트엔드 페이지
- [ ] **9.1** 랜딩 페이지 (`Landing.tsx`)
  - 히어로 섹션
  - 기능 소개
  - CTA (로그인 유도)
- [ ] **9.2** 가격 페이지 (`Pricing.tsx`)
  - 플랜 비교 테이블
  - "Coming Soon" 표시
- [ ] **9.3** 로그인 페이지 (`Login.tsx`)
  - Google 로그인 버튼
- [ ] **9.4** OAuth 콜백 페이지 (`Callback.tsx`)
- [ ] **9.5** 대시보드 레이아웃 (`dashboard/Layout.tsx`)
- [ ] **9.6** 대시보드 홈 (`dashboard/Dashboard.tsx`)
  - 요약 통계
  - 최근 링크
- [ ] **9.7** 링크 목록 (`dashboard/Links.tsx`)
  - 테이블/카드 뷰
  - 페이지네이션
  - 검색
- [ ] **9.8** 새 링크 생성 (`dashboard/NewLink.tsx`)
  - URL 입력 폼
  - 생성 결과 표시
- [ ] **9.9** 링크 상세 (`dashboard/LinkDetail.tsx`)
  - 링크 정보
  - 통계 차트
  - QR 코드
  - 삭제 버튼
- [ ] **9.10** 설정 페이지 (`dashboard/Settings.tsx`)
  - 프로필 정보
  - 플랜 정보

---

#### 10. QR 코드 기능
- [ ] **10.1** QR 코드 생성 컴포넌트 (`QRCodeGenerator.tsx`)
- [ ] **10.2** QR 코드 다운로드 (PNG/SVG)

---

#### 11. 배포
- [ ] **11.1** Cloudflare Pages 프로젝트 생성
- [ ] **11.2** GitHub 저장소 연동
- [ ] **11.3** 빌드 설정
- [ ] **11.4** 커스텀 도메인 설정
  - `snip.lento.dev` → Pages
  - `s.lento.dev` → Redirect Worker
- [ ] **11.5** DNS 레코드 설정
- [ ] **11.6** Production secrets 설정
  ```bash
  wrangler secret put GOOGLE_CLIENT_SECRET
  wrangler secret put JWT_SECRET
  ```
- [ ] **11.7** Production 마이그레이션 실행

---

### Phase 2: 유료화 및 부가기능 (추후)

#### 12. Stripe 결제 연동
- [ ] **12.1** Stripe 계정 설정
- [ ] **12.2** Products/Prices 생성 (Pro, Business)
- [ ] **12.3** Billing 라우트 구현
- [ ] **12.4** Stripe Checkout 연동
- [ ] **12.5** Stripe Webhook 처리
- [ ] **12.6** Customer Portal 연동
- [ ] **12.7** 플랜별 기능 제한 로직

#### 13. 부가기능
- [ ] **13.1** 커스텀 Alias 기능
- [ ] **13.2** URL 만료 기능
- [ ] **13.3** 벌크 생성 기능
- [ ] **13.4** 상세 통계 (국가/디바이스 차트)
- [ ] **13.5** 통계 CSV 내보내기
- [ ] **13.6** QR 코드 커스터마이징

#### 14. API (Business)
- [ ] **14.1** API Key 발급/관리
- [ ] **14.2** API 문서 페이지
- [ ] **14.3** Rate Limiting

---

### 완료 체크포인트

#### MVP 완료 기준
- [ ] Google 로그인으로 회원가입/로그인 가능
- [ ] URL 단축 생성 및 목록 조회 가능
- [ ] 단축 URL 클릭 시 원본으로 리다이렉트
- [ ] 기본 클릭 통계 (일별 차트) 확인 가능
- [ ] QR 코드 다운로드 가능
- [ ] 링크 삭제 가능
- [ ] 랜딩/가격 페이지 접근 가능
- [ ] `snip.lento.dev`, `s.lento.dev` 배포 완료
