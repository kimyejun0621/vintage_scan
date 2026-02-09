/**
 * Reference price service
 * Provides AI with real market data for accurate price estimation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface ReferencePriceData {
  avg_price_usd: number;
  min_price_usd: number;
  max_price_usd: number;
  rarity: 'common' | 'rare' | 'very_rare' | 'grail';
  notes: string;
}

/**
 * Get reference price for a specific item
 */
export async function getReferencePrice(
  brand: string,
  productType: string,
  year: number,
  condition: 'deadstock' | 'excellent' | 'good' | 'fair' | 'poor' = 'good'
): Promise<ReferencePriceData | null> {
  try {
    const { data, error } = await supabase.rpc('get_reference_price', {
      p_brand: brand.toLowerCase(),
      p_product_type: productType.toLowerCase(),
      p_year: year,
      p_condition: condition.toLowerCase()
    });

    if (error) {
      console.error('[ReferencePrice] Database error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('[ReferencePrice] No match found for:', { brand, productType, year, condition });
      return null;
    }

    return data[0] as ReferencePriceData;
  } catch (error) {
    console.error('[ReferencePrice] Error fetching reference price:', error);
    return null;
  }
}

/**
 * Get reference price range for an era
 */
export async function getReferencePriceRange(
  brand: string,
  productType: string,
  eraStart: number,
  eraEnd: number
): Promise<{ min: number; max: number; avg: number } | null> {
  try {
    const { data, error } = await supabase
      .from('reference_prices')
      .select('min_price_usd, max_price_usd, avg_price_usd')
      .eq('brand', brand.toLowerCase())
      .eq('product_type', productType.toLowerCase())
      .gte('era_end', eraStart)
      .lte('era_start', eraEnd);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Aggregate across all matching records
    const minPrice = Math.min(...data.map(d => d.min_price_usd));
    const maxPrice = Math.max(...data.map(d => d.max_price_usd));
    const avgPrice = Math.round(
      data.reduce((sum, d) => sum + d.avg_price_usd, 0) / data.length
    );

    return { min: minPrice, max: maxPrice, avg: avgPrice };
  } catch (error) {
    console.error('[ReferencePrice] Error fetching price range:', error);
    return null;
  }
}

/**
 * Format reference price data for AI prompt
 */
export function formatReferencePriceForAI(
  priceData: ReferencePriceData | null,
  exchangeRate: number = 1330
): string {
  if (!priceData) {
    return '참고 가격 데이터 없음. 위 가격 가이드라인을 따르세요.';
  }

  const minKRW = Math.round(priceData.min_price_usd * exchangeRate);
  const avgKRW = Math.round(priceData.avg_price_usd * exchangeRate);
  const maxKRW = Math.round(priceData.max_price_usd * exchangeRate);

  const rarityLabel = {
    common: '일반',
    rare: '레어',
    very_rare: '매우 레어',
    grail: '성배급'
  }[priceData.rarity];

  return `
**실제 시장 참고 가격 (DB 기반):**
- 평균: $${priceData.avg_price_usd} (₩${avgKRW.toLocaleString()})
- 범위: $${priceData.min_price_usd}-${priceData.max_price_usd} (₩${minKRW.toLocaleString()}-₩${maxKRW.toLocaleString()})
- 희귀도: ${rarityLabel}
${priceData.notes ? `- 특이사항: ${priceData.notes}` : ''}

이 가격을 기준으로 이미지의 실제 컨디션과 특징을 고려하여 조정하세요.`;
}

/**
 * Extract product type from product name
 */
export function extractProductType(productName: string): string {
  const name = productName.toLowerCase();

  // Check for specific types
  if (name.includes('jean') || name.includes('501') || name.includes('denim')) {
    return 'jeans';
  }
  if (name.includes('hoodie') || name.includes('sweatshirt')) {
    return 'hoodie';
  }
  if (name.includes('jacket') || name.includes('trucker')) {
    return 'jacket';
  }
  if (name.includes('tee') || name.includes('t-shirt') || name.includes('tshirt')) {
    return 'tshirt';
  }
  if (name.includes('shirt') && !name.includes('t-shirt')) {
    return 'shirt';
  }
  if (name.includes('pant') || name.includes('trouser')) {
    return 'pants';
  }
  if (name.includes('short')) {
    return 'shorts';
  }

  // Default to tshirt if unclear
  return 'tshirt';
}

/**
 * Extract year from era string
 */
export function extractYearFromEra(era: string): number {
  // Try to find 4-digit year
  const yearMatch = era.match(/(\d{4})/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }

  // Try to find decade reference
  if (era.includes('60s') || era.includes('1960')) return 1965;
  if (era.includes('70s') || era.includes('1970')) return 1975;
  if (era.includes('80s') || era.includes('1980')) return 1985;
  if (era.includes('90s') || era.includes('1990')) return 1995;
  if (era.includes('2000s') || era.includes('early 2000')) return 2005;
  if (era.includes('2010s')) return 2015;
  if (era.includes('2020s') || era.includes('modern') || era.includes('current')) return 2022;

  // Default to current year
  return new Date().getFullYear();
}

/**
 * Estimate condition from reason text
 */
export function estimateCondition(reason: string): 'deadstock' | 'excellent' | 'good' | 'fair' | 'poor' {
  const text = reason.toLowerCase();

  if (text.includes('deadstock') || text.includes('새제품') || text.includes('nwt')) {
    return 'deadstock';
  }
  if (text.includes('excellent') || text.includes('최상') || text.includes('거의 새것')) {
    return 'excellent';
  }
  if (text.includes('fair') || text.includes('사용감') || text.includes('중간')) {
    return 'fair';
  }
  if (text.includes('poor') || text.includes('손상') || text.includes('얼룩') || text.includes('많이')) {
    return 'poor';
  }

  // Default to good
  return 'good';
}
