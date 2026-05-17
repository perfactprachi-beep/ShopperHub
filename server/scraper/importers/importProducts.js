import { pool } from '../../src/db/pool.js';
import { log, logError } from '../utils/logger.js';

export async function importProducts(products, { categoryMap, brandMap }) {
  log(`Importing ${products.length} products to DB...`);
  let success = 0;
  let failed = 0;

  for (const product of products) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const categoryId = categoryMap[product.category] || categoryMap[product.categoryName] || null;
      const brandId = brandMap[product.brand] || null;

      if (!product.title) {
        await client.query('ROLLBACK');
        failed += 1;
        continue;
      }

      const {
        rows: [prod],
      } = await client.query(
        `INSERT INTO products
          (title, slug, brand_id, category_id, description, gender, base_price, discount_pct, stock, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active')
         ON CONFLICT (slug) DO UPDATE
           SET title = EXCLUDED.title,
               base_price = EXCLUDED.base_price,
               discount_pct = EXCLUDED.discount_pct
         RETURNING id`,
        [
          product.title,
          product.slug,
          brandId,
          categoryId,
          product.description,
          product.gender || 'unisex',
          product.basePrice || 0,
          product.discountPct || 0,
          product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 10,
        ]
      );

      await client.query('DELETE FROM product_variants WHERE product_id = $1', [prod.id]);
      for (const variant of product.variants || []) {
        await client.query(
          `INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (sku) DO NOTHING`,
          [prod.id, variant.size, variant.color, variant.sku, variant.stock, variant.extra_price]
        );
      }

      await client.query('DELETE FROM product_images WHERE product_id = $1', [prod.id]);
      for (const img of product.images || []) {
        await client.query(
          `INSERT INTO product_images (product_id, url, is_primary, sort_order)
           VALUES ($1,$2,$3,$4)`,
          [prod.id, img.url, img.is_primary, img.sort_order]
        );
      }

      await client.query('COMMIT');
      success += 1;
      log(`  Product: ${product.title} (id: ${prod.id})`);
    } catch (err) {
      await client.query('ROLLBACK');
      logError(`  Product failed: ${product.title}`, err);
      failed += 1;
    } finally {
      client.release();
    }
  }

  log(`Products import done: ${success} success, ${failed} failed`);
}
