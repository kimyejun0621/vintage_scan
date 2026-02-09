/**
 * Price aggregator - combines prices from multiple sources with weighted averaging
 */

import { MarketPriceData, PricingSource } from './types';
import { PRICING_CONFIG } from '@/config/pricing';
import { pricingLogger } from './logger';

interface AggregationWeights {
  ebay?: number;
  grailed?: number;
  ai?: number;
}

// Calculate weighted average price
function calculateWeightedAverage(
  sources: PricingSource[],
  weights: AggregationWeights
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  sources.forEach(source => {
    const weight = weights[source.source] || 0;
    if (weight > 0) {
      weightedSum += source.priceKRW * weight;
      totalWeight += weight;
    }
  });

  if (totalWeight === 0) {
    throw new Error('No valid weights for aggregation');
  }

  return Math.round(weightedSum / totalWeight);
}

// Calculate overall confidence score
function calculateConfidence(sources: PricingSource[]): number {
  if (sources.length === 0) {
    return 0;
  }

  // Base confidence from number of sources
  const sourceBonus = Math.min(30, sources.length * 10);

  // Average confidence from individual sources
  const avgSourceConfidence = sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length;

  // Consistency bonus: check if prices are within reasonable range
  const prices = sources.map(s => s.priceKRW);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / avgPrice;

  // Lower variation = higher consistency bonus
  const consistencyBonus = coefficientOfVariation < 0.3 ? 15 :
                          coefficientOfVariation < 0.5 ? 10 :
                          coefficientOfVariation < 0.7 ? 5 : 0;

  const totalConfidence = Math.round(
    (avgSourceConfidence * 0.6) + sourceBonus + consistencyBonus
  );

  return Math.min(100, Math.max(0, totalConfidence));
}

// Calculate price range
function calculatePriceRange(sources: PricingSource[]): { min: number; max: number } {
  const allPrices: number[] = [];

  sources.forEach(source => {
    if (source.minPrice !== undefined) {
      allPrices.push(source.minPrice);
    }
    if (source.maxPrice !== undefined) {
      allPrices.push(source.maxPrice);
    }
    allPrices.push(source.price);
  });

  if (allPrices.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...allPrices),
    max: Math.max(...allPrices)
  };
}

// Redistribute weights when some sources are unavailable
function redistributeWeights(availableSources: string[]): AggregationWeights {
  const weights: AggregationWeights = {};
  const defaultWeights = {
    ebay: PRICING_CONFIG.ebay.weight,
    grailed: PRICING_CONFIG.grailed.weight,
    ai: PRICING_CONFIG.ai.weight
  };

  // Calculate total weight of available sources
  let totalAvailableWeight = 0;
  availableSources.forEach(source => {
    const key = source as keyof typeof defaultWeights;
    totalAvailableWeight += defaultWeights[key] || 0;
  });

  if (totalAvailableWeight === 0) {
    return weights;
  }

  // Redistribute weights proportionally
  availableSources.forEach(source => {
    const key = source as keyof typeof defaultWeights;
    const originalWeight = defaultWeights[key] || 0;
    weights[key] = originalWeight / totalAvailableWeight;
  });

  return weights;
}

// Main aggregation function
export function aggregatePrices(
  sources: PricingSource[],
  exchangeRate?: { USD_KRW: number; updatedAt: Date }
): MarketPriceData {
  if (sources.length === 0) {
    return {
      sources: [],
      aggregated: {
        estimatedPrice: 0,
        priceRange: { min: 0, max: 0 },
        confidence: 0,
        currency: 'KRW'
      },
      exchangeRate,
      error: 'No price sources available'
    };
  }

  pricingLogger.info('Aggregating prices from sources', 'aggregator', {
    sourcesCount: sources.length,
    sources: sources.map(s => s.source)
  });

  try {
    // Redistribute weights based on available sources
    const availableSources = sources.map(s => s.source);
    const weights = redistributeWeights(availableSources);

    // Calculate weighted average
    const estimatedPrice = calculateWeightedAverage(sources, weights);

    // Calculate confidence
    const confidence = calculateConfidence(sources);

    // Calculate price range
    const priceRange = calculatePriceRange(sources);

    const result: MarketPriceData = {
      sources,
      aggregated: {
        estimatedPrice,
        priceRange,
        confidence,
        currency: 'KRW'
      },
      exchangeRate,
      cachedAt: new Date()
    };

    pricingLogger.info('Price aggregation complete', 'aggregator', {
      estimatedPrice,
      confidence,
      priceRange,
      weights
    });

    return result;
  } catch (error) {
    pricingLogger.error('Error aggregating prices', 'aggregator', { error });

    // Fallback: return simple average
    const avgPrice = Math.round(
      sources.reduce((sum, s) => sum + s.priceKRW, 0) / sources.length
    );

    return {
      sources,
      aggregated: {
        estimatedPrice: avgPrice,
        priceRange: calculatePriceRange(sources),
        confidence: 50,
        currency: 'KRW'
      },
      exchangeRate,
      error: 'Aggregation error, using simple average'
    };
  }
}

// Add AI estimate as a pricing source
export function addAIEstimate(
  aiPriceKRW: number,
  confidence: number = 70
): PricingSource {
  return {
    source: 'ai',
    currency: 'KRW',
    price: aiPriceKRW,
    priceKRW: aiPriceKRW,
    confidence,
    updatedAt: new Date()
  };
}
