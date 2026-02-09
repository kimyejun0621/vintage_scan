/**
 * Cache service for pricing data
 */

import { createClient } from '@supabase/supabase-js';
import { PricingSource } from './types';
import { pricingLogger } from './logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate a cache key from search parameters
export function generateCacheKey(brand: string, productName: string, era?: string): string {
  const normalized = `${brand.toLowerCase()}_${productName.toLowerCase()}_${era?.toLowerCase() || 'unknown'}`;
  return normalized.replace(/[^a-z0-9_]/g, '_');
}

// Get cached price data
export async function getCachedPrice(
  searchQuery: string,
  source: string
): Promise<PricingSource | null> {
  try {
    const { data, error } = await supabase
      .from('price_cache')
      .select('*')
      .eq('search_query', searchQuery)
      .eq('source', source)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      pricingLogger.info(`Cache miss: ${searchQuery} from ${source}`);
      return null;
    }

    pricingLogger.info(`Cache hit: ${searchQuery} from ${source}`);

    // Parse the cached price data
    const priceData = data.price_data as PricingSource;
    return {
      ...priceData,
      updatedAt: new Date(data.created_at)
    };
  } catch (error) {
    pricingLogger.error('Error reading from cache', 'cache', { error, searchQuery, source });
    return null;
  }
}

// Set cached price data
export async function setCachedPrice(
  searchQuery: string,
  brand: string,
  source: string,
  priceData: PricingSource,
  ttlSeconds: number
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const { error } = await supabase
      .from('price_cache')
      .upsert({
        search_query: searchQuery,
        brand: brand.toLowerCase(),
        price_data: priceData,
        source,
        confidence: priceData.confidence,
        listing_count: priceData.listingCount,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'search_query,source'
      });

    if (error) {
      throw error;
    }

    pricingLogger.info(`Cached price data: ${searchQuery} from ${source}`, 'cache', {
      ttlSeconds,
      expiresAt
    });
  } catch (error) {
    pricingLogger.error('Error writing to cache', 'cache', { error, searchQuery, source });
  }
}

// Clean expired cache entries
export async function cleanExpiredCache(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('price_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      throw error;
    }

    const deletedCount = data?.length || 0;
    pricingLogger.info(`Cleaned ${deletedCount} expired cache entries`, 'cache');
    return deletedCount;
  } catch (error) {
    pricingLogger.error('Error cleaning expired cache', 'cache', { error });
    return 0;
  }
}

// Get cache statistics
export async function getCacheStats() {
  try {
    const { data, error } = await supabase
      .from('price_cache')
      .select('source, created_at')
      .gt('expires_at', new Date().toISOString());

    if (error) {
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      bySource: {} as Record<string, number>
    };

    data?.forEach(entry => {
      stats.bySource[entry.source] = (stats.bySource[entry.source] || 0) + 1;
    });

    return stats;
  } catch (error) {
    pricingLogger.error('Error getting cache stats', 'cache', { error });
    return { total: 0, bySource: {} };
  }
}
