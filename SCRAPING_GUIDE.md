# 🕷️ 실제 시장 가격 수집 가이드

## 개요

eBay API 키 없이 실제 판매 데이터를 수집하는 웹 스크래핑 시스템입니다.

**⚠️ 중요 주의사항**:
- 개인/교육용으로만 사용
- Rate limit 준수 (요청 간 5초 대기)
- 과도한 크롤링 금지 (차단될 수 있음)
- robots.txt 및 이용약관 확인
- 상업적 사용 전 법률 검토 필요

---

## 🚀 빠른 시작

### 1. 스크래핑 실행 (10-15분)

```bash
npm run scrape
```

**동작**:
- eBay에서 판매 완료된 빈티지 아이템 검색
- Grailed에서 판매된 아이템 검색
- 데이터를 `/data/` 폴더에 저장 (JSON + CSV)

**검색 쿼리**:
- Levi's 501 vintage jeans
- Levi's 501 1990s jeans
- Supreme box logo tee vintage
- Supreme box logo hoodie 2000s
- Stussy vintage t-shirt 1990s

**출력 예시**:
```
🕷️  Starting Price Scraper

============================================================
📦 Searching: Levis 501 vintage jeans
============================================================

[eBay] Scraping: "Levis 501 vintage jeans"
[eBay] Loading page...
[eBay] Found 20 items

📊 Statistics:
   Count: 20
   Range: $45 - $180
   Average: $98
   Median: $95

💾 Saving results...
✅ Saved JSON: data/scraped-prices-1707456789123.json
✅ Saved CSV: data/scraped-prices-1707456789123.csv

📈 Summary:
   Total items: 85
   eBay: 75
   Grailed: 10
```

### 2. 데이터 검토

수집된 데이터 확인:

```bash
# JSON 파일 확인
cat data/scraped-prices-*.json | jq '.[0:3]'

# CSV 파일 확인
head -10 data/scraped-prices-*.csv
```

**데이터 구조**:
```json
{
  "brand": "levis",
  "productType": "jeans",
  "title": "Vintage Levis 501 Jeans 1990s Made in USA",
  "price": 95,
  "currency": "USD",
  "soldDate": "Dec 15, 2023",
  "url": "https://ebay.com/...",
  "marketplace": "ebay",
  "era": "1990s"
}
```

### 3. 데이터베이스 임포트 (1-2분)

```bash
npm run import
```

**동작**:
1. 최신 스크래핑 데이터 로드
2. 브랜드/타입/연도/컨디션별로 그룹화
3. 평균/최소/최대 가격 계산
4. Supabase `reference_prices` 테이블에 저장

**출력 예시**:
```
📊 Price Importer

📁 Reading: scraped-prices-1707456789123.json

📦 Loaded 85 scraped items

🔄 Processing data...

📊 Generated 24 reference prices:
   levis: 12 entries
   supreme: 8 entries
   stussy: 4 entries

📤 Importing 24 reference prices to database...
   ✅ levis jeans 1990-1999 good
   ✅ levis jeans 1990-1999 excellent
   ✅ supreme tshirt 2000-2005 good
   ...

✨ Import complete!
   Success: 24
   Errors: 0
```

---

## 🛠️ 커스터마이징

### 검색 쿼리 변경

`scripts/scrape-prices.ts` 파일의 `searches` 배열 수정:

```typescript
const searches = [
  { query: "Levis 501 vintage jeans", brand: "levis", type: "jeans" },
  { query: "Levis 501 Big E", brand: "levis", type: "jeans" },  // 추가
  { query: "Supreme box logo hoodie 1994", brand: "supreme", type: "hoodie" },
  // 더 추가...
];
```

### 수집 개수 조정

```typescript
// eBay 결과 개수 변경 (기본: 20)
const ebayResults = await scrapeEbay(search.query, 50);

// Grailed 결과 개수 변경 (기본: 10)
const grailedResults = await scrapeGrailed(search.query, 20);
```

### 대기 시간 조정

너무 빠르면 차단될 수 있으니 조정:

```typescript
// 마켓플레이스 간 대기 (기본: 3초)
await delay(5000); // 5초로 변경

// 검색 쿼리 간 대기 (기본: 5초)
await delay(10000); // 10초로 변경
```

---

## 📊 수집된 데이터 분석

### JSON 파일 분석

```bash
# 브랜드별 개수
cat data/scraped-prices-*.json | jq '[.[] | .brand] | group_by(.) | map({brand: .[0], count: length})'

# 평균 가격
cat data/scraped-prices-*.json | jq '[.[] | .price] | add / length'

# 가격 범위
cat data/scraped-prices-*.json | jq '[.[] | .price] | [min, max]'
```

### CSV 분석 (Excel/Google Sheets)

1. `/data/scraped-prices-*.csv` 파일을 Excel/Google Sheets에서 열기
2. 피벗 테이블로 브랜드/연도별 평균 가격 계산
3. 차트로 시각화

---

## 🔍 문제 해결

### 1. "No items found" 에러

**원인**:
- eBay/Grailed의 HTML 구조 변경
- 검색 결과 없음
- Rate limit 차단

**해결**:
```bash
# 브라우저 headless 모드 끄고 실행 (디버깅)
# scripts/scrape-prices.ts에서 수정:
headless: false  # true → false로 변경

# 실행하면 브라우저가 열려서 동작 확인 가능
npm run scrape
```

### 2. "Timeout" 에러

**원인**: 페이지 로딩이 느림

**해결**:
```typescript
// 타임아웃 시간 증가
await page.goto(searchUrl, {
  waitUntil: 'networkidle2',
  timeout: 60000  // 30초 → 60초
});
```

### 3. Grailed 차단됨

**원인**: Grailed은 스크래핑 감지가 민감함

