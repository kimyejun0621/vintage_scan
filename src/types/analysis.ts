import { MarketPriceData } from '@/lib/services/pricing/types';

// 분석 요청 타입
export interface AnalysisRequest {
  imageUrl: string; // Base64 encoded image
  brand: 'levis' | 'supreme' | 'stussy';
}

// 분석 응답 타입
export interface AnalysisResponse {
  status: 'VINTAGE' | 'MODERN' | 'FAKE';
  confidence: number; // 0-100
  product_name: string;
  era: string;
  reason: string;
  market_price: {
    krw: number;
    usd: number;
  };
  is_authentic: boolean;
  // 추가: 실시간 마켓 가격 데이터 (optional, 비동기 로드)
  market_data?: MarketPriceData;
}

// 에러 응답 타입
export interface AnalysisError {
  error: string;
  message?: string;
  rawResponse?: string;
}
