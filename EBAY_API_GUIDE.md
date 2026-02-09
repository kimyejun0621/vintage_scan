# eBay API 설정 가이드

eBay API를 사용하면 실시간으로 실제 판매 완료된 아이템의 가격 데이터를 가져올 수 있습니다.

## 왜 eBay API를 사용하나요?

### 스크래핑 대신 API 사용의 장점
- ✅ **합법적**: eBay 공식 API 사용
- ✅ **안정적**: HTML 구조 변경에 영향 없음
- ✅ **빠름**: 직접 데이터 제공
- ✅ **정확함**: 구조화된 JSON 데이터
- ✅ **제한 없음**: 일일 5,000회 무료 호출

### 스크래핑의 단점
- ⚠️ 법적 그레이존
- ⚠️ 차단 위험
- ⚠️ 느린 속도 (브라우저 실행)
- ⚠️ HTML 변경 시 동작 중단

## 1단계: eBay 개발자 계정 생성

### 1.1 계정 등록

1. **eBay Developers Program 가입**
   - https://developer.ebay.com/signin 접속
   - "Create an eBay account" 클릭
   - 이메일, 비밀번호 입력하여 계정 생성

2. **개발자 프로그램 가입**
   - 로그인 후 "Get Started" 클릭
   - 약관 동의 및 정보 입력

## 2단계: API 키 발급

### 2.1 Application Key 생성

1. **키 발급 페이지 접속**
   - https://developer.ebay.com/my/keys 접속
   - 또는 Dashboard > My Account > Application Keys

2. **Sandbox vs Production**
   - **Sandbox Keys**: 테스트용 (가짜 데이터)
   - **Production Keys**: 실제 운영용 (실제 데이터) ← 이것 사용

3. **Production Key 생성**
   - "Create a keyset" 클릭
   - Application Title: `Vintage Scan` (원하는 이름)
   - "I want to use the following APIs": **Finding API** 선택 ✅

4. **App ID 복사**
   - 생성된 키셋에서 **App ID (Client ID)** 복사
   - 예: `YourName-VintageS-PRD-abc123def456-ghijklmn`

### 2.2 API 호출 확인

생성된 키로 테스트:

```bash
# 브라우저에서 접속 (YOUR_APP_ID를 실제 값으로 교체)
https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=YOUR_APP_ID&RESPONSE-DATA-FORMAT=JSON&keywords=vintage+levis+501&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true
```

응답이 나오면 성공!

## 3단계: 프로젝트에 API 키 추가

### 3.1 환경 변수 설정

`.env.local` 파일에 추가:

```env
# eBay API Configuration
EBAY_APP_ID=YourName-VintageS-PRD-abc123def456-ghijklmn
```

### 3.2 Vercel에도 추가

Vercel 배포 시:
1. Vercel Dashboard > Project > Settings > Environment Variables
2. `EBAY_APP_ID` 추가

## 4단계: API 테스트

### 4.1 로컬에서 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 접속
http://localhost:3000
```

### 4.2 이미지 분석 시 가격 확인

1. 빈티지 이미지 업로드
2. 결과 페이지에서 "시장 가격" 섹션 확인
3. **eBay** 데이터가 표시되면 성공!

```
📊 시장 가격 분석

eBay (최근 판매가)
  평균: $95
  범위: $65 - $145
  데이터: 48개
  신뢰도: 85%

Grailed
  평균: $88
  ...
```

## 5단계: 동작 확인

### 5.1 API 로그 확인

터미널에서 로그 확인:

```
[Pricing] Market price request received
[eBay] Fetching eBay prices for: levis 501 vintage
[eBay] eBay API returned 48 items
[eBay] eBay prices fetched successfully
  avgPrice: 95.5
  minPrice: 65
  maxPrice: 145
  listingCount: 48
  confidence: 85
