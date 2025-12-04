# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 웹사이트 방문
2. "Start your project" 클릭
3. 새 Organization 생성 (또는 기존 선택)
4. "New Project" 클릭
5. 프로젝트 정보 입력:
   - **Name**: `snip-url-shortener`
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: 가까운 지역 선택 (예: Singapore - Southeast Asia)
   - **Pricing Plan**: Free tier 선택

6. "Create new project" 클릭하고 ~2분 대기

## 2. API 키 가져오기

프로젝트가 생성되면:

1. 왼쪽 메뉴에서 **Settings** (톱니바퀴 아이콘) 클릭
2. **API** 메뉴 클릭
3. 다음 정보 복사:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public** key: `eyJhb...` (긴 JWT 토큰)
   - **service_role** key: `eyJhb...` (Show 버튼 클릭 후)

## 3. 환경 변수 설정

`snip-next/.env.local` 파일 생성:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SHORT_DOMAIN=localhost:3000
```

## 4. 데이터베이스 마이그레이션 실행

1. Supabase Dashboard에서 **SQL Editor** 클릭
2. "New query" 클릭
3. `supabase/migrations/20241204000000_initial_schema.sql` 파일 내용 복사
4. 붙여넣기 후 **Run** 클릭
5. "Success" 메시지 확인

## 5. Google OAuth 설정

### 5.1 Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 방문
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** > **OAuth consent screen** 클릭
4. User Type: **External** 선택
5. App information 입력:
   - App name: `Snip URL Shortener`
   - User support email: 본인 이메일
   - Developer contact: 본인 이메일
6. Scopes: `/auth/userinfo.email`, `/auth/userinfo.profile` 추가
7. Test users 추가 (개발 중)

### 5.2 OAuth 2.0 Client ID 생성

1. **Credentials** 클릭
2. **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `Snip Web Client`
5. **Authorized redirect URIs** 추가:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. **Create** 클릭
7. Client ID와 Client Secret 복사

### 5.3 Supabase에 Google Provider 설정

1. Supabase Dashboard > **Authentication** > **Providers**
2. **Google** 클릭하여 활성화
3. 입력:
   - **Client ID**: (Google에서 복사한 것)
   - **Client Secret**: (Google에서 복사한 것)
4. **Save** 클릭

## 6. 확인

데이터베이스 테이블이 생성되었는지 확인:

1. Supabase Dashboard > **Table Editor**
2. 테이블 목록 확인:
   - ✓ plans
   - ✓ profiles
   - ✓ links
   - ✓ clicks

## 7. 로컬 개발 서버 실행

```bash
cd snip-next
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 문제 해결

### "relation does not exist" 오류
- SQL 마이그레이션이 실행되지 않았음
- SQL Editor에서 마이그레이션 다시 실행

### "invalid API key" 오류
- `.env.local` 파일 확인
- API 키가 정확한지 확인
- 개발 서버 재시작

### Google OAuth 리다이렉트 오류
- Redirect URI가 정확한지 확인
- Google Cloud Console의 Authorized redirect URIs 다시 확인

## 다음 단계

✅ Supabase 프로젝트 생성 완료
✅ 데이터베이스 스키마 생성 완료
✅ Google OAuth 설정 완료
✅ 환경 변수 설정 완료

→ 인증 로직 구현으로 진행!
