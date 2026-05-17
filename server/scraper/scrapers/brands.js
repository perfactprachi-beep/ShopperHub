import { getBrowser, newStealthPage } from '../browser.js';
import { CONFIG } from '../config.js';
import { randomDelay } from '../utils/delay.js';
import { log, logError } from '../utils/logger.js';
import { downloadImage } from '../utils/downloadImage.js';
import slugifyLib from 'slugify';

const slugify = (str) => slugifyLib(str, { lower: true, strict: true });

export async function scrapeBrands() {
  const browser = await getBrowser();
  const page = await newStealthPage(browser);
  const results = [];

  log('Scraping brands...');

  try {
    await page.goto(`${CONFIG.BASE_URL}/brands`, { waitUntil: 'networkidle2', timeout: 45000 });
    await randomDelay(2000, 3000);

    const brands = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('a[href], img').forEach((el) => {
        const img = el.tagName === 'IMG' ? el : el.querySelector?.('img');
        const name = img?.alt || el.getAttribute?.('title') || el.innerText?.trim();
        const logoSrc = img?.src || img?.dataset?.src || null;
        const href = el.href || el.closest?.('a')?.href;
        if (name && name.length > 1 && name.length < 80 && (href?.includes('/brand') || logoSrc)) {
          items.push({ name, logoSrc, href });
        }
      });
      return [...new Map(items.map((b) => [b.name.toLowerCase(), b])).values()];
    });

    for (const brand of brands.slice(0, 200)) {
      const slug = slugify(brand.name);
      const logoPath = brand.logoSrc ? await downloadImage(brand.logoSrc, `brand-${slug}`) : null;
      results.push({ name: brand.name, slug, logo_url: logoPath, description: null });
    }

    log(`Scraped ${results.length} brands`);
  } catch (err) {
    logError('Brands scrape failed', err);
  } finally {
    await page.close();
  }

  return results;
}
