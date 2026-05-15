import { Router } from 'express';
import { pool } from '../db/pool.js';
import { getActiveBanners } from '../db/queries/banners.js';

const router = Router();

const PRODUCT_FIELDS = `
  p.id, p.title, p.slug, p.base_price, p.discount_pct, p.gender, p.stock,
  b.name AS brand_name, b.slug AS brand_slug,
  (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url
`;

router.get('/', async (_req, res, next) => {
  try {
    const [banners, catResult, brandResult, newArrivalsResult, dealsResult] = await Promise.all([
      getActiveBanners(),
      pool.query(`
        SELECT id, name, slug, image_url
        FROM categories
        WHERE parent_id IS NULL
        ORDER BY sort_order, name
        LIMIT 6
      `),
      pool.query(`
        SELECT id, name, slug, logo_url
        FROM brands
        ORDER BY name
        LIMIT 8
      `),
      pool.query(`
        SELECT ${PRODUCT_FIELDS}
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT 8
      `),
      pool.query(`
        SELECT ${PRODUCT_FIELDS}
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active' AND p.discount_pct >= 30
        ORDER BY p.discount_pct DESC
        LIMIT 8
      `),
    ]);

    res.json({
      success: true,
      data: {
        banners,
        featuredCategories: catResult.rows,
        brands: brandResult.rows,
        newArrivals: newArrivalsResult.rows,
        deals: dealsResult.rows,
      },
    });
  } catch (err) { next(err); }
});

export default router;
