import { pool } from '../../src/db/pool.js';
import { log } from '../utils/logger.js';

export async function importBrands(brands) {
  log('Importing brands to DB...');
  const brandMap = {};

  for (const brand of brands) {
    const { rows } = await pool.query(
      `INSERT INTO brands (name, slug, logo_url, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url
       RETURNING id`,
      [brand.name, brand.slug, brand.logo_url, brand.description]
    );
    brandMap[brand.name] = rows[0].id;
    log(`  Brand: ${brand.name} (id: ${rows[0].id})`);
  }

  log(`Brands import done: ${brands.length} records`);
  return brandMap;
}
