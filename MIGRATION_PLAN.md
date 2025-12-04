# 기술 스택 마이그레이션 계획

## 📋 개요

**현재 스택 → 새로운 스택 전환**

### 변경 사항
| 영역 | 현재 | 신규 | 변경 이유 |
|------|------|------|-----------|
| **프레임워크** | Vite + React | Next.js 15 | SSR, App Router, SEO 개선 |
| **UI 라이브러리** | Tailwind CSS | Next.js + Tailwind + shadcn/ui | 일관된 컴포넌트 시스템 |
| **백엔드** | Cloudflare Workers | Next.js API Routes + Supabase | 통합 개발 환경 |
| **데이터베이스** | Cloudflare D1 | Supabase (PostgreSQL) | 더 강력한 DB 기능 |
| **인증** | Google OAuth + JWT | Supabase Auth | 통합 인증 시스템 |
| **스토리지** | Cloudflare KV | Supabase Storage | 파일 업로드 지원 |
| **결제** | 없음 | Polar | SaaS 결제 |
| **이메일** | 없음 | Resend | 트랜잭셔널 이메일 |
| **분석** | 자체 구현 | Posthog | 강력한 분석 도구 |
| **문서화** | README | Mintlify | 전문 문서 사이트 |

---

## 🎯 마이그레이션 목표

1. **개발 경험 개선**: 통합된 풀스택 프레임워크
2. **확장성**: Supabase의 강력한 DB 기능 활용
3. **비즈니스 기능 강화**: 결제, 이메일, 분석 추가
4. **전문성**: 고품질 문서화

---

## 📊 Phase 1: 기반 구축 (1-2일)

### Task 1.1: Next.js 프로젝트 초기화
- [ ] Next.js 15 프로젝트 생성
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] 폴더 구조 설계
- [ ] Git commit: `chore: Initialize Next.js 15 project`

### Task 1.2: shadcn/ui 설정
- [ ] shadcn/ui 초기화
- [ ] 필요한 컴포넌트 설치 (Button, Input, Card, etc.)
- [ ] 테마 설정 (colors, typography)
- [ ] Git commit: `feat: Setup shadcn/ui with theme configuration`

### Task 1.3: Supabase 프로젝트 설정
- [ ] Supabase 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] Supabase 클라이언트 초기화
- [ ] Git commit: `feat: Setup Supabase client and environment`

---

## 🔐 Phase 2: 인증 시스템 (1일)

### Task 2.1: Supabase Auth 통합
- [ ] Auth 테이블 스키마 설계
- [ ] Google OAuth 설정
- [ ] 로그인/로그아웃 구현
- [ ] 세션 관리
- [ ] Git commit: `feat: Implement Supabase Auth with Google OAuth`

### Task 2.2: 인증 UI 구현
- [ ] 로그인 페이지 (shadcn/ui 활용)
- [ ] 콜백 페이지
- [ ] Protected Routes
- [ ] Git commit: `feat: Build authentication UI with shadcn components`

---

## 🗄️ Phase 3: 데이터베이스 마이그레이션 (1-2일)

### Task 3.1: Supabase 스키마 설계
- [ ] 테이블 설계 (users, links, clicks, plans)
- [ ] RLS (Row Level Security) 정책
- [ ] 인덱스 최적화
- [ ] 마이그레이션 스크립트 작성
- [ ] Git commit: `feat: Design Supabase database schema with RLS`

### Task 3.2: 데이터 마이그레이션 도구
- [ ] Cloudflare D1 → Supabase 마이그레이션 스크립트
- [ ] 데이터 검증
- [ ] Git commit: `feat: Create data migration tool from D1 to Supabase`

---

## 🔗 Phase 4: 핵심 기능 재구현 (2-3일)

### Task 4.1: URL 단축 기능
- [ ] API Routes 구현 (`/api/links`)
- [ ] Short code 생성 로직
- [ ] Supabase에 링크 저장
- [ ] Git commit: `feat: Implement URL shortening with Supabase`

### Task 4.2: 리다이렉트 기능
- [ ] Dynamic Route (`/[shortCode]`)
- [ ] Supabase에서 URL 조회
- [ ] 클릭 로깅 (Posthog 연동)
- [ ] Git commit: `feat: Implement redirect with click tracking`

### Task 4.3: 통계 및 분석
- [ ] Posthog 설정
- [ ] 이벤트 추적 구현
- [ ] 대시보드 데이터 집계
- [ ] Git commit: `feat: Integrate Posthog for analytics`

---

## 🎨 Phase 5: UI 구현 (2-3일)

### Task 5.1: 레이아웃 및 공통 컴포넌트
- [ ] App Layout (Header, Footer, Sidebar)
- [ ] shadcn/ui 커스터마이징
- [ ] 반응형 디자인
- [ ] Git commit: `feat: Build responsive layout with shadcn/ui`

