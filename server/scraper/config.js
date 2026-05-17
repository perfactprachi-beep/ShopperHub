export const CONFIG = {
  BASE_URL: process.env.SCRAPER_BASE_URL || 'https://www.shoppersstop.com',
  DELAY_MS: Number(process.env.SCRAPER_DELAY_MS || 2500),
  MAX_CONCURRENT: Number(process.env.SCRAPER_MAX_CONCURRENT || 2),
  MAX_PRODUCTS: Number(process.env.SCRAPER_MAX_PRODUCTS || 100),
  PRODUCTS_PER_CAT: Number(process.env.SCRAPER_PRODUCTS_PER_CAT || 20),
  IMAGE_DIR: process.env.SCRAPER_IMAGE_DIR || 'uploads/scraped/images',
  LOG_FILE: process.env.SCRAPER_LOG_FILE || 'scraper/scrape.log',

  CATEGORY_SLUGS: [
    { name: 'Men', path: '/men' },
    { name: 'Women', path: '/women' },
    { name: 'Kids', path: '/kids' },
    { name: 'Beauty', path: '/beauty' },
    { name: 'Home', path: '/home-decor' },
  ],

  SCRAPE_SUBCATEGORIES: process.env.SCRAPER_SUBCATEGORIES !== 'false',
  IMAGE_WIDTH: Number(process.env.SCRAPER_IMAGE_WIDTH || 800),
  IMAGE_FORMAT: 'webp',
  IMAGE_QUALITY: Number(process.env.SCRAPER_IMAGE_QUALITY || 80),
};
