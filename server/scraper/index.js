import 'dotenv/config';
import pLimit from 'p-limit';
import { scrapeCategories } from './scrapers/categories.js';
import { scrapeBrands } from './scrapers/brands.js';
import { scrapeBanners } from './scrapers/banners.js';
import { scrapeProductList } from './scrapers/products.js';
import { scrapeProductDetail } from './scrapers/productDetail.js';
import { importCategories } from './importers/importCategories.js';
import { importBrands } from './importers/importBrands.js';
import { importBanners } from './importers/importBanners.js';
import { importProducts } from './importers/importProducts.js';
import { closeBrowser } from './browser.js';
import { CONFIG } from './config.js';
import { log, logError } from './utils/logger.js';
import { delay } from './utils/delay.js';
import { pool } from '../src/db/pool.js';

async function run() {
  log('====== ShoppersHub Data Migration Started ======');
  const limit = pLimit(CONFIG.MAX_CONCURRENT);

  try {
    log('PHASE A: Categories');
    const categories = await scrapeCategories();
    await importCategories(categories);

    const { rows: catRows } = await pool.query('SELECT id, name FROM categories');
    const categoryMap = Object.fromEntries(catRows.map((row) => [row.name, row.id]));

    log('PHASE B: Brands');
    const brands = await scrapeBrands();
    const brandMap = await importBrands(brands);

    log('PHASE C: Banners');
    const banners = await scrapeBanners();
    await importBanners(banners);

    log('PHASE D: Products');
    const allProductUrls = [];
    for (const cat of CONFIG.CATEGORY_SLUGS) {
      const listings = await scrapeProductList(cat.path);
      allProductUrls.push(...listings.map((product) => ({ ...product, categoryName: cat.name })));
      await delay(CONFIG.DELAY_MS);
      if (allProductUrls.length >= CONFIG.MAX_PRODUCTS) break;
    }

    log(`Total product URLs collected: ${allProductUrls.length}`);
    const detailedProducts = [];
    const tasks = allProductUrls.slice(0, CONFIG.MAX_PRODUCTS).map((product) =>
      limit(async () => {
        const detail = await scrapeProductDetail(product.href);
        if (detail) {
          detail.category = detail.category || product.categoryName;
          detail.categoryName = product.categoryName;
          detail.brand = detail.brand || product.brand;
          detailedProducts.push(detail);
          log(`Scraped detail: ${detail.title} (${detailedProducts.length}/${allProductUrls.length})`);
        }
        await delay(CONFIG.DELAY_MS);
      })
    );
    await Promise.all(tasks);

    await importProducts(detailedProducts, { categoryMap, brandMap });

    log('====== Migration Complete ======');
    log(`Categories: ${categories.length}`);
    log(`Brands: ${brands.length}`);
    log(`Banners: ${banners.length}`);
    log(`Products: ${detailedProducts.length}`);
  } catch (err) {
    logError('Migration failed', err);
    process.exitCode = 1;
  } finally {
    await closeBrowser();
    await pool.end();
  }
}

run();
