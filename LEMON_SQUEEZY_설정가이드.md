# 🍋 Lemon Squeezy 결제 연동 가이드

Vintage Sniper 앱에 Lemon Squeezy 결제 시스템을 연동하는 방법을 설명합니다.

---

## 📋 개요

우리는 Lemon Squeezy를 통해 2가지 상품을 판매합니다:
1. **10 크레딧 팩** - 일회성 결제 (₩4,000 / $3)
2. **헌터 플랜** - 월 구독 (₩19,900 / $12)

결제가 완료되면 웹훅(Webhook)이 자동으로 Supabase의 `profiles` 테이블을 업데이트합니다.

---

## 🚀 빠른 시작 (5단계)

### 1단계: 데이터베이스 마이그레이션 실행

Supabase 대시보드의 SQL Editor에서 다음 SQL을 실행하세요:

**파일 위치**: `supabase/migrations/add_payment_columns.sql`

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS is_hunter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_customer_id ON profiles(customer_id);
```

**추가되는 컬럼 설명**:
- `credits`: 스캔 크레딧 개수 (기본값 3개)
- `is_hunter`: 헌터 구독 활성화 여부 (true/false)
- `subscription_id`: Lemon Squeezy 구독 ID
- `customer_id`: Lemon Squeezy 고객 ID

**실행 방법**:
1. Supabase Dashboard 접속
2. 좌측 메뉴에서 "SQL Editor" 클릭
3. 위 SQL 복사 & 붙여넣기
4. "Run" 버튼 클릭

---

### 2단계: Lemon Squeezy에서 상품 생성

1. **Lemon Squeezy 로그인**
   - https://app.lemonsqueezy.com 접속

2. **첫 번째 상품 만들기: "10 크레딧 팩"**
   - Products > "New Product" 클릭
   - 이름: `10 Credits Pack`
   - 가격: `$3.00` (또는 ₩4,000)
   - 타입: **One-time payment** (일회성 결제)
   - 저장 후 "Variants" 탭에서 **Variant ID** 복사 (나중에 사용)

3. **두 번째 상품 만들기: "헌터 플랜"**
   - Products > "New Product" 클릭
   - 이름: `Hunter Plan`
   - 가격: `$12.00/month` (또는 ₩19,900)
   - 타입: **Subscription** (구독)
   - 저장 후 "Variants" 탭에서 **Variant ID** 복사

4. **Checkout URL 복사하기**
   - 각 상품 페이지에서 "Checkout" 탭 클릭
   - "Checkout URL" 복사 (예: `https://your-store.lemonsqueezy.com/checkout/buy/abc123`)

---

### 3단계: 환경변수 설정

`.env.local` 파일을 열고 다음 값들을 **실제 값으로** 교체하세요:

```bash
# ============================================
# Lemon Squeezy 결제 설정
# ============================================

# 체크아웃 링크 (2단계에서 복사한 URL)
NEXT_PUBLIC_LEMON_LINK_CREDITS=https://vintage.lemonsqueezy.com/checkout/buy/075e2d23-b7e0-4494-989c-6712c8c58d40
NEXT_PUBLIC_LEMON_LINK_HUNTER=https://vintage.lemonsqueezy.com/checkout/buy/118c4450-b334-4ad4-a9e5-fb617b733646

# 웹훅 보안 키 (4단계에서 복사)
LEMON_WEBHOOK_SECRET=vintage-sniper-secret-2026

# 상품 Variant ID (2단계에서 복사)
LEMON_VARIANT_ID_CREDITS=818717
LEMON_VARIANT_ID_HUNTER=818719

# Supabase Service Role Key (아래 참고)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Supabase Service Role Key 찾는 법**:
1. Supabase Dashboard 접속
2. Settings > API 클릭
3. "Project API keys" 섹션에서 **"service_role"** 키 복사
4. ⚠️ **주의**: 이 키는 절대 클라이언트 코드에 노출하면 안 됩니다!

---

### 4단계: 웹훅(Webhook) 설정

웹훅은 결제가 완료되면 우리 서버에 자동으로 알림을 보내는 시스템입니다.

1. **Lemon Squeezy 웹훅 페이지 접속**
   - https://app.lemonsqueezy.com/settings/webhooks

2. **새 웹훅 생성**
   - "Create webhook" 버튼 클릭
   - **Callback URL** 입력:
     ```
     https://your-domain.com/api/webhooks/lemon
     ```
     (로컬 테스트 시에는 ngrok URL 사용)

3. **이벤트 선택**
   다음 4개 이벤트를 체크하세요:
   - ✅ `order_created` (일회성 구매 완료 시)
   - ✅ `subscription_created` (구독 시작 시)
   - ✅ `subscription_cancelled` (구독 취소 시)
   - ✅ `subscription_updated` (구독 상태 변경 시)

4. **Signing Secret 복사**
   - 웹훅 생성 후 표시되는 "Signing secret" 복사
   - `.env.local`의 `LEMON_WEBHOOK_SECRET`에 붙여넣기

---

### 5단계: 테스트 구매하기

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **Pricing 페이지 접속**
   ```
   http://localhost:3000/pricing
   ```

3. **로그인 확인**
   - 반드시 로그인된 상태여야 합니다
   - 로그인 안 되어 있으면 자동으로 로그인 페이지로 이동

4. **테스트 구매**
   - "Sniper" 카드에서 "Quick Boost" 클릭
   - Lemon Squeezy 테스트 모드로 결제 진행
   - 테스트 카드 번호: `4242 4242 4242 4242`

5. **결과 확인**
   - 터미널 로그 확인:
     ```
     [Webhook] Received event: order_created
     [Webhook] Credits pack purchased, adding 10 credits
     [Webhook] Credits updated: { userId: '...', newCredits: 13 }
     ```
   - Supabase 대시보드에서 `profiles` 테이블 확인

---

## 🔄 작동 원리

### 전체 플로우

```
사용자가 "구매" 클릭
    ↓
