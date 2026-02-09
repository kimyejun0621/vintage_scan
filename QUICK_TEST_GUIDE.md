# 🚀 실시간 마켓 가격 연동 빠른 테스트 가이드

## 빠른 시작 (5분)

### 1. 데이터베이스 설정 (1분)

Supabase 대시보드 열기:
```
https://supabase.com/dashboard/project/YOUR_PROJECT/sql
```

다음 SQL 실행:
```sql
-- 파일: /supabase/migrations/add_price_cache.sql 내용 복사 붙여넣기
CREATE TABLE IF NOT EXISTS price_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  brand TEXT NOT NULL,
  price_data JSONB NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('ebay', 'grailed', 'ai', 'exchange_rate')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  listing_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(search_query, source)
);

CREATE INDEX idx_price_cache_search ON price_cache(search_query, brand);
CREATE INDEX idx_price_cache_expires ON price_cache(expires_at);
CREATE INDEX idx_price_cache_source ON price_cache(source);
```

### 2. API 키 설정 (2분)

#### Option A: 전체 기능 테스트 (eBay + 환율)

1. **eBay API 키 발급** (https://developer.ebay.com/)
   - 개발자 계정 생성
   - "My Account" → "Application Keys"
   - Sandbox App 생성
   - App ID 복사

2. **Exchange Rate API 키 발급** (https://www.exchangerate-api.com/)
   - 무료 계정 생성
   - API 키 복사

3. `.env.local`에 추가:
```env
EBAY_APP_ID=your_app_id
EXCHANGE_RATE_API_KEY=your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Option B: 최소 기능 테스트 (API 없이)

API 키 없이도 fallback으로 동작합니다:
- eBay 실패 → Grailed + AI 추정가
- Grailed 실패 → eBay + AI 추정가
- 모두 실패 → AI 추정가만 표시 (신뢰도 30%)

### 3. 서버 실행 (1분)

```bash
npm install
npm run dev
```

서버가 시작되면: http://localhost:3000

### 4. 테스트 (1분)

#### A. UI에서 테스트

1. 앱 홈페이지로 이동
2. Levi's 브랜드 선택
3. 빈티지 Levi's 501 이미지 업로드
4. AI 분석 완료 대기
5. 결과 페이지에서:
   - AI 추정가 즉시 표시 확인
   - "실시간 시장 가격 조회 중..." 메시지 확인
   - eBay/Grailed 가격 로딩 확인
   - 통합 시세 표시 확인

#### B. API 직접 테스트

**1. 환율 API 테스트**
```bash
curl http://localhost:3000/api/pricing/exchange-rate
```

예상 응답:
```json
{
  "USD_KRW": 1334,
  "updatedAt": "2026-02-09T...",
  "cached": false
}
```

**2. 시장 가격 API 테스트**
```bash
curl -X POST http://localhost:3000/api/pricing/market \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Levis 501 Jeans",
    "brand": "levis",
    "era": "1980s",
    "ai_estimate": 150000
  }'
```

예상 응답:
```json
{
  "sources": [
    {
      "source": "ai",
      "priceKRW": 150000,
      "confidence": 70
    }
  ],
  "aggregated": {
    "estimatedPrice": 150000,
    "confidence": 30,
    "currency": "KRW"
  },
  "error": "Market data temporarily unavailable, using AI estimate only"
}
```

## 🔍 예상 결과별 해석

### ✅ 성공 케이스

#### 1. API 키 설정됨 (eBay + Grailed)
```json
{
  "sources": [
    { "source": "ebay", "confidence": 85, "listingCount": 32 },
    { "source": "grailed", "confidence": 75, "listingCount": 18 },
    { "source": "ai", "confidence": 70 }
  ],
  "aggregated": {
    "estimatedPrice": 146500,
    "confidence": 87
  }
}
```
→ **최고의 결과**: 3개 소스 모두 성공, 높은 신뢰도

#### 2. eBay만 설정됨
```json
{
  "sources": [
    { "source": "ebay", "confidence": 85 },
    { "source": "ai", "confidence": 70 }
  ],
  "aggregated": {
    "estimatedPrice": 148000,
    "confidence": 82
  }
}
```
→ **좋은 결과**: eBay + AI로 충분히 정확

#### 3. API 키 없음
```json
{
  "sources": [
    { "source": "ai", "confidence": 70 }
  ],
  "aggregated": {
    "estimatedPrice": 150000,
    "confidence": 30
  },
  "error": "Market data temporarily unavailable, using AI estimate only"
}
```
→ **Fallback 동작**: AI만 사용하지만 앱은 정상 동작

### ❌ 에러 케이스

#### 1. 데이터베이스 마이그레이션 안 됨
```
Error: relation "price_cache" does not exist
```
→ **해결**: Supabase SQL 편집기에서 마이그레이션 실행

#### 2. 환경 변수 없음
```json
{
  "error": "Market data temporarily unavailable",
  "aggregated": {
    "estimatedPrice": 150000,
    "confidence": 30
  }
}
```
→ **해결**: `.env.local`에 API 키 추가 (또는 fallback으로 계속 사용 가능)

#### 3. Supabase 연결 실패
```
Error: Failed to connect to Supabase
```
→ **해결**: `.env.local`에서 Supabase URL/키 확인

## 📊 콘솔 로그 확인

정상 동작 시 다음과 같은 로그가 표시됩니다:

```
[pricing] Market price request received
[exchange-rate] Fetched exchange rate: 1334
[cache] Cache miss: levis_501_1980s from ebay
[ebay] Fetching eBay prices for: Levis 501 1980s
[ebay] eBay API returned 32 items
[ebay] eBay prices fetched successfully
[grailed] Fetching Grailed prices for: Levis 501 1980s
[grailed] Grailed API returned 18 listings
[aggregator] Aggregating prices from sources
[market] Market price aggregation complete
```

에러 시:
```
[ebay] eBay API credentials not configured
[grailed] Failed to fetch Grailed prices
[market] No price sources available
```

## 🐛 트러블슈팅 체크리스트

### 1. 데이터베이스
- [ ] `price_cache` 테이블이 생성되었는가?
  ```sql
  SELECT * FROM price_cache LIMIT 1;
  ```

### 2. 환경 변수
- [ ] `.env.local` 파일이 존재하는가?
- [ ] `NEXT_PUBLIC_SUPABASE_URL`이 설정되었는가?
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`이 설정되었는가?

### 3. 서버
- [ ] `npm run dev`가 에러 없이 실행되는가?
- [ ] http://localhost:3000 접속이 되는가?

### 4. API
- [ ] `/api/pricing/exchange-rate`가 200 응답을 반환하는가?
- [ ] `/api/pricing/market`가 응답을 반환하는가? (에러 포함)

## 📝 빠른 디버깅

### 캐시 초기화
```sql
-- Supabase SQL 편집기
TRUNCATE TABLE price_cache;
```

### 로그 확인
```bash
# 터미널에서 서버 실행 로그 확인
npm run dev

# 브라우저 콘솔에서 에러 확인
F12 → Console
```

### API 응답 확인
```bash
# 환율 API
curl http://localhost:3000/api/pricing/exchange-rate

# 시장 가격 API
curl -X POST http://localhost:3000/api/pricing/market \
  -H "Content-Type: application/json" \
  -d '{"product_name":"Levis 501","brand":"levis","ai_estimate":150000}'
```

## ✅ 성공 기준

다음을 확인하면 구현이 완료된 것입니다:

1. [ ] 데이터베이스 마이그레이션 성공
2. [ ] 서버 실행 성공 (`npm run dev`)
3. [ ] `/api/pricing/exchange-rate` 응답 성공
4. [ ] `/api/pricing/market` 응답 성공 (AI 추정가 포함)
5. [ ] 결과 페이지에서 가격 정보 표시 확인
6. [ ] 로딩 상태 표시 확인
7. [ ] 에러 메시지 표시 확인 (API 실패 시)

## 🎯 다음 단계

기본 동작 확인 후:

1. **eBay API 키 설정** → 실제 시장 데이터 조회
2. **Exchange Rate API 키 설정** → 실시간 환율 사용
3. **Production 배포** → 환경 변수 설정

상세한 설정은 `MARKET_PRICING_SETUP.md` 참고하세요.
