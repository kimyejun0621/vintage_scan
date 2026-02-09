/**
 * Debug scraper - opens browser to see what's happening
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

async function debugEbay() {
  console.log('🔍 Debug Mode: eBay\n');

  const browser = await puppeteer.launch({
    headless: false,  // Open browser window
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    const searchUrl = 'https://www.ebay.com/sch/i.html?_nkw=Levis+501+vintage+jeans&LH_Sold=1&LH_Complete=1';

    console.log('📖 Opening eBay...');
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    console.log('✅ Page loaded. Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Save HTML for inspection
    const html = await page.content();
    const outputPath = path.join(process.cwd(), 'data', 'ebay-debug.html');
    fs.writeFileSync(outputPath, html);
    console.log(`💾 Saved HTML: ${outputPath}`);

    // Try to find items with various selectors
    console.log('\n🔎 Testing selectors...\n');

    const selectors = [
      '.s-item',
      '[class*="s-item"]',
      '.srp-results .s-item',
      '#srp-river-results .s-item',
      'li.s-item',
      'div[class*="item"]',
    ];

    for (const selector of selectors) {
      const count = await page.$$eval(selector, els => els.length);
      console.log(`   ${selector}: ${count} elements`);
    }

    // Take screenshot
    const screenshotPath = path.join(process.cwd(), 'data', 'ebay-debug.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot: ${screenshotPath}`);

    console.log('\n⏸️  Browser will stay open. Close it manually when done.');
    console.log('   Review the HTML and screenshot to find correct selectors.\n');

    // Keep browser open
    await new Promise(() => {});  // Never resolves

  } catch (error) {
    console.error('❌ Error:', error);
    await browser.close();
  }
}

debugEbay().catch(console.error);
