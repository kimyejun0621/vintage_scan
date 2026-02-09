/**
 * Price Scraper for eBay and Grailed
 * Collects actual sold prices to build reference price database
 *
 * ⚠️ IMPORTANT:
 * - Use responsibly and respect rate limits
 * - Add delays between requests
 * - For personal/educational use only
 * - Check robots.txt and terms of service
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface ScrapedItem {
  brand: string;
  productType: string;
  title: string;
  price: number;
  currency: string;
  soldDate?: string;
  condition?: string;
  url: string;
  marketplace: 'ebay' | 'grailed';
  era?: string;
}

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Scrape eBay sold listings
 */
async function scrapeEbay(searchQuery: string, maxResults: number = 20): Promise<ScrapedItem[]> {
  console.log(`\n[eBay] Scraping: "${searchQuery}"`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    // eBay sold listings URL
    const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&LH_Sold=1&LH_Complete=1&_ipg=200`;

    console.log('[eBay] Loading page...');
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for results
    await delay(2000);

    // Extract data
    const items = await page.evaluate((maxResults) => {
      const results: any[] = [];
      const itemElements = document.querySelectorAll('.s-item');

      for (let i = 0; i < Math.min(itemElements.length, maxResults); i++) {
        const item = itemElements[i];

        try {
          const titleEl = item.querySelector('.s-item__title');
          const priceEl = item.querySelector('.s-item__price');
          const linkEl = item.querySelector('.s-item__link');
          const dateEl = item.querySelector('.s-item__ended-date');

          if (!titleEl || !priceEl || !linkEl) continue;

          const title = titleEl.textContent?.trim() || '';
          const priceText = priceEl.textContent?.trim() || '';
          const url = (linkEl as HTMLAnchorElement).href || '';
          const dateText = dateEl?.textContent?.trim() || '';

          // Skip if title contains "Shop on eBay"
          if (title.includes('Shop on eBay')) continue;

          // Parse price
          const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
          if (!priceMatch) continue;

          const price = parseFloat(priceMatch[1].replace(/,/g, ''));
          if (isNaN(price) || price === 0) continue;

          results.push({
            title,
            price,
            url,
            soldDate: dateText
          });
        } catch (error) {
          console.error('Error parsing item:', error);
        }
      }

      return results;
    }, maxResults);

    console.log(`[eBay] Found ${items.length} items`);

    return items.map(item => ({
      brand: extractBrand(item.title),
      productType: extractProductType(item.title),
      title: item.title,
      price: item.price,
      currency: 'USD',
      soldDate: item.soldDate,
      url: item.url,
      marketplace: 'ebay' as const,
      era: extractEra(item.title)
    }));

  } catch (error) {
    console.error('[eBay] Scraping error:', error);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Scrape Grailed listings
 */
async function scrapeGrailed(searchQuery: string, maxResults: number = 20): Promise<ScrapedItem[]> {
  console.log(`\n[Grailed] Scraping: "${searchQuery}"`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    // Grailed search URL
    const searchUrl = `https://www.grailed.com/sold/${encodeURIComponent(searchQuery)}`;

    console.log('[Grailed] Loading page...');
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for content to load
    await delay(3000);

    // Scroll to load more items
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 2);
    });
    await delay(2000);

    // Extract data
    const items = await page.evaluate((maxResults) => {
      const results: any[] = [];

      // Grailed uses different selectors, adjust based on actual site structure
      const itemElements = document.querySelectorAll('[data-testid="feed-item"], .feed-item, .listing-item');

      for (let i = 0; i < Math.min(itemElements.length, maxResults); i++) {
        const item = itemElements[i];

        try {
          // These selectors may need adjustment based on Grailed's current DOM
          const titleEl = item.querySelector('[data-testid="listing-title"], .listing-title, h3, h4');
          const priceEl = item.querySelector('[data-testid="listing-price"], .listing-price, .price');
          const linkEl = item.querySelector('a[href*="/listings/"]');

          if (!titleEl || !priceEl) continue;

          const title = titleEl.textContent?.trim() || '';
          const priceText = priceEl.textContent?.trim() || '';
          const url = linkEl ? (linkEl as HTMLAnchorElement).href : '';

          // Parse price
          const priceMatch = priceText.match(/\$?([\d,]+)/);
          if (!priceMatch) continue;

          const price = parseFloat(priceMatch[1].replace(/,/g, ''));
          if (isNaN(price) || price === 0) continue;

          results.push({
            title,
            price,
            url: url || 'https://www.grailed.com'
          });
        } catch (error) {
          console.error('Error parsing Grailed item:', error);
        }
      }

      return results;
    }, maxResults);

    console.log(`[Grailed] Found ${items.length} items`);

    return items.map(item => ({
      brand: extractBrand(item.title),
      productType: extractProductType(item.title),
      title: item.title,
      price: item.price,
      currency: 'USD',
      url: item.url,
      marketplace: 'grailed' as const,
      era: extractEra(item.title)
    }));

  } catch (error) {
    console.error('[Grailed] Scraping error:', error);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Extract brand from title
 */
function extractBrand(title: string): string {
  const lower = title.toLowerCase();

  if (lower.includes("levi") || lower.includes("501")) return "levis";
  if (lower.includes("supreme")) return "supreme";
  if (lower.includes("stussy") || lower.includes("stüssy")) return "stussy";

  return "unknown";
}

/**
 * Extract product type from title
 */
function extractProductType(title: string): string {
  const lower = title.toLowerCase();

  if (lower.includes("jean") || lower.includes("501") || lower.includes("denim")) return "jeans";
  if (lower.includes("hoodie") || lower.includes("sweatshirt")) return "hoodie";
  if (lower.includes("jacket") || lower.includes("trucker")) return "jacket";
  if (lower.includes("tee") || lower.includes("t-shirt") || lower.includes("tshirt")) return "tshirt";
  if (lower.includes("shirt") && !lower.includes("t-shirt")) return "shirt";

  return "unknown";
}

/**
 * Extract era from title
 */
function extractEra(title: string): string {
  // Look for year
  const yearMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) return yearMatch[1];

  // Look for decade
  if (title.match(/60s|1960s/i)) return "1960s";
  if (title.match(/70s|1970s/i)) return "1970s";
  if (title.match(/80s|1980s/i)) return "1980s";
  if (title.match(/90s|1990s/i)) return "1990s";
  if (title.match(/2000s|00s/i)) return "2000s";

  // Look for vintage keyword
  if (title.toLowerCase().includes("vintage")) return "vintage";

  return "unknown";
}

