import { getBrowser, newStealthPage } from '../browser.js';
import { CONFIG } from '../config.js';
import { delay, randomDelay } from '../utils/delay.js';
import { log, logError } from '../utils/logger.js';
import slugifyLib from 'slugify';

const slugify = (str) => slugifyLib(str, { lower: true, strict: true });

export async function scrapeCategories() {
  const browser = await getBrowser();
  const page = await newStealthPage(browser);
  const results = [];

  log('Scraping categories...');

  try {
    for (const cat of CONFIG.CATEGORY_SLUGS) {
      results.push({ name: cat.name, slug: slugify(cat.name), parentName: null, path: cat.path });

      if (!CONFIG.SCRAPE_SUBCATEGORIES) continue;

      await page.goto(`${CONFIG.BASE_URL}${cat.path}`, { waitUntil: 'networkidle2', timeout: 45000 });
      await randomDelay(2000, 3500);

      const subCats = await page.evaluate(() => {
        const subs = [];
        document.querySelectorAll('a[href]').forEach((a) => {
          const name = a.innerText?.trim();
          const href = a.href;
          const textOk = name && name.length > 1 && name.length < 50;
          const linkOk = href && !href.includes('/p/') && !href.includes('/cart');
          if (textOk && linkOk) subs.push({ name, href });
        });
        return [...new Map(subs.map((s) => [s.name.toLowerCase(), s])).values()];
      });

      for (const sub of subCats.slice(0, 10)) {
        const path = new URL(sub.href).pathname;
        results.push({ name: sub.name, slug: slugify(sub.name), parentName: cat.name, path });
      }

      await delay(CONFIG.DELAY_MS);
    }

    log(`Scraped ${results.length} categories`);
  } catch (err) {
    logError('Category scrape failed', err);
  } finally {
    await page.close();
  }

  return results;
}