Lemon Squeezy 체크아웃 페이지로 이동
(URL에 user_id가 포함됨)
    ↓
사용자가 결제 완료
    ↓
Lemon Squeezy가 우리 서버에 웹훅 전송
    ↓
/api/webhooks/lemon이 웹훅 수신
    ↓
서명(Signature) 검증
    ↓
Supabase profiles 테이블 업데이트:
  - 크레딧 팩: credits +10
  - 헌터 플랜: is_hunter = true
```

### 핵심: User ID 전달

체크아웃 URL에 사용자 ID를 붙여서 보냅니다:

```typescript
// src/app/pricing/page.tsx
const checkoutUrl = `${baseUrl}?checkout[custom][user_id]=${user.id}`;
```

이렇게 하면 웹훅에서 "누가" 결제했는지 알 수 있습니다.

---

## 🎯 주요 기능 설명

### 1. Pricing 페이지 (`/pricing`)

**3단 카드 구조**:
- **Starter (무료)**: 3개 무료 크레딧, 기본 기능
- **Sniper (₩4,000)**: 10개 크레딧 일회성 구매
- **Hunter (₩19,900/월)**: 무제한 스캔, 프리미엄 기능

**동작**:
1. 로그인 상태 확인
2. "구매" 버튼 클릭 시 user_id를 URL에 추가
3. Lemon Squeezy 체크아웃으로 리다이렉트

### 2. 웹훅 핸들러 (`/api/webhooks/lemon`)

**처리하는 이벤트**:

| 이벤트 이름 | 발생 시점 | 수행 작업 |
|------------|---------|----------|
| `order_created` | 일회성 구매 완료 | 크레딧 +10 추가 |
| `subscription_created` | 구독 시작 | `is_hunter = true` |
| `subscription_cancelled` | 구독 취소 | `is_hunter = false` |
| `subscription_updated` | 구독 갱신/상태 변경 | 상태 동기화 |

**보안 검증**:
```typescript
// HMAC SHA256 서명 검증
const hmac = crypto.createHmac('sha256', secret);
const digest = hmac.update(rawBody).digest('hex');

// 서명이 일치하지 않으면 401 에러 반환
if (signature !== digest) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### 3. 데이터베이스 업데이트

**크레딧 추가 예시**:
```typescript
// 현재 크레딧 조회
const currentCredits = profile?.credits || 0;

// 10개 추가
await supabase
  .from('profiles')
  .update({ credits: currentCredits + 10 })
  .eq('id', userId);
```

**헌터 구독 활성화 예시**:
```typescript
await supabase
  .from('profiles')
  .update({
    is_hunter: true,
    subscription_id: subscriptionId,
    customer_id: customerId
  })
  .eq('id', userId);
```

---

## 🧪 로컬 테스트 방법

### ngrok으로 로컬 웹훅 테스트

