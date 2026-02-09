import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 1. 구글 API 설정
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { imageUrl, brand } = await request.json()

    // 2. 이미지가 base64 형식이 아닌 URL로 올 경우를 대비해 변환 필요하지만,
    // 프론트엔드에서 base64로 보내는 게 가장 확실합니다.
    // (일단 프론트에서 base64를 보낸다고 가정하고 짭니다)
    
    // 이미지 데이터 처리 (Base64 문자열에서 헤더 제거)
    // 예: "data:image/jpeg;base64,/9j/4AAQSkZJRg..." -> "/9j/4AAQSkZJRg..."
    const base64Data = imageUrl.split(',')[1] 
    const mimeType = imageUrl.split(';')[0].split(':')[1] // "image/jpeg"

    // 3. 모델 선택 (Gemini 1.5 Flash - 빠르고 무료)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" } // 무조건 JSON으로 뱉어라!
    })

    // 4. 프롬프트 (빈티지 전문가 빙의)
    const prompt = `
      당신은 전설적인 빈티지 의류 감정사입니다. 
      특히 '${brand}' 브랜드의 1980~2000년대 아카이브에 대해 박사급 지식을 가지고 있습니다.
      
      이 사진을 보고 다음 정보를 JSON 형식으로 분석해 주세요. 
      (절대 마크다운 포맷팅 없이 순수 JSON만 반환하세요):

      {
        "authentic": boolean, // 정품 여부
        "confidence": number, // 확신도 (0~100)
        "year_era": string, // 추정 연식 (예: "Late 90s")
        "details": string, // 감정 근거 (한글로)
        "market_price_krw": number, // 한국 시세 (원)
        "global_price_usd": number // 해외 시세 (달러)
      }

      가품이거나 불확실하면 confidence를 낮게 잡으세요.
    `

    // 5. 분석 요청
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ])

    const responseText = result.response.text()
    console.log("🤖 Gemini 분석 결과:", responseText)

    // 6. JSON 파싱해서 보내기
    const data = JSON.parse(responseText)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Gemini 분석 실패:', error)
    return NextResponse.json({ error: '분석 중 오류 발생' }, { status: 500 })
  }
}