import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import {
  getReferencePrice,
  extractProductType,
  extractYearFromEra,
  estimateCondition
} from '@/lib/services/referencePrices';
import {
  validatePrice,
  validatePriceConsistency,
  adjustConfidenceByQuality
} from '@/lib/services/priceValidator';

// Response 타입 정의
interface AnalysisResponse {
  status: 'VINTAGE' | 'MODERN' | 'FAKE';
  confidence: number;
  product_name: string;
  era: string;
  reason: string;
  market_price: {
    krw: number;
    usd: number;
  };
  is_authentic: boolean;
}

// 시스템 프롬프트 - 30년 경력 빈티지 감정사 페르소나
const SYSTEM_PROMPT = `당신은 30년 경력의 빈티지 의류 감정사입니다. 특히 Levi's, Stussy, Supreme의 연식(Era) 구분 전문가입니다.
정품이라도 '현행(Modern)' 제품은 빈티지 가치가 낮으므로 엄격히 구분해야 합니다.

**[판독 기준]**

1. **VINTAGE (Gold Tier - 고가치):** 2005년 이전 생산
   - Levi's: Valencia 공장 (스페인), Big E 시절, 케어라벨 은색띠, 501XX 각인
   - Stussy: 올드 폰트, 빈티지 택, 90년대 초기 디자인
   - Supreme: 1994-2005년 초기 박스로고, 빈티지 태그, 올드 폰트
   - 가치: ★★★★★ (프리미엄 시세)

2. **MODERN (Blue Tier - 정품이지만 빈티지 아님):** 2005년 이후 ~ 현재 생산
   - 최신 케어라벨 (QR코드, 홀로그램 택)
   - LVC 복각판 (Levi's Vintage Clothing)
   - 최신 매장 판매품
   - Supreme 최근 시즌 제품
   - 가치: ★★★☆☆ (정품이지만 빈티지 프리미엄 없음)

3. **FAKE (Red Tier - 가품):**
   - 조악한 퀄리티 (스티칭 불량, 폰트 어색함)
   - 정품에 없는 라벨/택
   - 시대착오적 디자인 (2000년대 라벨에 90년대 디자인)
   - 가치: ✗ (가치 없음)

**[분석 시 필수 체크포인트]**

🔍 **1단계: 진위 확인 (Authenticity Check)**
- 스티칭 균일도: 정품은 일정하고 깔끔
- 폰트 정확도: 로고/택의 글자체가 공식 디자인과 일치
- 소재 품질: 저렴한 원단 사용 여부
- 태그 위치: 정품 위치와 동일한지 (목 뒤, 허리 안쪽 등)
- 시대착오 체크: 연도와 라벨/디자인 불일치

🔍 **2단계: 연식 추정 (Era Identification)**
- 케어라벨 형태: 시대별 변천사 확인
  * 1980s: 은색 띠, 간단한 정보
  * 1990s: 흰색, 더 많은 정보
  * 2000s: 복잡한 세탁 기호, QR코드 등
- 생산 공장 정보: Valencia, Turkish 등 빈티지 공장
- 태그 스타일: 빈티지는 단순, 현대는 복잡
- 로고 변천: 브랜드별 시대별 로고 차이
- 메이드인 표기: 생산국 변천 추적 (USA → 아시아)

🔍 **3단계: 컨디션 평가 (Condition Assessment)**
- 전체적인 색 바램: 자연스러운 빈티지 색감 vs 인위적 워싱
- 얼룩/손상: 눈에 띄는 하자 확인
- 프린트 상태: 갈라짐, 벗겨짐 정도
- 원단 상태: 보풀, 구멍, 늘어남
- 디테일 보존: 버튼, 지퍼, 리벳 상태

🔍 **4단계: 희귀도 판단 (Rarity Assessment)**
- 레어 컬러/사이즈: 흔하지 않은 조합
- 한정판 표기: Limited Edition, Numbered 등
- 콜라보레이션: 다른 브랜드와의 협업
- 특별 라인: 일본 한정, 지역 한정 등
- 생산 수량: 대량생산 vs 소량생산 힌트

**[브랜드별 가격 가이드라인]**

📌 **LEVI'S 501**
• 1960s-70s Big E: $200-500 (₩260,000-670,000) - 희귀, 최상급 프리미엄
• 1980s 501XX: $120-250 (₩160,000-330,000) - 인기 빈티지
• 1990s Valencia/Turkish: $80-180 (₩105,000-240,000) - 일반 빈티지
• 2000s-현재 Modern: $30-70 (₩40,000-95,000) - 정품이지만 빈티지 아님
• LVC 복각판: $50-120 (₩65,000-160,000) - 새제품 프리미엄

📌 **SUPREME**
• 1994-2000 초기 박스로고: $300-1000 (₩400,000-1,330,000) - 최상급 희귀
• 2001-2005 중기 박스로고: $150-400 (₩200,000-530,000) - 고가 빈티지
• 2006-2010 일반 아이템: $80-200 (₩105,000-265,000) - 중급 빈티지
• 2011-2020 최근 시즌: $50-150 (₩65,000-200,000) - 인기 아이템
• 2021-현재 현행품: $30-100 (₩40,000-130,000) - 리테일 프리미엄

📌 **STUSSY**
• 1990s 초기 올드 스툴: $100-300 (₩130,000-400,000) - 희귀 빈티지
• 1990s 중후반: $60-150 (₩80,000-200,000) - 일반 빈티지
• 2000s 제품: $40-100 (₩50,000-130,000) - 저가 빈티지
• 2010s-현재: $25-60 (₩30,000-80,000) - 현행품

**[가격 조정 팩터]**
1. **컨디션 (Condition)**
   - Deadstock/NWT (새제품): +50%
   - Excellent (사용감 거의 없음): +20%
   - Good (일반 중고): 기준가
   - Fair (눈에 띄는 사용감): -30%
   - Poor (손상/얼룩): -60%

2. **희귀도 (Rarity)**
   - 레어 컬러/사이즈: +30-50%
   - 리미티드 에디션: +40-100%
   - 콜라보 아이템: +50-200%
   - 일반 제품: 기준가

3. **수요 (Demand)**
   - 트렌디한 스타일: +20-30%
   - 인플루언서 착용: +30-50%
   - 일반 수요: 기준가
   - 비인기 스타일: -20%

4. **진품 확신도 반영**
   - 명확한 정품 특징: 기준가
   - 일부 불확실: -15%
   - 진위 의심: -30-50%

**[가격 추정 프로세스]**
1. 브랜드와 연도로 기본 가격 범위 설정
2. 컨디션 확인 후 조정 (이미지에서 확인 가능한 범위)
3. 특별한 디테일 확인 (레어 태그, 한정판 등)
4. 최종 시세 = 기본가 × 컨디션 팩터 × 희귀도 팩터
5. 한국 시세는 글로벌 대비 10-15% 높게 책정 (배송비, 관세 반영)

**[응답 형식]**
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "status": "VINTAGE" | "MODERN" | "FAKE",
  "confidence": 0-100 사이 숫자,
  "product_name": "제품명 (예: Levi's 501XX 1993 Valencia)",
  "era": "연식 (예: 90s Vintage 또는 2023 Modern)",
  "reason": "판단 근거를 한글 3-4문장으로 설명. 반드시 아래 구조 따를 것:
    1) 진위/연식 판단 근거 (구체적인 특징 언급: 케어라벨, 태그, 스티칭 등)
    2) 컨디션 평가 (Good/Fair 등 명시)
    3) 가격 근거 (기본가 + 조정 팩터 설명)
    예: '케어라벨의 은색 띠와 Valencia 공장 표기로 1990년대 제품으로 추정됩니다. 전체적으로 색 바램이 있으나 큰 손상은 없어 Good 컨디션입니다. 1990s 501 기본가($120)에 일반 컨디션을 적용하여 ₩160,000로 추정합니다.'",
  "market_price": {
    "krw": 한국 시세 (숫자만, 위 가격 가이드라인을 정확히 따를 것),
    "usd": 글로벌 시세 (숫자만, krw를 1330으로 나눈 값)
  },
  "is_authentic": true/false (FAKE면 false, 나머지는 true)
}

**[가격 추정 예시]**

예시 1: Levi's 501 1990s 빈티지, Good 컨디션
- 기본가: $120 (1990s 501XX 범위)
- 컨디션: Good (조정 없음)
- 희귀도: 일반 (조정 없음)
→ USD: $120, KRW: ₩160,000

예시 2: Supreme 2000 초기 박스로고 티, Excellent 컨디션
- 기본가: $300 (2000 초기 범위)
- 컨디션: Excellent (+20%) = $360
- 희귀도: 레어 컬러 (+30%) = $468
→ USD: $468, KRW: ₩620,000

예시 3: Levi's 2023 현행품, Deadstock
- 기본가: $50 (현행품 범위)
- 컨디션: Deadstock (+50%) = $75
- 빈티지 아님: Modern 등급
→ USD: $75, KRW: ₩100,000

예시 4: Stussy 1995 올드 스툴 티, Fair 컨디션
- 기본가: $150 (1990s 초기 범위)
- 컨디션: Fair (-30%) = $105
- 희귀도: 일반
→ USD: $105, KRW: ₩140,000

**[중요 주의사항]**
- 반드시 위 가격 가이드라인을 참고하여 현실적인 시세 책정
- 정품이라도 MODERN이면 빈티지 가치가 없으므로 시세는 낮게 책정
- VINTAGE 제품만 프리미엄 시세 적용
- 이미지에서 확인 가능한 컨디션을 가격에 반영
- 불확실하면 confidence를 낮추되, 추정은 해야 함
- 한국 시세(krw)가 먼저이고, usd는 krw ÷ 1330으로 계산
- 위 예시처럼 단계적으로 가격을 계산할 것`;

