import { PricingConfig } from '@/lib/services/pricing/types';

export const PRICING_CONFIG: PricingConfig = {
  ebay: {
    enabled: true,
    maxResults: 50,
    timeout: 10000, // 10 seconds
    weight: 0.4
  },
  grailed: {
    enabled: true,
    maxResults: 20,
    timeout: 15000, // 15 seconds
    weight: 0.3
  },
  ai: {
    weight: 0.3
  },
  cache: {
    ttl: 24 * 60 * 60 // 24 hours in seconds
  }
};

export const EXCHANGE_RATE_CACHE_TTL = 6 * 60 * 60; // 6 hours in seconds
export const DEFAULT_USD_KRW_RATE = 1334; // Fallback rate