로컬 환경에서는 외부에서 접근할 수 없으므로 ngrok을 사용합니다.

1. **ngrok 설치**
   ```bash
   # Mac (Homebrew)
   brew install ngrok

   # 또는 https://ngrok.com/download 에서 다운로드
   ```

2. **ngrok 실행**
   ```bash
   # 터미널 1: Next.js 개발 서버
   npm run dev

   # 터미널 2: ngrok 터널 생성
   ngrok http 3000
   ```

3. **ngrok URL 복사**
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:3000
   ```

4. **Lemon Squeezy 웹훅 URL 업데이트**
   - Settings > Webhooks에서 기존 웹훅 수정
   - Callback URL: `https://abc123.ngrok.io/api/webhooks/lemon`

5. **테스트 구매 진행**
   - Pricing 페이지에서 구매 클릭
   - Lemon Squeezy Test Mode로 결제

6. **로그 확인**
   ```bash
   # 터미널 1 (Next.js)
   [Webhook] Received event: order_created
   [Webhook] Order Created: { userId: '...', variantId: '...' }
   [Webhook] Credits pack purchased, adding 10 credits
   [Webhook] Credits updated: { userId: '...', newCredits: 13 }
   ```

---

## 🔐 보안 주의사항

### 1. Service Role Key 보호

```bash
# ❌ 절대 클라이언트 코드에서 사용 금지
const supabase = createClient(url, serviceRoleKey); // 브라우저에서 실행 시 위험!

# ✅ 서버 사이드에서만 사용
// src/app/api/webhooks/lemon/route.ts (서버 전용)
const supabase = createClient(url, serviceRoleKey);
```

### 2. 웹훅 서명 검증

웹훅 핸들러는 반드시 서명을 검증해야 합니다:

```typescript
// 서명 검증 없으면 누구나 웹훅을 보내서 크레딧을 추가할 수 있음!
if (!verifySignature(rawBody, signature)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### 3. 환경변수 관리

```bash
# .env.local (로컬 개발용)
LEMON_WEBHOOK_SECRET=local_secret

# Vercel/Production (배포 환경)
# Settings > Environment Variables에서 설정
LEMON_WEBHOOK_SECRET=production_secret
```

---

## 🐛 문제 해결 (Troubleshooting)

### 문제: "Payment configuration error" 에러

**원인**: 환경변수가 설정되지 않음

**해결**:
```bash
# .env.local 확인
NEXT_PUBLIC_LEMON_LINK_CREDITS=https://... # ⚠️ 실제 URL로 교체했는지 확인
NEXT_PUBLIC_LEMON_LINK_HUNTER=https://...  # ⚠️ 실제 URL로 교체했는지 확인
```

서버 재시작:
```bash
# 터미널에서 Ctrl+C 누르고
npm run dev
```

---

### 문제: 웹훅이 401 Invalid Signature 에러

**원인**: 웹훅 시크릿 키가 일치하지 않음

**해결**:
1. Lemon Squeezy > Settings > Webhooks
2. 웹훅 클릭 > "Signing secret" 다시 복사
3. `.env.local`의 `LEMON_WEBHOOK_SECRET`에 붙여넣기
4. 서버 재시작

**확인 방법**:
```typescript
// src/app/api/webhooks/lemon/route.ts
console.log('Expected secret:', process.env.LEMON_WEBHOOK_SECRET);
console.log('Received signature:', signature);
```

---

### 문제: 결제 후 크레딧이 추가되지 않음

**원인 1**: Variant ID가 일치하지 않음

**해결**:
```bash
# .env.local 확인
LEMON_VARIANT_ID_CREDITS=123456  # ⚠️ 실제 Variant ID인지 확인
```

Lemon Squeezy에서 Variant ID 다시 확인:
1. Products > 상품 클릭
2. Variants 탭
3. ID 복사 (예: `123456`)

**원인 2**: user_id가 전달되지 않음

**확인**:
```typescript
// src/app/pricing/page.tsx
console.log('Checkout URL:', checkoutUrl);
// 출력: https://...?checkout[custom][user_id]=abc-123-def
//                                    ↑ user_id가 포함되어야 함
```

**원인 3**: 웹훅이 실행되지 않음

Lemon Squeezy에서 웹훅 로그 확인:
1. Settings > Webhooks
2. 웹훅 클릭 > "Logs" 탭
3. 에러 메시지 확인

---

### 문제: 데이터베이스 업데이트 실패

**원인**: Service Role Key가 없거나 잘못됨

**해결**:
1. Supabase Dashboard > Settings > API
2. "service_role" 키 다시 복사 (anon 키가 아님!)
3. `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY`에 붙여넣기

**확인**:
```bash
# 웹훅 터미널 로그
[Webhook] Failed to update credits: { error: 'permission denied' }
# → Service Role Key가 잘못됨
```

---

## 📊 데이터베이스 스키마

마이그레이션 후 `profiles` 테이블 구조:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,

  -- 결제 관련 컬럼 (NEW)
  credits INTEGER DEFAULT 3,              -- 스캔 크레딧 개수
  is_hunter BOOLEAN DEFAULT false,        -- 헌터 구독 활성화 여부
  subscription_id TEXT,                   -- Lemon Squeezy 구독 ID
  customer_id TEXT,                       -- Lemon Squeezy 고객 ID

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (빠른 검색용)
CREATE INDEX idx_profiles_subscription_id ON profiles(subscription_id);
CREATE INDEX idx_profiles_customer_id ON profiles(customer_id);
```