```

### 5.2 에러 발생 시

#### "eBay API credentials not configured"
- `.env.local`에 `EBAY_APP_ID`가 없거나 오타
- 서버 재시작 필요: `npm run dev`

#### "eBay API error: 401"
- App ID가 잘못됨
- Production Key가 아닌 Sandbox Key 사용

#### "No completed items found on eBay"
- 검색어와 일치하는 판매 완료 아이템 없음
- 정상 동작 (검색어에 따라 발생 가능)

## 6단계: API 사용량 확인

### 6.1 사용량 모니터링

1. **eBay Developer Dashboard 접속**
   - https://developer.ebay.com/my/keys

2. **Application Usage 확인**
   - 일일 호출 횟수 확인
   - 무료 플랜: **5,000 calls/day**

### 6.2 사용량 최적화

프로젝트에서는 캐싱을 사용해 API 호출 최소화:

```typescript
// src/config/pricing.ts
export const PRICING_CONFIG = {
  cache: {
    ttl: 24 * 60 * 60 // 24시간 캐싱
  }
}
```

같은 제품은 24시간 동안 캐시된 데이터 사용 → API 호출 절약

## 7단계: 프로덕션 배포

### 7.1 Vercel에 환경 변수 추가

```bash
vercel env add EBAY_APP_ID production
# 프롬프트에서 실제 App ID 입력
```

또는 Vercel Dashboard에서:
1. Settings > Environment Variables
2. Key: `EBAY_APP_ID`
3. Value: 실제 App ID
4. Environment: Production, Preview, Development 모두 체크

### 7.2 재배포

```bash
git add .env.example
git commit -m "Add eBay API support"
git push origin main
```

Vercel이 자동으로 재배포합니다.

## API 비활성화

eBay API를 사용하지 않으려면:

```typescript
// src/config/pricing.ts
export const PRICING_CONFIG = {
  ebay: {
    enabled: false,  // true → false로 변경
    ...
  }
}
```

이 경우:
- AI 추정 가격만 사용
- 또는 Grailed 데이터만 사용

## 비용

### 무료 플랜
- ✅ 일일 5,000 호출
- ✅ Finding API 포함
- ✅ 개인/소규모 프로젝트에 충분

### 예상 사용량

```
1명 사용자 = 1회 분석 시 1 API 호출
캐싱 24시간 = 같은 제품은 하루 1회만 호출

예상:
- 하루 100명 사용 = 100 API 호출 (캐싱 효과)
- 월 3,000명 사용 = 3,000 API 호출
→ 무료 플랜으로 충분!
```

5,000 호출 초과 시:
- API 호출 실패 (하루 지나면 리셋)
- AI 추정으로 폴백

## 문제 해결

### 1. "EBAY_APP_ID is not defined"

**원인**: 환경 변수 미설정

**해결**:
```bash
# .env.local 파일 확인
cat .env.local | grep EBAY_APP_ID

# 없으면 추가
echo "EBAY_APP_ID=your-app-id" >> .env.local

# 서버 재시작
npm run dev
```

### 2. "Request Quota Exceeded"

**원인**: 일일 5,000 호출 초과

**해결**:
- 내일까지 대기 (자정 리셋)
- 캐싱 시간 늘리기 (24시간 → 48시간)
- 임시로 API 비활성화

### 3. "Invalid keywords"

**원인**: 검색어에 특수문자 포함

**해결**:
- 자동으로 처리됨 (`buildSearchKeywords` 함수)
- 수동 확인: 로그에서 검색어 확인

### 4. "Empty response"

**원인**: 해당 제품의 판매 완료 데이터 없음

**해결**:
- 정상 동작 (모든 제품이 eBay에서 팔린 건 아님)
- AI 추정 또는 Grailed 데이터로 폴백

## 추가 정보

### eBay Finding API 문서
- https://developer.ebay.com/DevZone/finding/Concepts/FindingAPIGuide.html

### API 호출 예시

```javascript
// 실제 API 호출 (src/lib/services/pricing/ebay.ts)
const params = {
  'OPERATION-NAME': 'findCompletedItems',
  'SECURITY-APPNAME': process.env.EBAY_APP_ID,
  'keywords': 'vintage levis 501',
  'itemFilter(0).name': 'SoldItemsOnly',
  'itemFilter(0).value': 'true',
  'paginationInput.entriesPerPage': '50'
}
```

### 반환 데이터

```json
{
  "source": "ebay",
  "currency": "USD",
  "price": 95.5,
  "priceKRW": 127215,
  "confidence": 85,
  "listingCount": 48,
  "minPrice": 65,
  "maxPrice": 145,
  "avgPrice": 95.5,
  "sampleListings": [
    {
      "title": "Vintage Levi's 501 Jeans 1990s Made in USA",
      "price": 98,
      "url": "https://ebay.com/...",
      "soldDate": "2024-02-08T..."
    }
  ]
}
```

## 결론

eBay API를 사용하면:
- ✅ **합법적이고 안정적인** 시장 가격 데이터
- ✅ **무료로 충분한** 호출 한도 (5,000/day)
- ✅ **자동 캐싱**으로 효율적 사용
- ✅ **AI 추정과 결합**해 더 정확한 가격 책정

**지금 바로 시작하세요!** 🚀

```bash
# 1. API 키 발급 받았으면
echo "EBAY_APP_ID=your-app-id" >> .env.local

# 2. 서버 재시작
npm run dev

# 3. 이미지 업로드해서 테스트!
```