### Task 5.2: 주요 페이지
- [ ] 랜딩 페이지
- [ ] 대시보드
- [ ] 링크 목록 페이지
- [ ] 링크 상세 페이지
- [ ] Git commit: `feat: Implement main pages with modern UI`

### Task 5.3: QR 코드 기능
- [ ] QR 코드 생성
- [ ] Supabase Storage 연동 (이미지 저장)
- [ ] Git commit: `feat: Add QR code generation with Supabase Storage`

---

## 💳 Phase 6: 결제 시스템 (2일)

### Task 6.1: Polar 통합
- [ ] Polar 계정 및 제품 설정
- [ ] Webhook 엔드포인트 구현
- [ ] 플랜별 기능 제한
- [ ] Git commit: `feat: Integrate Polar for payments`

### Task 6.2: 구독 관리 UI
- [ ] 가격 페이지
- [ ] 결제 플로우
- [ ] 구독 관리 페이지
- [ ] Git commit: `feat: Build subscription management UI`

---

## 📧 Phase 7: 이메일 시스템 (1일)

### Task 7.1: Resend 통합
- [ ] Resend API 설정
- [ ] 이메일 템플릿 작성
- [ ] 트랜잭셔널 이메일 구현
  - 회원가입 환영 이메일
  - 링크 생성 알림
  - 월간 리포트
- [ ] Git commit: `feat: Implement email system with Resend`

---

## 📚 Phase 8: 문서화 (1일)

### Task 8.1: Mintlify 설정
- [ ] Mintlify 프로젝트 초기화
- [ ] 문서 구조 설계
- [ ] API 문서 작성
- [ ] 사용 가이드 작성
- [ ] Git commit: `docs: Setup Mintlify documentation`

---

## 🧪 Phase 9: 테스트 및 최적화 (1-2일)

### Task 9.1: 테스트 작성
- [ ] Unit tests (Jest/Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Git commit: `test: Add comprehensive test coverage`

### Task 9.2: 성능 최적화
- [ ] Next.js 이미지 최적화
- [ ] ISR/SSR 전략
- [ ] Supabase 쿼리 최적화
- [ ] Git commit: `perf: Optimize performance with caching and image optimization`

---

## 🚀 Phase 10: 배포 (1일)

### Task 10.1: Vercel 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 커스텀 도메인 설정
- [ ] Git commit: `deploy: Configure Vercel deployment`

### Task 10.2: 모니터링
- [ ] Vercel Analytics
- [ ] Sentry 에러 추적
- [ ] Git commit: `feat: Setup monitoring and error tracking`

---

## 📝 마이그레이션 체크리스트

### 데이터 마이그레이션
- [ ] 사용자 데이터
- [ ] 링크 데이터
- [ ] 클릭 통계 데이터

### 기능 확인
- [ ] URL 단축
- [ ] 리다이렉트
- [ ] 통계 조회
- [ ] QR 코드 생성
- [ ] 결제 시스템
- [ ] 이메일 발송

### 성능 테스트
- [ ] 리다이렉트 속도 (< 100ms)
- [ ] API 응답 시간 (< 200ms)
- [ ] Lighthouse 점수 (90+)

---

## 🎯 성공 기준

1. **기능 완성도**: 모든 기존 기능 동작 ✅
2. **성능**: 이전 대비 동등 이상의 성능 ✅
3. **코드 품질**: 80% 이상 테스트 커버리지 ✅
4. **문서화**: 완전한 API 문서 및 사용 가이드 ✅
5. **결제**: Polar 통합 완료 ✅

---

## ⏱️ 예상 일정

| Phase | 기간 | 상태 |
|-------|------|------|
| Phase 1: 기반 구축 | 1-2일 | 🔜 |
| Phase 2: 인증 시스템 | 1일 | ⏳ |
| Phase 3: DB 마이그레이션 | 1-2일 | ⏳ |
| Phase 4: 핵심 기능 | 2-3일 | ⏳ |
| Phase 5: UI 구현 | 2-3일 | ⏳ |
| Phase 6: 결제 시스템 | 2일 | ⏳ |
| Phase 7: 이메일 | 1일 | ⏳ |
| Phase 8: 문서화 | 1일 | ⏳ |
| Phase 9: 테스트 | 1-2일 | ⏳ |
| Phase 10: 배포 | 1일 | ⏳ |

**총 예상 기간: 13-19일**

---

## 🔄 롤백 계획

문제 발생 시:
1. 이전 Cloudflare Workers 버전 유지
2. DNS 전환으로 빠른 롤백 가능
3. 데이터는 읽기 전용으로 접근

---

## 📌 주의사항

1. **단계별 커밋**: 각 태스크마다 의미 있는 커밋 메시지
2. **테스트 우선**: 기능 구현 후 반드시 테스트
3. **문서화**: 코드 변경 시 문서도 함께 업데이트
4. **성능 모니터링**: 각 단계에서 성능 확인
