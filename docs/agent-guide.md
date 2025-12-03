# Claude Code Agent 작업 가이드
## Snip - URL Shortener Service

### 프로젝트 개요

URL 단축 서비스를 Cloudflare 생태계(Pages, Workers, D1, KV)를 활용해 개발합니다.
- Frontend: `snip.lento.dev` (React SPA on Cloudflare Pages)
- Redirect: `s.lento.dev` (Cloudflare Worker)

---

### 문서 파일 구조

```
docs/
├── PRD.md           # 제품 요구사항 정의
├── TECH_SPEC.md     # 기술 스펙
├── DB_SCHEMA.md     # 데이터베이스 스키마
├── API.md           # API 명세
└── TASKS.md         # 작업 체크리스트
```

에이전트에게 이 문서들을 함께 제공하세요.

---

### 에이전트 시작 프롬프트

아래 프롬프트를 복사해서 Claude Code에 붙여넣으세요:

```
# 프로젝트 컨텍스트
URL 단축 서비스 "Snip"을 개발합니다. 아래 문서들을 참고해주세요:

- PRD.md: 제품 요구사항
- TECH_SPEC.md: 기술 스택 및 아키텍처  
- DB_SCHEMA.md: D1 데이터베이스 스키마
- API.md: REST API 명세
- TASKS.md: 작업 체크리스트

# 핵심 기술 스택
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Cloudflare Workers + Hono
- Database: Cloudflare D1 (SQLite)
- Cache: Cloudflare KV
- Auth: Google OAuth 2.0 + JWT

# 도메인
- snip.lento.dev: 웹 앱 (Cloudflare Pages)
- s.lento.dev: 리다이렉트 (Cloudflare Worker)

# 작업 방식
1. TASKS.md의 체크리스트를 순서대로 진행
2. 각 태스크 완료 시 체크 표시
3. 테스트 코드를 먼저 작성 (TDD)
4. 커밋 메시지는 conventional commits 형식

# 첫 번째 작업
TASKS.md의 "1. 프로젝트 초기 설정"부터 시작해주세요.
프로젝트 폴더를 생성하고 기본 설정을 완료해주세요.
```

---

### 단계별 작업 지시 예시

#### Phase 1-1: 프로젝트 초기화
```
TASKS.md의 섹션 1, 2를 진행해주세요.
- Vite + React + TypeScript 프로젝트 생성
- 의존성 설치
- Tailwind CSS 설정
- wrangler.toml 작성
- D1, KV 네임스페이스 생성 명령어 출력

완료 후 프로젝트 구조를 보여주세요.
```

#### Phase 1-2: Worker 및 인증
```
TASKS.md의 섹션 3, 4를 진행해주세요.
- Hono 기반 Worker 설정
- JWT 유틸리티 함수 구현
- Google OAuth 인증 라우트 구현
- Auth 미들웨어 구현

테스트 코드도 함께 작성해주세요.
```

#### Phase 1-3: URL 단축 핵심
```
TASKS.md의 섹션 5, 6을 진행해주세요.
- Short code 생성 로직 (6자리 Base62)
- Links CRUD API 구현
- 리다이렉트 Worker 구현
- 클릭 로깅 로직

API.md를 참고해서 정확한 요청/응답 형식을 따라주세요.
```

#### Phase 1-4: 통계
```
TASKS.md의 섹션 7을 진행해주세요.
- Stats API 구현
- 일별 통계 집계 쿼리
- 국가/디바이스/브라우저 집계

DB_SCHEMA.md의 daily_stats 테이블 구조를 참고하세요.
```

#### Phase 1-5: 프론트엔드
```
TASKS.md의 섹션 8, 9, 10을 진행해주세요.
- React Router 설정
- Zustand 스토어 구현
- 기본 UI 컴포넌트
- 모든 페이지 구현

TECH_SPEC.md의 페이지 구조를 따라주세요.
디자인은 미니멀하게, Tailwind CSS만 사용해주세요.
```

#### Phase 1-6: 배포
```
TASKS.md의 섹션 11을 진행해주세요.
- Cloudflare Pages 배포 설정
- 커스텀 도메인 설정 가이드
- Production 환경 설정

배포 명령어와 DNS 설정 방법을 알려주세요.
```

---

### 에이전트 작업 시 주의사항

#### 1. 코드 스타일
```typescript
// 함수형 컴포넌트 사용
// Named export 선호
// 타입은 별도 파일에 정의

// Good
export function LinkCard({ link }: LinkCardProps) { ... }

// Avoid
export default class LinkCard extends Component { ... }
```

#### 2. 에러 처리
```typescript
// Worker에서 일관된 에러 응답
return c.json({
  error: {
    code: 'INVALID_URL',
    message: 'The provided URL is not valid'
  }
}, 400);
```

#### 3. 환경 변수
```typescript
// Worker에서 env 접근
export default {
  async fetch(request: Request, env: Env) {
    const db = env.DB;
    const kv = env.URL_CACHE;
  }
}
```

#### 4. 테스트
```typescript
// Vitest + miniflare 조합
import { unstable_dev } from 'wrangler';

describe('Links API', () => {
  let worker;
  
  beforeAll(async () => {
    worker = await unstable_dev('src/worker/index.ts');
  });
  
  it('should create a link', async () => {
    const res = await worker.fetch('/api/links', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' })
    });
    expect(res.status).toBe(201);
  });
});
```

---

### 트러블슈팅 가이드

#### D1 마이그레이션 오류
```bash
# 로컬에서 먼저 테스트
wrangler d1 migrations apply snip-db --local

# 문제 없으면 원격 적용
wrangler d1 migrations apply snip-db --remote
```

#### KV 접근 오류
```bash
# KV ID 확인
wrangler kv:namespace list

# wrangler.toml에 올바른 ID 설정 확인
```

#### OAuth Redirect URI 오류
```
Google Cloud Console에서 Redirect URI 정확히 등록:
- 개발: http://localhost:8788/callback
- 운영: https://snip.lento.dev/callback
```

---

### 완료 확인 체크리스트

MVP가 완료되면 아래를 확인하세요:

- [ ] `https://snip.lento.dev` 접속 가능
- [ ] Google 로그인 동작
- [ ] URL 단축 생성 동작
- [ ] `https://s.lento.dev/abc123` 리다이렉트 동작
- [ ] 통계 차트 표시
- [ ] QR 코드 다운로드
- [ ] 모바일 반응형 동작
