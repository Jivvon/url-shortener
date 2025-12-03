# API Specification
## Snip - URL Shortener Service

### Base URL
- API: `https://snip.lento.dev/api`
- Redirect: `https://s.lento.dev`

### Authentication
모든 보호된 엔드포인트는 JWT Bearer 토큰 필요
```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### GET /api/auth/google/login
Google OAuth 로그인 시작

**Response**: 302 Redirect to Google

---

### POST /api/auth/google/callback
Google OAuth 콜백 처리

**Request Body**:
```json
{
  "code": "authorization_code_from_google"
}
```

**Response**: 200 OK
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "plan_id": "free",
    "url_count_this_month": 5,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/auth/me
현재 사용자 정보 조회 (🔒 인증 필요)

**Response**: 200 OK
```json
{
  "user": {
    "id": "user_xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "plan_id": "free",
    "url_count_this_month": 5,
    "month_reset_at": "2024-02-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "plan": {
    "id": "free",
    "name": "Free",
    "url_limit": 50,
    "stats_retention_days": 7,
    "features": {
      "customAlias": false,
      "expiration": false,
      "bulk": false,
      "qrCustom": false
    }
  }
}
```

---

### POST /api/auth/logout
로그아웃 (토큰 무효화)

**Response**: 200 OK
```json
{
  "success": true
}
```

---

## Links Endpoints

### GET /api/links
내 링크 목록 조회 (🔒 인증 필요)

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 개수 (max: 100) |
| sort | string | created_at | 정렬 기준 |
| order | string | desc | 정렬 순서 (asc/desc) |
| search | string | - | URL/제목 검색 |

**Response**: 200 OK
```json
{
  "links": [
    {
      "id": "link_xxx",
      "short_code": "abc123",
      "short_url": "https://s.lento.dev/abc123",
      "original_url": "https://example.com/very-long-url",
      "title": "My Link",
      "is_active": true,
      "expires_at": null,
      "click_limit": null,
      "total_clicks": 42,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### POST /api/links
새 링크 생성 (🔒 인증 필요)

**Request Body**:
```json
{
  "url": "https://example.com/very-long-url",
  "title": "My Link",           // optional
  "custom_code": "my-brand",    // optional (Pro+)
  "expires_at": "2024-12-31",   // optional (Pro+)
  "click_limit": 1000           // optional (Pro+)
}
```

**Response**: 201 Created
```json
{
  "link": {
    "id": "link_xxx",
    "short_code": "abc123",
    "short_url": "https://s.lento.dev/abc123",
    "original_url": "https://example.com/very-long-url",
    "title": "My Link",
    "is_active": true,
    "expires_at": null,
    "click_limit": null,
    "total_clicks": 0,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors**:
- 400: Invalid URL / Custom code already taken
- 403: Plan limit reached / Feature not available
- 429: Rate limit exceeded

---

### GET /api/links/:id
링크 상세 조회 (🔒 인증 필요)

**Response**: 200 OK
```json
{
  "link": {
    "id": "link_xxx",
    "short_code": "abc123",
    "short_url": "https://s.lento.dev/abc123",
    "original_url": "https://example.com/very-long-url",
    "title": "My Link",
    "is_active": true,
    "expires_at": null,
    "click_limit": null,
    "total_clicks": 42,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### PATCH /api/links/:id
링크 수정 (🔒 인증 필요)

**Request Body**:
```json
{
  "title": "Updated Title",     // optional
  "is_active": false,           // optional
  "expires_at": "2024-12-31",   // optional (Pro+)
  "click_limit": 500            // optional (Pro+)
}
```

**Response**: 200 OK
```json
{
  "link": { ... }
}
```

---

### DELETE /api/links/:id
링크 삭제 (🔒 인증 필요)

**Response**: 200 OK
```json
{
  "success": true
}
```

---

## Stats Endpoints

### GET /api/links/:id/stats
링크 통계 조회 (🔒 인증 필요)

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | 7d | 기간 (7d, 30d, 90d, all) |

**Response**: 200 OK
```json
{
  "summary": {
    "total_clicks": 1234,
    "unique_visitors": 890,
    "avg_daily_clicks": 42
  },
  "daily": [
    {
      "date": "2024-01-15",
      "clicks": 45,
      "unique": 38
    },
    {
      "date": "2024-01-16",
      "clicks": 52,
      "unique": 41
    }
  ],
  "countries": {
    "US": 450,
    "KR": 320,
    "JP": 180,
    "other": 284
  },
  "devices": {
    "desktop": 620,
    "mobile": 580,
    "tablet": 34
  },
  "browsers": {
    "chrome": 680,
    "safari": 320,
    "firefox": 150,
    "other": 84
  },
  "referers": {
    "direct": 500,
    "twitter.com": 280,
    "google.com": 220,
    "other": 234
  }
}
```

---

## Billing Endpoints (Phase 2)

### GET /api/billing
결제 정보 조회 (🔒 인증 필요)

**Response**: 200 OK
```json
{
  "plan": {
    "id": "pro",
    "name": "Pro",
    "price_cents": 500
  },
  "subscription": {
    "status": "active",
    "current_period_end": "2024-02-15T00:00:00Z",
    "cancel_at_period_end": false
  },
  "usage": {
    "urls_created": 45,
    "urls_limit": 1000
  }
}
```

---

### POST /api/billing/checkout
Stripe Checkout 세션 생성 (🔒 인증 필요)

**Request Body**:
```json
{
  "plan_id": "pro"
}
```

**Response**: 200 OK
```json
{
  "checkout_url": "https://checkout.stripe.com/..."
}
```

---

### POST /api/billing/portal
Stripe Customer Portal 세션 생성 (🔒 인증 필요)

**Response**: 200 OK
```json
{
  "portal_url": "https://billing.stripe.com/..."
}
```

---

### POST /api/webhooks/stripe
Stripe Webhook 수신 (서명 검증 필요)

**Events Handled**:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

## Redirect Endpoint (s.lento.dev)

### GET /:shortCode
단축 URL 리다이렉트

**Response**:
- 302 Redirect (성공)
- 404 Not Found (존재하지 않음)
- 410 Gone (만료됨)

---

## Error Response Format

모든 에러는 일관된 형식으로 반환:

```json
{
  "error": {
    "code": "INVALID_URL",
    "message": "The provided URL is not valid",
    "details": {
      "field": "url",
      "reason": "missing_protocol"
    }
  }
}
```

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| UNAUTHORIZED | 401 | 인증 필요 |
| FORBIDDEN | 403 | 권한 없음 |
| NOT_FOUND | 404 | 리소스 없음 |
| INVALID_URL | 400 | 잘못된 URL |
| CODE_TAKEN | 400 | 커스텀 코드 중복 |
| PLAN_LIMIT | 403 | 플랜 한도 초과 |
| FEATURE_LOCKED | 403 | 플랜에서 지원 안 함 |
| RATE_LIMITED | 429 | 요청 제한 |
| SERVER_ERROR | 500 | 서버 오류 |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST /api/links | 10/분 |
| GET /api/links | 60/분 |
| 리다이렉트 | 1000/분/IP |
