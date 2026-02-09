/**
 * Market pricing API endpoint
 * Aggregates real-time prices from eBay, Grailed, and AI estimates
 */

import { NextRequest, NextResponse } from 'next/server';
import { PricingSearchQuery, PricingSource, MarketPriceData } from '@/lib/services/pricing/types';
import { getEbayPrices } from '@/lib/services/pricing/ebay';
import { getGrailedPricesWithRetry } from '@/lib/services/pricing/grailed';
import { aggregatePrices, addAIEstimate } from '@/lib/services/pricing/aggregator';
import { getCachedPrice, setCachedPrice, generateCacheKey } from '@/lib/services/pricing/cache';
import { pricingLogger } from '@/lib/services/pricing/logger';
import { PRICING_CONFIG } from '@/config/pricing';

interface MarketPriceRequest {
  product_name: string;
  brand: string;
  era?: string;
  ai_estimate?: number; // KRW
}

// Fetch exchange rate
async function getExchangeRate(): Promise<{ USD_KRW: number; updatedAt: Date }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/pricing/exchange-rate`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data = await response.json();
    return {
      USD_KRW: data.USD_KRW,
      updatedAt: new Date(data.updatedAt)
    };
  } catch (error) {
    pricingLogger.error('Error fetching exchange rate', 'market', { error });
    return {
      USD_KRW: 1334,
      updatedAt: new Date()
    };
  }
}

// Fetch prices from all sources in parallel
async function fetchAllPrices(
  query: PricingSearchQuery,
  usdToKrw: number,
  cacheKey: string
): Promise<PricingSource[]> {
  const sources: PricingSource[] = [];

  // Use Promise.allSettled to handle partial failures
  const results = await Promise.allSettled([
    // eBay
    (async () => {
      if (!PRICING_CONFIG.ebay.enabled) {
        return null;
      }

      // Check cache first
      const cached = await getCachedPrice(cacheKey, 'ebay');
      if (cached) {
        pricingLogger.info('Using cached eBay prices', 'market');
        return cached;
      }

      // Fetch fresh data
      const ebayData = await getEbayPrices(query, usdToKrw);

      // Cache the result
      await setCachedPrice(cacheKey, query.brand, 'ebay', ebayData, PRICING_CONFIG.cache.ttl);

      return ebayData;
    })(),

    // Grailed
    (async () => {
      if (!PRICING_CONFIG.grailed.enabled) {
        return null;
      }

      // Check cache first
      const cached = await getCachedPrice(cacheKey, 'grailed');
      if (cached) {
        pricingLogger.info('Using cached Grailed prices', 'market');
        return cached;
      }

      // Fetch fresh data with retry
      const grailedData = await getGrailedPricesWithRetry(query, usdToKrw);

      // Cache the result (shorter TTL for Grailed)
      const grailedTTL = PRICING_CONFIG.cache.ttl / 2; // 12 hours
      await setCachedPrice(cacheKey, query.brand, 'grailed', grailedData, grailedTTL);

      return grailedData;
    })()
  ]);

  // Process results
  results.forEach((result, index) => {
    const sourceName = index === 0 ? 'eBay' : 'Grailed';

    if (result.status === 'fulfilled' && result.value) {
      sources.push(result.value);
      pricingLogger.info(`${sourceName} prices fetched successfully`, 'market');
    } else if (result.status === 'rejected') {
      pricingLogger.warn(`${sourceName} price fetch failed`, 'market', {
        error: result.reason
      });
    }
  });

  return sources;
}

export async function POST(request: NextRequest) {
  try {
    const body: MarketPriceRequest = await request.json();

    // Validate request
    if (!body.product_name || !body.brand) {
      return NextResponse.json(
        { error: 'product_name and brand are required' },
        { status: 400 }
      );
    }

    pricingLogger.info('Market price request received', 'market', {
      product_name: body.product_name,
      brand: body.brand,
      era: body.era
    });

    // Build search query
    const query: PricingSearchQuery = {
      productName: body.product_name,
      brand: body.brand,
      era: body.era
    };

    // Generate cache key
    const cacheKey = generateCacheKey(body.brand, body.product_name, body.era);

    // Get exchange rate
    const exchangeRate = await getExchangeRate();

    // Fetch prices from all sources
    const sources = await fetchAllPrices(query, exchangeRate.USD_KRW, cacheKey);

    // Add AI estimate if provided
    if (body.ai_estimate && body.ai_estimate > 0) {
      const aiSource = addAIEstimate(body.ai_estimate);
      sources.push(aiSource);
      pricingLogger.info('Added AI estimate to sources', 'market', { ai_estimate: body.ai_estimate });
    }

    // Check if we have any sources
    if (sources.length === 0) {
      pricingLogger.warn('No price sources available', 'market');

      // Fallback to AI estimate only
      if (body.ai_estimate) {
        const fallbackResult: MarketPriceData = {
          sources: [addAIEstimate(body.ai_estimate, 30)],
          aggregated: {
            estimatedPrice: body.ai_estimate,
            priceRange: {
              min: Math.round(body.ai_estimate * 0.8),
              max: Math.round(body.ai_estimate * 1.2)
            },
            confidence: 30,
            currency: 'KRW'
          },
          exchangeRate,
          error: 'Market data temporarily unavailable, using AI estimate only'
        };

        return NextResponse.json(fallbackResult);
      }

      return NextResponse.json(
        { error: 'No price data available' },
        { status: 503 }
      );
    }

    // Aggregate prices
    const result = aggregatePrices(sources, exchangeRate);

    pricingLogger.info('Market price aggregation complete', 'market', {
      sourcesCount: sources.length,
      estimatedPrice: result.aggregated.estimatedPrice,
      confidence: result.aggregated.confidence
    });

    return NextResponse.json(result);
  } catch (error) {
    pricingLogger.error('Market pricing endpoint error', 'market', { error });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  const stats = {
    status: 'operational',
    config: {
      ebay: PRICING_CONFIG.ebay.enabled,
      grailed: PRICING_CONFIG.grailed.enabled
    },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(stats);
}
