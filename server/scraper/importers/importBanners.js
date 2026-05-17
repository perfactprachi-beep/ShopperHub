import { pool } from '../../src/db/pool.js';
import { log } from '../utils/logger.js';

export async function importBanners(banners) {
  log('Importing banners to DB...');

  for (const banner of banners) {
    await pool.query(
      `INSERT INTO banners (title, image_url, link, position, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [banner.title, banner.image_url, banner.link, banner.position, banner.is_active, banner.sort_order]
    );
    log(`  Banner: ${banner.title}`);
  }

  log(`Banners import done: ${banners.length} records`);
}
