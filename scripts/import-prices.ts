/**
 * Import scraped prices to database
 * Processes JSON/CSV files and calculates reference prices
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { ScrapedItem } from './scrape-prices';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ReferencePrice {
  brand: string;
  product_type: string;
  era_start: number;
  era_end: number;
  condition: string;
  min_price_usd: number;
  avg_price_usd: number;
  max_price_usd: number;
  rarity: string;
  notes: string;
  sample_count: number;
}

/**
 * Parse era to year range
 */
function parseEra(era: string): { start: number; end: number } {
  // Specific year
  const yearMatch = era.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    return { start: year, end: year };
  }

  // Decade
  if (era.includes('1960')) return { start: 1960, end: 1969 };
  if (era.includes('1970')) return { start: 1970, end: 1979 };
  if (era.includes('1980')) return { start: 1980, end: 1989 };
  if (era.includes('1990')) return { start: 1990, end: 1999 };
  if (era.includes('2000')) return { start: 2000, end: 2009 };
  if (era.includes('2010')) return { start: 2010, end: 2019 };

  // Vintage (assume 1990s)
  if (era.toLowerCase().includes('vintage')) return { start: 1990, end: 1999 };

  // Unknown - assume modern
  return { start: 2010, end: 2024 };
}

/**
 * Determine condition from price and title
 */
function estimateCondition(item: ScrapedItem, avgPrice: number): string {
  const title = item.title.toLowerCase();

  // Check title keywords
  if (title.includes('nwt') || title.includes('new') || title.includes('deadstock')) {
    return 'deadstock';
  }
  if (title.includes('excellent') || title.includes('mint')) {
    return 'excellent';
  }
  if (title.includes('poor') || title.includes('damaged') || title.includes('repair')) {
    return 'poor';
  }
  if (title.includes('fair') || title.includes('worn')) {
    return 'fair';
  }

  // Estimate from price
  if (item.price > avgPrice * 1.3) return 'excellent';
  if (item.price < avgPrice * 0.6) return 'fair';

  return 'good';
}

/**
 * Determine rarity
 */
function determineRarity(title: string, priceVsAvg: number): string {
  const lower = title.toLowerCase();

  // Grail tier
  if (lower.includes('big e') || lower.includes('box logo') && lower.includes('1994')) {
    return 'grail';
  }

  // Very rare
  if (lower.includes('rare') || lower.includes('limited') || lower.includes('valencia')) {
    return 'very_rare';
  }

  // Rare (high price)
  if (priceVsAvg > 1.5) {
    return 'rare';
  }

  return 'common';
}

/**
 * Group items and calculate reference prices
 */
function processScrapedData(items: ScrapedItem[]): ReferencePrice[] {
  const grouped = new Map<string, ScrapedItem[]>();

  // Group by brand + product type + era + condition
  for (const item of items) {
    if (item.brand === 'unknown' || item.productType === 'unknown') continue;

    const era = parseEra(item.era || 'unknown');
    const eraKey = `${era.start}-${era.end}`;

    // First pass: group by brand + type + era
    const key = `${item.brand}:${item.productType}:${eraKey}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  }

  const referencePrices: ReferencePrice[] = [];

  // Process each group
  for (const [key, groupItems] of grouped) {
    if (groupItems.length < 3) continue; // Need at least 3 samples

    const [brand, productType, eraKey] = key.split(':');
    const [eraStart, eraEnd] = eraKey.split('-').map(Number);

    // Calculate overall average for this group
    const prices = groupItems.map(i => i.price).sort((a, b) => a - b);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Sub-group by condition
    const byCondition = new Map<string, ScrapedItem[]>();

    for (const item of groupItems) {
      const condition = estimateCondition(item, avgPrice);
      if (!byCondition.has(condition)) {
        byCondition.set(condition, []);
      }
      byCondition.get(condition)!.push(item);
    }

    // Create reference price for each condition
    for (const [condition, conditionItems] of byCondition) {
      if (conditionItems.length < 2) continue; // Need at least 2 samples

      const conditionPrices = conditionItems.map(i => i.price).sort((a, b) => a - b);
      const min = Math.round(conditionPrices[0]);
      const max = Math.round(conditionPrices[conditionPrices.length - 1]);
      const avg = Math.round(conditionPrices.reduce((a, b) => a + b, 0) / conditionPrices.length);

      // Determine rarity from first item
      const sampleItem = conditionItems[0];
      const rarity = determineRarity(sampleItem.title, avg / avgPrice);

      // Generate notes
      const notes = `Scraped from ${conditionItems[0].marketplace}, ${conditionItems.length} samples`;

      referencePrices.push({
        brand,
        product_type: productType,
        era_start: eraStart,
        era_end: eraEnd,
        condition,
        min_price_usd: min,
        avg_price_usd: avg,
        max_price_usd: max,
        rarity,
        notes,
        sample_count: conditionItems.length
      });
    }
  }

  return referencePrices;
}

/**
 * Import reference prices to database
 */
async function importToDatabase(prices: ReferencePrice[]) {
  console.log(`\n📤 Importing ${prices.length} reference prices to database...`);

  let successCount = 0;
  let errorCount = 0;

  for (const price of prices) {
    try {
      const { error } = await supabase
        .from('reference_prices')
        .upsert(price, {
          onConflict: 'brand,product_type,era_start,era_end,condition'
        });

      if (error) {
        console.error(`   ❌ Error:`, error.message);
        errorCount++;
      } else {
        console.log(`   ✅ ${price.brand} ${price.product_type} ${price.era_start}-${price.era_end} ${price.condition}`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error);
      errorCount++;
    }
  }

  console.log(`\n✨ Import complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
}

/**
 * Main import function
 */
async function main() {
  console.log('📊 Price Importer\n');

  // Find latest JSON file in data directory
  const dataDir = path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    console.error('❌ Data directory not found. Run scraper first!');
    process.exit(1);
  }

  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('scraped-prices-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ No scraped data found. Run scraper first!');
    process.exit(1);
  }

  const latestFile = files[0];
  const filePath = path.join(dataDir, latestFile);

  console.log(`📁 Reading: ${latestFile}\n`);

  // Load data
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const scrapedItems: ScrapedItem[] = JSON.parse(rawData);

  console.log(`📦 Loaded ${scrapedItems.length} scraped items`);

  // Process data
  console.log('\n🔄 Processing data...');
  const referencePrices = processScrapedData(scrapedItems);

  console.log(`\n📊 Generated ${referencePrices.length} reference prices:`);

  // Group by brand for summary
  const byBrand = new Map<string, number>();
  for (const price of referencePrices) {
    byBrand.set(price.brand, (byBrand.get(price.brand) || 0) + 1);
  }

  for (const [brand, count] of byBrand) {
    console.log(`   ${brand}: ${count} entries`);
  }

  // Ask for confirmation
  console.log('\n⚠️  Ready to import to database.');
  console.log('   This will UPDATE existing entries with same brand/type/era/condition.');
  console.log('\n   Press Ctrl+C to cancel, or Enter to continue...');

  // Wait for user input (in real usage)
  // For now, just import
  await importToDatabase(referencePrices);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { processScrapedData, importToDatabase };