**해결**:
```typescript
// Grailed 스크래핑 스킵하고 eBay만 사용
// main() 함수에서 Grailed 부분 주석 처리:
/*
try {
  const grailedResults = await scrapeGrailed(search.query, 10);
  allResults.push(...grailedResults);
} catch (error) {
  console.log('[Grailed] Skipping due to error');
}
*/
```

### 4. 데이터베이스 임포트 실패

**원인**: Supabase 연결 오류 또는 스키마 미생성

**확인**:
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 데이터베이스 테이블 확인 (Supabase SQL 편집기)
SELECT COUNT(*) FROM reference_prices;
```

**해결**:
1. `.env.local` 파일에 Supabase 키 확인
2. Supabase에서 마이그레이션 실행:
   ```sql
   -- /supabase/migrations/add_reference_prices.sql
   ```

---

## 📈 데이터 품질 향상

### 1. 더 많은 샘플 수집

```bash
# 검색 쿼리 추가
# scripts/scrape-prices.ts의 searches 배열에 추가

{ query: "Levis 501 1980s USA", brand: "levis", type: "jeans" },
{ query: "Levis 501 Valencia Spain", brand: "levis", type: "jeans" },
{ query: "Supreme box logo 2000", brand: "supreme", type: "tshirt" },
{ query: "Supreme TNF collaboration", brand: "supreme", type: "jacket" },
{ query: "Stussy 8 ball hoodie", brand: "stussy", type: "hoodie" },
```

### 2. 주기적 업데이트

```bash
# Cron job 설정 (매주 실행)
0 0 * * 0 cd /path/to/vintage_scan && npm run scrape && npm run import
```

### 3. 데이터 검증

```sql
-- Supabase SQL 편집기에서 확인

-- 브랜드별 참고 가격 개수
SELECT brand, COUNT(*) as count
FROM reference_prices
GROUP BY brand;

-- 샘플이 적은 항목 확인 (신뢰도 낮음)
SELECT brand, product_type, era_start, era_end, sample_count
FROM reference_prices
WHERE sample_count < 5
ORDER BY sample_count;

-- 가격 범위 확인 (이상치 체크)
SELECT brand, product_type, condition,
       min_price_usd, avg_price_usd, max_price_usd
FROM reference_prices
WHERE max_price_usd > avg_price_usd * 3  -- 최대가가 평균의 3배 이상
ORDER BY max_price_usd DESC;
```

---

## 🎯 목표 데이터 수집량

### 최소 목표 (1차)
- ✅ 브랜드당 5-10개 참고 가격
- ✅ 주요 제품 타입 커버 (jeans, tshirt, hoodie)
- ✅ 주요 시대 커버 (1990s, 2000s, 현대)

### 이상적 목표 (2차)
- ⏳ 브랜드당 20-30개 참고 가격
- ⏳ 모든 제품 타입 커버
- ⏳ 모든 컨디션 커버 (deadstock ~ poor)
- ⏳ 10년 단위 세분화

### 장기 목표 (3차)
- ⏳ 브랜드당 50-100개 참고 가격
- ⏳ 자동 업데이트 시스템 (월 1회)
- ⏳ ML 학습을 위한 1000+ 샘플

---

## 📝 법률 및 윤리

### 허용되는 사용
✅ 개인 연구 및 학습
✅ 소량 데이터 수집 (하루 100개 미만)
✅ 가격 비교 및 분석
✅ 내부 참고용 데이터베이스

### 금지되는 사용
❌ 대규모 상업적 크롤링
❌ Rate limit 우회/회피
❌ 데이터 재판매
❌ 경쟁 서비스 구축

### 권장사항
- 가능하면 공식 API 사용 (eBay API 키 발급)
- 수집 속도 제한 준수
- robots.txt 확인 및 준수
- 웹사이트 이용약관 검토

---

## 🚀 다음 단계

### 1. 즉시 실행
```bash
# 1. 스크래핑
npm run scrape

# 2. 데이터 확인
ls -lh data/

# 3. 임포트
npm run import

# 4. 검증
# Supabase SQL 편집기에서
SELECT * FROM reference_prices LIMIT 10;
```

### 2. 주간 업데이트
- 매주 새로운 검색 쿼리 추가
- 데이터 품질 검증
- 이상치 제거

### 3. 자동화
- Cron job 설정
- 실패 알림 추가
- 로그 모니터링

---

## 💡 팁

1. **Headless 모드 끄기**: 처음엔 `headless: false`로 실행해서 동작 확인
2. **적은 쿼리부터**: 처음엔 2-3개 쿼리로 테스트
3. **천천히**: Rate limit을 피하려면 대기 시간 늘리기
4. **데이터 검증**: 수집 후 반드시 데이터 품질 확인
5. **백업**: 수집한 데이터는 백업 보관

---

## 📚 추가 자료

- [Puppeteer 문서](https://pptr.dev/)
- [eBay Finding API](https://developer.ebay.com/devzone/finding/Concepts/FindingAPIGuide.html)
- [웹 스크래핑 윤리](https://www.scrapingbee.com/blog/web-scraping-ethics/)

---

## ✅ 체크리스트

실행 전:
- [ ] Node.js 및 npm 설치 확인
- [ ] `.env.local`에 Supabase 키 설정
- [ ] 데이터베이스 마이그레이션 실행
- [ ] `/data/` 폴더 쓰기 권한 확인

실행 중:
- [ ] 콘솔 로그 확인
- [ ] 에러 없이 완료
- [ ] 데이터 파일 생성 확인

실행 후:
- [ ] JSON/CSV 파일 검토
- [ ] 데이터베이스에 임포트
- [ ] AI 가격 추정 테스트
- [ ] 정확도 향상 확인

**이제 실제 시장 데이터를 수집해보세요!** 🚀
