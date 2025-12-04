# Snip - URL Shortener Service

Snip은 React와 Cloudflare Workers를 기반으로 한 현대적인 URL 단축 서비스입니다.

## ✨ 주요 기능

- 🔗 **URL 단축**: 긴 URL을 짧고 공유하기 쉬운 링크로 변환
- 📊 **실시간 분석**: 클릭 수, 국가, 디바이스, 브라우저 등 상세 통계
- 🔐 **Google OAuth 인증**: 안전한 사용자 인증
- 📱 **QR 코드 생성**: 각 링크에 대한 QR 코드 자동 생성 및 다운로드
- ⚡ **빠른 리다이렉트**: Cloudflare KV를 활용한 초고속 리다이렉트
- 🎨 **현대적인 UI**: Tailwind CSS 기반의 반응형 디자인

## 📦 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS v4** - 스타일링
- **Zustand** - 상태 관리
- **Recharts** - 차트 및 데이터 시각화
- **React Router** - 클라이언트 사이드 라우팅
- **QRCode.react** - QR 코드 생성

### Backend
- **Cloudflare Workers** - 서버리스 컴퓨팅
- **Hono** - 경량 웹 프레임워크
- **Cloudflare D1** - SQLite 기반 데이터베이스
- **Cloudflare KV** - Key-Value 스토리지
- **JWT** - 인증 토큰

### Testing
- **Vitest** - 단위 테스트
- **Testing Library** - React 컴포넌트 테스트

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Cloudflare 계정
- Google Cloud Console 프로젝트 (OAuth용)

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/url-shortter.git
cd url-shortter

# 의존성 설치
npm install
```

### 환경 설정

1. `.dev.vars.example`을 `.dev.vars`로 복사:
```bash
cp .dev.vars.example .dev.vars
```

2. `.dev.vars` 파일을 편집하여 환경 변수 설정:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key
```

3. Cloudflare D1 데이터베이스 생성:
```bash
wrangler d1 create snip-db
```

4. Cloudflare KV 네임스페이스 생성:
```bash
wrangler kv:namespace create URL_CACHE
wrangler kv:namespace create URL_CACHE --preview
```

5. `wrangler.toml`과 `wrangler.redirect.toml`의 ID 업데이트

6. 데이터베이스 마이그레이션 실행:
```bash
npm run db:migrate:local
```

### 개발 서버 실행

```bash
# 프론트엔드만 실행
npm run dev

# Worker만 실행
npm run dev:worker

# Redirect Worker만 실행
npm run dev:redirect

# 모든 서비스 동시 실행
npm run dev:all
```

- Frontend: http://localhost:5173
- API Worker: http://localhost:8787
- Redirect Worker: http://localhost:8788

### 테스트

```bash
# 모든 테스트 실행
npm test

# Watch 모드로 테스트
npm run test:watch

# 커버리지 포함
npm run test:coverage
```

### 빌드

```bash
# 프론트엔드 빌드
npm run build

# 타입 체크
npm run typecheck
```

## 📁 프로젝트 구조

```
url-shortter/
├── src/
│   ├── app/                    # React 프론트엔드
│   │   ├── components/         # UI 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── stores/            # Zustand 스토어
│   │   ├── lib/               # 유틸리티
│   │   └── router.tsx         # 라우팅 설정
│   ├── worker/                # Main API Worker
│   │   ├── routes/            # API 라우트
│   │   ├── services/          # 비즈니스 로직
│   │   ├── middleware/        # 미들웨어
│   │   └── lib/               # 헬퍼 함수
│   ├── redirect/              # Redirect Worker
│   │   └── index.ts           # 리다이렉트 로직
│   └── types/                 # TypeScript 타입 정의
├── migrations/                # D1 마이그레이션
├── tests/                     # 테스트 파일
├── wrangler.toml             # Main Worker 설정
└── wrangler.redirect.toml    # Redirect Worker 설정
```

## 🔧 주요 명령어

```bash
# 개발
npm run dev                    # 프론트엔드 개발 서버
npm run dev:worker            # API Worker 개발 서버
npm run dev:redirect          # Redirect Worker 개발 서버
npm run dev:all               # 모든 서비스 동시 실행

# 테스트
npm test                      # 테스트 실행
npm run test:watch           # Watch 모드
npm run test:coverage        # 커버리지 포함

# 빌드
npm run build                # 프론트엔드 빌드
npm run typecheck            # 타입 체크

# 데이터베이스
npm run db:migrate:local     # 로컬 마이그레이션
npm run db:migrate:prod      # 프로덕션 마이그레이션

# 배포
npm run deploy               # Main Worker 배포
npm run deploy:redirect      # Redirect Worker 배포
```

## 🏗️ 아키텍처

### 데이터 흐름

1. **링크 생성**
   - 사용자가 원본 URL 입력
   - Worker가 짧은 코드 생성
   - D1에 링크 정보 저장
   - KV에 캐시 저장

2. **리다이렉트**
   - 사용자가 짧은 URL 방문
   - Redirect Worker가 KV에서 조회
   - 클릭 정보를 D1에 비동기 로깅
   - 원본 URL로 리다이렉트

3. **통계 조회**
   - 사용자가 대시보드에서 통계 요청
   - Worker가 D1에서 집계 데이터 조회
   - 차트로 시각화하여 표시

## 📊 데이터베이스 스키마

### users
- 사용자 정보 및 플랜 관리

### plans
- 무료/프로/비즈니스 플랜 정의

### links
- 단축 URL 정보 및 메타데이터

### clicks
- 클릭 이벤트 로그 (국가, 디바이스, 브라우저 등)

## 🔐 인증

Google OAuth 2.0을 사용한 인증:
1. 사용자가 Google 로그인 클릭
2. Google OAuth 동의 화면
3. 콜백으로 인증 코드 수신
4. Worker가 토큰 교환 및 사용자 정보 조회
5. JWT 토큰 발급
6. 클라이언트에서 토큰 저장 및 API 요청에 사용

## 🚀 배포

### Cloudflare Pages (Frontend)

1. GitHub 저장소 연결
2. 빌드 설정:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. 환경 변수 설정
4. 배포

### Cloudflare Workers (Backend)

```bash
# Main API Worker 배포
npm run deploy

# Redirect Worker 배포
npm run deploy:redirect
```

### 프로덕션 설정

1. `wrangler.toml`의 ID 업데이트
2. Cloudflare 대시보드에서 환경 변수 설정
3. 커스텀 도메인 설정
4. DNS 레코드 설정
5. 프로덕션 마이그레이션 실행

## 📝 라이선스

MIT License

## 🤝 기여

기여를 환영합니다! Pull Request를 보내주세요.

## 📧 문의

문제가 있거나 질문이 있으시면 Issue를 생성해주세요.
