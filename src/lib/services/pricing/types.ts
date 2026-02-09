/**
 * 가격 조회 서비스 타입 정의
 */

export interface PricingSearchQuery {
  productName: string;
  brand: string;
  era?: string;
  category?: string;
  condition?: string;
}

export interface PricingSource {
  source: 'ebay' | 'grailed' | 'ai';
  currency: string;
  price: number;
  priceKRW: number;
  confidence: number; // 0-100
  listingCount?: number;
  minPrice?: number;
  maxPrice?: number;
  avgPrice?: number;
  updatedAt: Date;
  sampleListings?: Array<{
    title: string;
    price: number;
    url: string;
    soldDate?: Date;
  }>;
}

export interface MarketPriceData {
  sources: PricingSource[];
  aggregated: {
    estimatedPrice: number; // KRW
    priceRange: {
      min: number;
      max: number;
    };
    confidence: number; // 0-100
    currency: string;
  };
  exchangeRate?: {
    USD_KRW: number;
    updatedAt: Date;
  };
  cachedAt?: Date;
  error?: string;
}

export interface CachedPrice {
  id: string;
  searchQuery: string;
  brand: string;
  priceData: PricingSource;
  source: string;
  confidence: number;
  listingCount?: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface PricingConfig {
  ebay: {
    enabled: boolean;
    maxResults: number;
    timeout: number;
    weight: number;
  };
  grailed: {
    enabled: boolean;
    maxResults: number;
    timeout: number;
    weight: number;
  };
  ai: {
    weight: number;
  };
  cache: {
    ttl: number; // seconds
  };
}
