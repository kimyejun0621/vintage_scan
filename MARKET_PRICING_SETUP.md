# 실시간 마켓 가격 연동 설정 가이드

## 개요

이 가이드는 Vintage Scan 앱에 eBay 및 Grailed의 실시간 시장 가격 데이터를 연동하는 방법을 설명합니다.

## 구현 완료 항목

✅ 타입 정의 및 설정 파일
✅ 데이터베이스 마이그레이션 (캐시 테이블)
✅ eBay API 통합
✅ Grailed API 통합 (with retry logic)
✅ 가격 집계 로직 (가중 평균)
✅ 캐싱 레이어 (Supabase)
✅ API 엔드포인트 (`/api/pricing/market`, `/api/pricing/exchange-rate`)
✅ 프론트엔드 통합 (비동기 로딩)
✅ 로깅 시스템

## 설정 단계

### 1. 데이터베이스 마이그레이션 실행

Supabase 대시보드에서 SQL 편집기를 열고 다음 파일을 실행하세요:

```bash
# 파일 위치
/supabase/migrations/add_price_cache.sql
```

또는 Supabase CLI 사용:

```bash
supabase db push
```

### 2. eBay API 키 발급

1. [eBay Developer Program](https://developer.ebay.com/)에 가입
2. "My Account" → "Application Keys"로 이동
3. 새 앱 생성 (Sandbox 또는 Production)
4. 다음 키를 복사:
   - App ID (Client ID)
   - Cert ID (Client Secret)
   - Dev ID

**OAuth 토큰 발급:**

```bash
# eBay OAuth 토큰 생성 (Production 환경)
curl -X POST 'https://api.ebay.com/identity/v1/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Authorization: Basic BASE64(APP_ID:CERT_ID)' \
  -d 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
```

5. `.env.local`에 추가:

```env
EBAY_APP_ID=your_app_id_here
EBAY_CERT_ID=your_cert_id_here
EBAY_DEV_ID=your_dev_id_here
EBAY_OAUTH_TOKEN=your_oauth_token_here
```

### 3. Exchange Rate API 키 발급

1. [ExchangeRate-API](https://www.exchangerate-api.com/)에 가입
2. Free Plan 선택 (월 1,500 요청 무료)
3. API 키 복사
4. `.env.local`에 추가:

```env
EXCHANGE_RATE_API_KEY=your_api_key_here
```

### 4. 환경 변수 확인

`.env.local` 파일에 다음이 설정되어 있는지 확인:

```env
# Supabase (이미 설정되어 있음)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# eBay
EBAY_APP_ID=...
EBAY_CERT_ID=...
EBAY_DEV_ID=...
EBAY_OAUTH_TOKEN=...

# Exchange Rate
EXCHANGE_RATE_API_KEY=...

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cache (선택)
PRICE_CACHE_TTL_HOURS=24
```

### 5. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

## 사용 방법

1. 빈티지 의류 이미지를 업로드하고 AI 분석 실행
2. 결과 페이지로 이동
3. AI 분석 결과가 즉시 표시됨
4. "실시간 시장 가격 조회 중..." 메시지가 표시되며 백그라운드에서 eBay/Grailed 가격 조회
5. 가격 조회 완료 후 다음 정보가 표시됨:
   - AI 추정가
   - eBay 평균 시세 (판매 완료 기준)
   - Grailed 평균 시세
   - 통합 예상 시세 (가중 평균)
   - 각 소스별 신뢰도
   - 샘플 리스팅 링크

## API 사용량 제한

### eBay Finding API
- **무료 티어**: 5,000 calls/day
- **제한 대응**: 24시간 캐싱으로 중복 요청 방지
- **타임아웃**: 10초

### Grailed
- **공식 API 없음**: 웹 스크래핑/GraphQL 사용
- **Rate Limit 대응**: Exponential backoff retry (2s, 4s, 8s)
- **타임아웃**: 15초

### ExchangeRate-API
- **무료 티어**: 1,500 calls/month
- **캐싱**: 6시간
- **Fallback**: 1,334 KRW (하드코딩)

## 테스트

### 1. API 엔드포인트 테스트

```bash
# Exchange rate 조회
curl http://localhost:3000/api/pricing/exchange-rate

# Market pricing 조회
curl -X POST http://localhost:3000/api/pricing/market \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Levi'\''s 501 Jeans",
    "brand": "levis",
    "era": "1980s",
    "ai_estimate": 150000
  }'
```

### 2. E2E 테스트

1. Levi's 501 이미지 업로드
2. AI 분석 완료 확인
3. 결과 페이지에서 가격 로딩 확인
4. eBay/Grailed 가격 표시 확인
5. 통합 시세 및 신뢰도 확인

### 3. 캐시 테스트

```bash
# 동일한 제품 두 번 조회 시 두 번째는 캐시에서 빠르게 반환
# 로그에서 "Cache hit" 확인
```

## 트러블슈팅

### eBay API 에러

**증상**: "eBay API credentials not configured"

**해결**:
- `.env.local`에 `EBAY_APP_ID`가 설정되어 있는지 확인
- 서버 재시작: `npm run dev`

**증상**: "eBay API error: 403"

**해결**:
- OAuth 토큰이 만료되었을 수 있음
- 새 토큰 발급 (위 OAuth 토큰 발급 참고)

### Grailed API 에러

**증상**: "Grailed rate limit exceeded"

**해결**:
- 자동으로 exponential backoff 재시도
- 계속 실패 시 eBay + AI 추정가만 사용

**증상**: "No listings found on Grailed"

**해결**:
- Grailed 웹사이트 구조가 변경되었을 수 있음
- `/src/lib/services/pricing/grailed.ts` 파일의 API 엔드포인트 및 파싱 로직 확인

### 데이터베이스 에러

**증상**: "relation "price_cache" does not exist"

**해결**:
- 마이그레이션이 실행되지 않음
- Supabase SQL 편집기에서 `add_price_cache.sql` 실행

### 캐시 이슈

**증상**: 오래된 가격 데이터 표시

**해결**:
```sql
-- Supabase SQL 편집기에서 실행
DELETE FROM price_cache WHERE expires_at < NOW();
```

또는 전체 캐시 초기화:
```sql
TRUNCATE TABLE price_cache;
```

## 모니터링

### 로그 확인

개발 환경에서 콘솔 로그 확인:

```bash
npm run dev
```

로그 예시:
```
[pricing] Market price request received
[ebay] Fetching eBay prices for: Levi's 501 1980s
[ebay] eBay API returned 32 items
[grailed] Fetching Grailed prices for: Levi's 501 1980s
[cache] Cache miss: levis_501_1980s from ebay
[aggregator] Aggregating prices from sources
[market] Market price aggregation complete
```

### 캐시 통계 확인

```sql
-- Supabase SQL 편집기에서 실행
SELECT source, COUNT(*),
       MIN(created_at) as oldest,
       MAX(created_at) as newest
FROM price_cache
WHERE expires_at > NOW()
GROUP BY source;
```

## 향후 개선 사항

1. **더 많은 마켓플레이스**: StockX, Depop, Vinted 추가
2. **가격 히스토리**: 시간에 따른 가격 변동 추적
3. **사용자 알림**: 관심 제품 가격 변동 알림
4. **ML 기반 예측**: 과거 데이터로 미래 가격 예측
5. **Admin 대시보드**: 캐시 관리, API 사용량 모니터링

## 파일 구조

```
src/
├── lib/services/pricing/
│   ├── types.ts              # 타입 정의
│   ├── ebay.ts               # eBay API 통합
│   ├── grailed.ts            # Grailed API 통합
│   ├── aggregator.ts         # 가격 집계 로직
│   ├── cache.ts              # 캐싱 레이어
│   └── logger.ts             # 로깅 시스템
├── app/api/pricing/
│   ├── market/route.ts       # 시장 가격 API
│   └── exchange-rate/route.ts # 환율 API
├── components/results/
│   ├── PriceArbitrage.tsx    # 가격 표시 컴포넌트
│   └── PriceLoading.tsx      # 로딩 컴포넌트
├── config/
│   └── pricing.ts            # 설정
└── types/
    └── analysis.ts           # 분석 타입 (확장)

supabase/
└── migrations/
    └── add_price_cache.sql   # DB 마이그레이션
```

## 지원

문제가 발생하면 다음을 확인하세요:

1. 환경 변수가 올바르게 설정되었는지
2. 데이터베이스 마이그레이션이 실행되었는지
3. API 키가 유효한지 (eBay, ExchangeRate)
4. 서버 콘솔 로그에 에러가 있는지

추가 질문이나 버그 리포트는 GitHub Issues에 등록해주세요.
