/**
 * eBay Finding API integration for market price data
 */

import { PricingSource, PricingSearchQuery } from './types';
import { pricingLogger } from './logger';
import { PRICING_CONFIG } from '@/config/pricing';

interface EbayItem {
  title: string[];
  sellingStatus: Array<{
    currentPrice: Array<{
      __value__: string;
      '@currencyId': string;
    }>;
    sellingState: string[];
  }>;
  listingInfo: Array<{
    endTime: string[];
  }>;
  viewItemURL: string[];
}

interface EbaySearchResponse {
  findCompletedItemsResponse: Array<{
    searchResult: Array<{
      '@count': string;
      item?: EbayItem[];
    }>;
  }>;
}

// Build search keywords from query
function buildSearchKeywords(query: PricingSearchQuery): string {
  const keywords: string[] = [];

  // Add brand
  if (query.brand) {
    keywords.push(query.brand);
  }

  // Add product name
  if (query.productName) {
    // Remove common words that might dilute search
    const cleanedName = query.productName
      .replace(/vintage|classic|authentic|original/gi, '')
      .trim();
    keywords.push(cleanedName);
  }

  // Add era if available
  if (query.era) {
    keywords.push(query.era);
  }

  return keywords.join(' ').trim();
}

// Fetch completed items from eBay
async function fetchCompletedItems(keywords: string): Promise<EbayItem[]> {
  const appId = process.env.EBAY_APP_ID;

  if (!appId) {
    throw new Error('eBay API credentials not configured');
  }

  const endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';

  const params = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': appId,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'REST-PAYLOAD': 'true',
    'keywords': keywords,
    'paginationInput.entriesPerPage': PRICING_CONFIG.ebay.maxResults.toString(),
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
    'itemFilter(1).name': 'Condition',
    'itemFilter(1).value(0)': '3000', // Used
    'itemFilter(1).value(1)': '4000', // Very Good
    'itemFilter(1).value(2)': '5000', // Good
    'itemFilter(1).value(3)': '6000', // Acceptable
    'sortOrder': 'EndTimeSoonest'
  });

  const url = `${endpoint}?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PRICING_CONFIG.ebay.timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.status} ${response.statusText}`);
    }

    const data: EbaySearchResponse = await response.json();

    const searchResult = data.findCompletedItemsResponse?.[0]?.searchResult?.[0];
    const items = searchResult?.item || [];

    pricingLogger.info(`eBay API returned ${items.length} items`, 'ebay', { keywords });

    return items;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      pricingLogger.error('eBay API request timeout', 'ebay', { keywords });
    } else {
      pricingLogger.error('eBay API request failed', 'ebay', { error, keywords });
    }
    throw error;
  }
}

// Parse and aggregate eBay prices
function aggregateEbayPrices(items: EbayItem[]): {
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  listings: Array<{ title: string; price: number; url: string; soldDate: Date }>;
} {
  if (items.length === 0) {
    throw new Error('No items to aggregate');
  }

  const prices: number[] = [];
  const listings: Array<{ title: string; price: number; url: string; soldDate: Date }> = [];
  let currency = 'USD';

  items.forEach(item => {
    try {
      const priceData = item.sellingStatus?.[0]?.currentPrice?.[0];
      const price = parseFloat(priceData?.__value__ || '0');
      const itemCurrency = priceData?.['@currencyId'] || 'USD';

      if (price > 0 && itemCurrency === 'USD') {
        prices.push(price);
        currency = itemCurrency;

        // Store sample listing
        listings.push({
          title: item.title?.[0] || 'Unknown',
          price,
          url: item.viewItemURL?.[0] || '',
          soldDate: new Date(item.listingInfo?.[0]?.endTime?.[0] || Date.now())
        });
      }
    } catch (error) {
      pricingLogger.warn('Failed to parse eBay item', 'ebay', { error, item });
    }
  });

  if (prices.length === 0) {
    throw new Error('No valid prices found');
  }

  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Sort listings by date (most recent first) and take top 5
  const sampleListings = listings
    .sort((a, b) => b.soldDate.getTime() - a.soldDate.getTime())
    .slice(0, 5);

  return {
    avgPrice,
    minPrice,
    maxPrice,
    currency,
    listings: sampleListings
  };
}

// Main function to fetch eBay market prices
export async function getEbayPrices(
  query: PricingSearchQuery,
  usdToKrw: number
): Promise<PricingSource> {
  if (!PRICING_CONFIG.ebay.enabled) {
    throw new Error('eBay integration is disabled');
  }

  const keywords = buildSearchKeywords(query);
  pricingLogger.info(`Fetching eBay prices for: ${keywords}`, 'ebay');

  const items = await fetchCompletedItems(keywords);

  if (items.length === 0) {
    throw new Error('No completed items found on eBay');
  }

  const { avgPrice, minPrice, maxPrice, currency, listings } = aggregateEbayPrices(items);

  // Calculate confidence based on number of listings
  const confidence = Math.min(90, 50 + Math.floor(items.length / 2));

  const result: PricingSource = {
    source: 'ebay',
    currency,
    price: avgPrice,
    priceKRW: Math.round(avgPrice * usdToKrw),
    confidence,
    listingCount: items.length,
    minPrice,
    maxPrice,
    avgPrice,
    updatedAt: new Date(),
    sampleListings: listings
  };

  pricingLogger.info('eBay prices fetched successfully', 'ebay', {
    avgPrice,
    minPrice,
    maxPrice,
    listingCount: items.length,
    confidence
  });

  return result;
}
