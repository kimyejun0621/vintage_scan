/**
 * Exchange rate API endpoint
 * Fetches real-time USD to KRW exchange rate with caching
 */

import { NextResponse } from 'next/server';
import { getCachedPrice, setCachedPrice } from '@/lib/services/pricing/cache';
import { pricingLogger } from '@/lib/services/pricing/logger';
import { EXCHANGE_RATE_CACHE_TTL, DEFAULT_USD_KRW_RATE } from '@/config/pricing';

interface ExchangeRateResponse {
  USD_KRW: number;
  updatedAt: string;
  cached: boolean;
}

// Fetch exchange rate from API
async function fetchExchangeRate(): Promise<number> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    pricingLogger.warn('Exchange rate API key not configured, using default rate', 'exchange-rate');
    return DEFAULT_USD_KRW_RATE;
  }

  try {
    // Using exchangerate-api.com (free tier: 1500 requests/month)
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/KRW`;

    const response = await fetch(url, {
      next: { revalidate: EXCHANGE_RATE_CACHE_TTL }
    });

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.result === 'success' && data.conversion_rate) {
      const rate = parseFloat(data.conversion_rate);
      pricingLogger.info(`Fetched exchange rate: ${rate}`, 'exchange-rate');
      return rate;
    }

    throw new Error('Invalid exchange rate response');
  } catch (error) {
    pricingLogger.error('Failed to fetch exchange rate', 'exchange-rate', { error });
    return DEFAULT_USD_KRW_RATE;
  }
}

export async function GET() {
  try {
    // Check cache first
    const cached = await getCachedPrice('usd_krw', 'exchange_rate');

    if (cached) {
      pricingLogger.info('Returning cached exchange rate', 'exchange-rate');
      return NextResponse.json({
        USD_KRW: cached.priceKRW,
        updatedAt: cached.updatedAt.toISOString(),
        cached: true
      } as ExchangeRateResponse);
    }

    // Fetch fresh rate
    const rate = await fetchExchangeRate();

    // Cache the result
    await setCachedPrice(
      'usd_krw',
      'exchange_rate',
      'exchange_rate',
      {
        source: 'ai', // Reuse ai type for exchange rate storage
        currency: 'USD',
        price: rate,
        priceKRW: rate,
        confidence: 100,
        updatedAt: new Date()
      },
      EXCHANGE_RATE_CACHE_TTL
    );

    return NextResponse.json({
      USD_KRW: rate,
      updatedAt: new Date().toISOString(),
      cached: false
    } as ExchangeRateResponse);
  } catch (error) {
    pricingLogger.error('Exchange rate endpoint error', 'exchange-rate', { error });

    return NextResponse.json(
      {
        USD_KRW: DEFAULT_USD_KRW_RATE,
        updatedAt: new Date().toISOString(),
        cached: false,
        error: 'Failed to fetch exchange rate, using default'
      },
      { status: 200 } // Return 200 with fallback rate
    );
  }
}
