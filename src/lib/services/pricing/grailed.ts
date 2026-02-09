/**
 * Grailed marketplace integration for market price data
 * Uses Grailed's internal GraphQL API (reverse-engineered)
 */

import { PricingSource, PricingSearchQuery } from './types';
import { pricingLogger } from './logger';
import { PRICING_CONFIG } from '@/config/pricing';

interface GrailedListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  url: string;
  condition?: string;
  sold?: boolean;
}

// Build search query for Grailed
function buildGrailedQuery(query: PricingSearchQuery): string {
  const parts: string[] = [];

  if (query.brand) {
    parts.push(query.brand);
  }

  if (query.productName) {
    // Clean up product name
    const cleaned = query.productName
      .replace(/vintage|classic|authentic|original/gi, '')
      .trim();
    parts.push(cleaned);
  }

  if (query.era) {
    parts.push(query.era);
  }

  return parts.join(' ').trim();
}

// Fetch listings from Grailed's GraphQL API
async function fetchGrailedListings(searchQuery: string): Promise<GrailedListing[]> {
  const endpoint = 'https://www.grailed.com/api/listings';

  // Grailed's public API endpoint (no authentication required for search)
  const params = new URLSearchParams({
    query: searchQuery,
    sold: 'true', // Only sold items for accurate pricing
    sort: 'price_asc',
    per_page: PRICING_CONFIG.grailed.maxResults.toString()
  });

  const url = `${endpoint}?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PRICING_CONFIG.grailed.timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; VintageScanBot/1.0)',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Grailed might rate limit or block requests
      if (response.status === 429) {
        throw new Error('Grailed rate limit exceeded');
      }
      throw new Error(`Grailed API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Parse response structure (adjust based on actual Grailed API)
    const listings: GrailedListing[] = [];

    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        try {
          listings.push({
            id: item.id?.toString() || '',
            title: item.title || item.name || 'Unknown',
            price: parseFloat(item.price || item.price_i18n?.['USD'] || '0'),
            currency: 'USD',
            url: `https://www.grailed.com/listings/${item.id}`,
            condition: item.condition,
            sold: item.sold || false
          });
        } catch (error) {
          pricingLogger.warn('Failed to parse Grailed listing', 'grailed', { error, item });
        }
      });
    }

    pricingLogger.info(`Grailed API returned ${listings.length} listings`, 'grailed', { searchQuery });

    return listings;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      pricingLogger.error('Grailed API request timeout', 'grailed', { searchQuery });
    } else {
      pricingLogger.error('Grailed API request failed', 'grailed', { error, searchQuery });
    }
    throw error;
  }
}

// Aggregate Grailed prices
function aggregateGrailedPrices(listings: GrailedListing[]): {
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  samples: Array<{ title: string; price: number; url: string }>;
} {
  if (listings.length === 0) {
    throw new Error('No listings to aggregate');
  }

  const prices: number[] = [];
  const samples: Array<{ title: string; price: number; url: string }> = [];

  listings.forEach(listing => {
    if (listing.price > 0) {
      prices.push(listing.price);
      samples.push({
        title: listing.title,
        price: listing.price,
        url: listing.url
      });
    }
  });

  if (prices.length === 0) {
    throw new Error('No valid prices found');
  }

  // Remove outliers (prices beyond 2 standard deviations)
  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const stdDev = Math.sqrt(
    prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
  );

  const filteredPrices = prices.filter(
    p => Math.abs(p - mean) <= 2 * stdDev
  );

  const avgPrice = filteredPrices.reduce((sum, p) => sum + p, 0) / filteredPrices.length;
  const minPrice = Math.min(...filteredPrices);
  const maxPrice = Math.max(...filteredPrices);

  return {
    avgPrice,
    minPrice,
    maxPrice,
    currency: 'USD',
    samples: samples.slice(0, 5)
  };
}

// Main function to fetch Grailed market prices
export async function getGrailedPrices(
  query: PricingSearchQuery,
  usdToKrw: number
): Promise<PricingSource> {
  if (!PRICING_CONFIG.grailed.enabled) {
    throw new Error('Grailed integration is disabled');
  }

  const searchQuery = buildGrailedQuery(query);
  pricingLogger.info(`Fetching Grailed prices for: ${searchQuery}`, 'grailed');

  try {
    const listings = await fetchGrailedListings(searchQuery);

    if (listings.length === 0) {
      throw new Error('No listings found on Grailed');
    }

    const { avgPrice, minPrice, maxPrice, currency, samples } = aggregateGrailedPrices(listings);

    // Calculate confidence based on number of listings
    const confidence = Math.min(85, 40 + Math.floor(listings.length * 2));

    const result: PricingSource = {
      source: 'grailed',
      currency,
      price: avgPrice,
      priceKRW: Math.round(avgPrice * usdToKrw),
      confidence,
      listingCount: listings.length,
      minPrice,
      maxPrice,
      avgPrice,
      updatedAt: new Date(),
      sampleListings: samples
    };

    pricingLogger.info('Grailed prices fetched successfully', 'grailed', {
      avgPrice,
      minPrice,
      maxPrice,
      listingCount: listings.length,
      confidence
    });

    return result;
  } catch (error) {
    // Grailed integration is more fragile, so we handle errors gracefully
    pricingLogger.error('Failed to fetch Grailed prices', 'grailed', { error });
    throw error;
  }
}

// Exponential backoff retry wrapper
export async function getGrailedPricesWithRetry(
  query: PricingSearchQuery,
  usdToKrw: number,
  maxRetries = 3
): Promise<PricingSource> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await getGrailedPrices(query, usdToKrw);
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.message.includes('rate limit')) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt + 1) * 1000;
        pricingLogger.warn(`Grailed rate limited, retrying in ${delay}ms`, 'grailed', { attempt });
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Non-retryable error
        throw error;
      }
    }
  }

  throw lastError || new Error('Failed to fetch Grailed prices after retries');
}
