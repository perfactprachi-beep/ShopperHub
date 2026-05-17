import { getBrowser, newStealthPage } from '../browser.js';
import { CONFIG } from '../config.js';
import { randomDelay } from '../utils/delay.js';
import { log, logError } from '../utils/logger.js';
import { downloadImage } from '../utils/downloadImage.js';

export async function scrapeBanners() {
  const browser = await getBrowser();
  const page = await newStealthPage(browser);
  const results = [];

  log('Scraping homepage banners...');

  try {
    await page.goto(CONFIG.BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
    await randomDelay(3000, 4000);

    const banners = await page.evaluate(() => {
      const items = [];
      document
        .querySelectorAll('[class*="banner"] img, [class*="carousel"] img, [class*="hero"] img, [class*="slider"] img, picture img')
        .forEach((img, i) => {
          const src = img.src || img.dataset.src || img.getAttribute('data-lazy');
          const link = img.closest('a')?.href || '';
          const title = img.alt || `Banner ${i + 1}`;
          if (src && !src.includes('placeholder')) items.push({ title, imageUrl: src, link, sort_order: i });
        });
      return items;
    });

    for (const banner of banners.slice(0, 8)) {
      const filename = `banner-${banner.sort_order}-${Date.now()}`;
      const imagePath = await downloadImage(banner.imageUrl, filename);
      results.push({
        title: banner.title,
        image_url: imagePath || banner.imageUrl,
        link: banner.link,
        position: 'hero',
        is_active: true,
        sort_order: banner.sort_order,
      });
    }

    log(`Scraped ${results.length} banners`);
  } catch (err) {
    logError('Banners scrape failed', err);
  } finally {
    await page.close();
  }

  return results;
}