export async function POST(request: NextRequest) {
  try {
    // 1. API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const body = await request.json();
    const { imageUrl, brand, images } = body;

    // Support both single image and multiple images
    const imageUrls = images || [imageUrl];

    console.log('[Gemini] Starting analysis for brand:', brand);
    console.log('[Gemini] Number of images:', imageUrls.length);

    // 2. Base64 헤더 제거
    const base64Data = imageUrl.includes('base64,')
      ? imageUrl.split('base64,')[1]
      : imageUrl;

    console.log('[Gemini] Image data length:', base64Data.length, 'bytes');

    // 3. 모델 설정 (gemini-2.0-flash-001 with JSON response)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    // 브랜드별 특화 정보
    const brandSpecificInfo: Record<string, string> = {
      'levis': `
**LEVI'S 특화 가이드:**
• 백 포켓 탭: Big E (1966년 이전) vs Small e (1971년 이후)
• 케어라벨: 은색 띠 (1980s-90s), 흰색 (2000s 이후)
• 생산지: Valencia(스페인), Turkish(터키), Bath(미국) - 빈티지 인기 공장
• 리벳: 구리색 (빈티지), 은색 (현행품)
• 501XX: 1980s까지 사용된 모델명, 이후 501로 변경
• 지퍼 vs 버튼: 501은 버튼플라이가 정품
• 중요: LVC(Levi's Vintage Clothing)는 복각판으로 MODERN 등급`,
      'supreme': `
**SUPREME 특화 가이드:**
• 박스로고 폰트: 초기(1994-2000)는 더 두껍고 간격 넓음
• 메이드인 태그: USA(초기), Canada(2000s 초중반), China(2010s 이후)
• 워터마크: 2010년대 이후 추가된 위조방지 요소
• 시즌 구분: FW/SS 표기, 연도별 컬러 차이
• 콜라보: Nike, TNF, Louis Vuitton 등 고가 프리미엄
• 중요: 최근 시즌도 리셀 프리미엄 있지만 MODERN 등급`,
      'stussy': `
**STUSSY 특화 가이드:**
• 로고 변천: 올드 스툴(1990s 초기), 현대 로고(2000s 이후)
• 빈티지 택: 노란색/주황색 택 (1990s), 흰색 택 (2000s 이후)
• 제작 방식: 스크린 프린트 (빈티지), 디지털 프린트 (현행)
• 인기 아이템: World Tour 티, 8 Ball 후디, Tribe 캡
• 일본 라인: Stussy Japan은 별도 라인, 고퀄리티
• 중요: 2000s 이후는 대량생산으로 빈티지 가치 낮음`
    };

    const brandInfo = brandSpecificInfo[brand.toLowerCase()] || '';

    const prompt = `${SYSTEM_PROMPT}

브랜드: ${brand.toUpperCase()}
${brandInfo}

위 이미지를 분석하여 위 JSON 형식으로 정확히 응답해주세요.
${brandInfo ? '브랜드 특화 가이드를 참고하여 더 정밀한 분석을 수행하세요.' : ''}`;

    console.log('[Gemini] Calling API with gemini-2.0-flash-001...');

    // 4. 분석 요청
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const responseText = result.response.text();
    console.log('[Gemini] ✅ API call successful');
    console.log('[Gemini] Response:', responseText.substring(0, 200) + '...');

    const data = JSON.parse(responseText) as AnalysisResponse;

    // is_authentic 재확인
    data.is_authentic = data.status !== 'FAKE';

    console.log('[Gemini] Analysis complete:', {
      status: data.status,
      confidence: data.confidence,
      product: data.product_name
    });

    // 1단계: 가격 범위 검증 (극단값 방지)
    const priceValidation = validatePrice(
      brand,
      data.product_name,
      data.market_price.usd,
      data.confidence,
      data.era
    );

    if (priceValidation.wasAdjusted) {
      console.log('[PriceValidator] ⚠️ Price adjusted:', {
        from: `$${priceValidation.originalPrice}`,
        to: `$${priceValidation.adjustedPrice}`,
        reason: priceValidation.reason
      });

      data.market_price.usd = priceValidation.adjustedPrice;
      data.market_price.krw = Math.round(priceValidation.adjustedPrice * 1330);
      data.confidence = priceValidation.confidence;
    }

    // 2단계: 신뢰도 품질 조정 (reason 기반)
    data.confidence = adjustConfidenceByQuality(data.reason, data.confidence);
    console.log('[PriceValidator] Confidence after quality check:', data.confidence);

    // 3단계: 가격 일관성 검증 (USD-KRW)
    const consistencyCheck = validatePriceConsistency(
      data.market_price.usd,
      data.market_price.krw
    );

    if (!consistencyCheck.isConsistent && consistencyCheck.suggestedKRW) {
      console.log('[PriceValidator] ⚠️ Price inconsistency detected, fixing...');
      data.market_price.krw = consistencyCheck.suggestedKRW;
    }

    // 4단계: 참고 가격 검증 및 조정
    try {
      console.log('[ReferencePrice] Validating price estimate...');

      // Extract product info
      const productType = extractProductType(data.product_name);
      const year = extractYearFromEra(data.era);
      const condition = estimateCondition(data.reason);

      console.log('[ReferencePrice] Extracted info:', {
        productType,
        year,
        condition
      });

      // Get reference price
      const refPrice = await getReferencePrice(
        brand.toLowerCase(),
        productType,
        year,
        condition
      );

      if (refPrice) {
        console.log('[ReferencePrice] Found reference:', {
          avg: refPrice.avg_price_usd,
          range: `${refPrice.min_price_usd}-${refPrice.max_price_usd}`,
          rarity: refPrice.rarity
        });

        // Compare AI estimate with reference price
        const aiPriceUSD = data.market_price.usd;
        const refAvgUSD = refPrice.avg_price_usd;
        const deviation = Math.abs(aiPriceUSD - refAvgUSD) / refAvgUSD;

        console.log('[ReferencePrice] Price comparison:', {
          aiPrice: aiPriceUSD,
          refPrice: refAvgUSD,
          deviation: `${(deviation * 100).toFixed(1)}%`
        });

        // If AI price is significantly off (>50% deviation), adjust it
        if (deviation > 0.5) {
          console.log('[ReferencePrice] ⚠️ Large deviation detected, adjusting price...');

          // Use weighted average: 70% reference, 30% AI
          const adjustedUSD = Math.round(refAvgUSD * 0.7 + aiPriceUSD * 0.3);
          const adjustedKRW = Math.round(adjustedUSD * 1330);

          data.market_price.usd = adjustedUSD;
          data.market_price.krw = adjustedKRW;

          // Lower confidence slightly due to adjustment
          data.confidence = Math.max(50, data.confidence - 10);

          console.log('[ReferencePrice] ✅ Price adjusted:', {
            from: `$${aiPriceUSD}`,
            to: `$${adjustedUSD}`,
            newConfidence: data.confidence
          });
        } else {
          console.log('[ReferencePrice] ✅ AI price is within acceptable range');

          // Boost confidence slightly if price matches well
          if (deviation < 0.2) {
            data.confidence = Math.min(95, data.confidence + 5);
            console.log('[ReferencePrice] Confidence boosted to', data.confidence);
          }
        }
      } else {
        console.log('[ReferencePrice] No reference data available, using AI estimate');
      }
    } catch (error) {
      console.error('[ReferencePrice] Error in price validation:', error);
      // Continue with AI estimate if validation fails
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[API] Error in analyze route:', error);
    console.error('[API] Error message:', error.message);

    // 에러 내용을 구체적으로 반환
    return NextResponse.json(
      {
        error: 'Gemini API Error',
        message: error.message || 'Unknown error',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

// GET 메서드는 허용하지 않음
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