/**
 * Calculate statistics from scraped items
 */
function calculateStats(items: ScrapedItem[]) {
  if (items.length === 0) return null;

  const prices = items.map(i => i.price).sort((a, b) => a - b);
  const sum = prices.reduce((a, b) => a + b, 0);

  return {
    count: prices.length,
    min: Math.round(prices[0]),
    max: Math.round(prices[prices.length - 1]),
    avg: Math.round(sum / prices.length),
    median: Math.round(prices[Math.floor(prices.length / 2)])
  };
}

/**
 * Main scraping function
 */
async function main() {
  console.log('🕷️  Starting Price Scraper\n');
  console.log('⚠️  Please use responsibly and respect rate limits\n');

  // Define search queries
  const searches = [
    { query: "Levis 501 vintage jeans", brand: "levis", type: "jeans" },
    { query: "Levis 501 1990s jeans", brand: "levis", type: "jeans" },
    { query: "Supreme box logo tee vintage", brand: "supreme", type: "tshirt" },
    { query: "Supreme box logo hoodie 2000s", brand: "supreme", type: "hoodie" },
    { query: "Stussy vintage t-shirt 1990s", brand: "stussy", type: "tshirt" },
  ];

  const allResults: ScrapedItem[] = [];

  for (const search of searches) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Searching: ${search.query}`);
    console.log(`${'='.repeat(60)}`);

    // Scrape eBay
    const ebayResults = await scrapeEbay(search.query, 20);
    allResults.push(...ebayResults);

    // Delay between marketplaces
    await delay(3000);

    // Scrape Grailed (optional - may be blocked more easily)
    try {
      const grailedResults = await scrapeGrailed(search.query, 10);
      allResults.push(...grailedResults);
    } catch (error) {
      console.log('[Grailed] Skipping due to error');
    }

    // Calculate stats for this search
    const searchResults = allResults.filter(r =>
      r.title.toLowerCase().includes(search.query.toLowerCase().split(' ')[0])
    );
    const stats = calculateStats(searchResults);

    if (stats) {
      console.log('\n📊 Statistics:');
      console.log(`   Count: ${stats.count}`);
      console.log(`   Range: $${stats.min} - $${stats.max}`);
      console.log(`   Average: $${stats.avg}`);
      console.log(`   Median: $${stats.median}`);
    }

    // Delay between searches
    await delay(5000);
  }

  // Save results
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('💾 Saving results...');
  console.log(`${'='.repeat(60)}\n`);

  const outputDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save as JSON
  const jsonPath = path.join(outputDir, `scraped-prices-${Date.now()}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2));
  console.log(`✅ Saved JSON: ${jsonPath}`);

  // Save as CSV
  const csvPath = path.join(outputDir, `scraped-prices-${Date.now()}.csv`);
  const csvContent = [
    'Brand,Product Type,Title,Price (USD),Era,Marketplace,URL',
    ...allResults.map(item =>
      `"${item.brand}","${item.productType}","${item.title}",${item.price},"${item.era || 'unknown'}","${item.marketplace}","${item.url}"`
    )
  ].join('\n');
  fs.writeFileSync(csvPath, csvContent);
  console.log(`✅ Saved CSV: ${csvPath}`);

  // Summary
  console.log(`\n📈 Summary:`);
  console.log(`   Total items: ${allResults.length}`);
  console.log(`   eBay: ${allResults.filter(r => r.marketplace === 'ebay').length}`);
  console.log(`   Grailed: ${allResults.filter(r => r.marketplace === 'grailed').length}`);

  console.log('\n✨ Done! Review the data and import to database.\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { scrapeEbay, scrapeGrailed, ScrapedItem };
