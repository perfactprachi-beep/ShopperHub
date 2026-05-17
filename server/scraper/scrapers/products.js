import { getBrowser, newStealthPage } from '../browser.js';
import { CONFIG } from '../config.js';
import { delay, randomDelay } from '../utils/delay.js';
import { log, logError } from '../utils/logger.js';

export async function scrapeProductList(categoryPath, limit = CONFIG.PRODUCTS_PER_CAT) {
  const browser = await getBrowser();
  const page = await newStealthPage(browser);
  const products = [];
  let pageNum = 1;

  log(`Scraping product list: ${categoryPath}`);

  try {
    while (products.length < limit) {
      const url = `${CONFIG.BASE_URL}${categoryPath}?page=${pageNum}`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
      await randomDelay(2000, 3500);

      const items = await page.evaluate(() => {
        const found = [];
        document.querySelectorAll('a[href]').forEach((a) => {
          const href = a.href;
          if (!href || !href.includes('/p/')) return;
          const card = a.closest('[class*="product"], li, article, div') || a;
          const title = card.querySelector('[class*="name"], [class*="title"], h2, h3')?.innerText?.trim() || a.innerText?.trim();
          const price = card.querySelector('[class*="price"], [class*="amount"]')?.innerText?.trim();
          const image = card.querySelector('img')?.src;
          const brand = card.querySelector('[class*="brand"]')?.innerText?.trim();
          found.push({ href, title, price, image, brand });
        });
        return [...new Map(found.map((p) => [p.href, p])).values()];
      });

      if (!items.length) break;

      products.push(...items);
      log(`  Page ${pageNum}: found ${items.length} products (total: ${products.length})`);

      pageNum += 1;
      await delay(CONFIG.DELAY_MS);
    }
  } catch (err) {
    logError(`Product list scrape failed for ${categoryPath}`, err);
  } finally {
    await page.close();
  }

  return products.slice(0, limit);
}