**컬럼 설명**:
- `credits`: 사용자가 보유한 스캔 크레딧 (1회 스캔 = 1 크레딧 소모)
- `is_hunter`: 헌터 플랜 구독 중이면 `true` (무제한 스캔 가능)
- `subscription_id`: 구독 취소 시 어떤 구독인지 식별하기 위해 저장
- `customer_id`: 추후 환불, 고객 문의 등에 활용

---

## ✅ 배포 전 최종 체크리스트

### Lemon Squeezy 설정

- [ ] **상품 2개 생성 완료**
  - [ ] "10 Credits Pack" ($3, one-time)
  - [ ] "Hunter Plan" ($12/month, subscription)

- [ ] **Checkout URL 복사 완료**
  - [ ] `.env.local`의 `NEXT_PUBLIC_LEMON_LINK_CREDITS` 설정
  - [ ] `.env.local`의 `NEXT_PUBLIC_LEMON_LINK_HUNTER` 설정

- [ ] **Variant ID 복사 완료**
  - [ ] `.env.local`의 `LEMON_VARIANT_ID_CREDITS` 설정
  - [ ] `.env.local`의 `LEMON_VARIANT_ID_HUNTER` 설정

- [ ] **웹훅 생성 완료**
  - [ ] URL: `https://your-domain.com/api/webhooks/lemon`
  - [ ] 이벤트 4개 선택됨 (order_created, subscription_created, cancelled, updated)
  - [ ] Signing Secret 복사 → `LEMON_WEBHOOK_SECRET` 설정

### Supabase 설정

- [ ] **SQL 마이그레이션 실행 완료**
  - [ ] `profiles` 테이블에 컬럼 4개 추가 확인

- [ ] **Service Role Key 설정 완료**
  - [ ] `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY` 설정

### 테스트

- [ ] **로컬 테스트 완료**
  - [ ] ngrok으로 웹훅 테스트 성공
  - [ ] 크레딧 구매 후 DB 업데이트 확인
  - [ ] 구독 후 `is_hunter = true` 확인

- [ ] **프로덕션 테스트 완료**
  - [ ] 실제 결제 (소액) 테스트
  - [ ] 웹훅 로그 확인
  - [ ] DB 업데이트 확인

---

## 🎉 완료!

이제 Vintage Sniper 앱에서 결제를 받을 수 있습니다!

**다음 단계**:
1. 사용자가 `/pricing` 페이지에서 상품 선택
2. Lemon Squeezy 체크아웃으로 이동
3. 결제 완료
4. 웹훅이 자동으로 크레딧/구독 활성화
5. 사용자가 바로 서비스 이용 가능

**추가 자료**:
- Lemon Squeezy 공식 문서: https://docs.lemonsqueezy.com
- 웹훅 로그 확인: Lemon Squeezy Dashboard > Settings > Webhooks > Logs
- Supabase 테이블 확인: Supabase Dashboard > Table Editor > profiles

**문제가 있으면**:
1. 위 "문제 해결" 섹션 확인
2. 터미널 로그 확인
3. Lemon Squeezy 웹훅 로그 확인
4. GitHub Issues에 질문 남기기

---

**만든 사람**: Claude Code
**버전**: 1.0.0
**마지막 업데이트**: 2026-02-09
