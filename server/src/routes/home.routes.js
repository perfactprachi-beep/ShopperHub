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
    const [banners, catResult, trendingResult, brandResult, newArrivalsResult, dealsResult, luxeResult, recommendedResult] = await Promise.all([
      getActiveBanners(),
      pool.query(`
        SELECT id, name, slug, image_url
        FROM categories
        WHERE parent_id IS NULL
        ORDER BY sort_order, name
        LIMIT 6
      `),
      pool.query(`
        SELECT DISTINCT ON (name) id, name, slug, image_url
        FROM categories
        WHERE name = ANY(ARRAY[
          'T-Shirts','Jeans','Dresses & Jumpsuits','Watches',
          'Handbags & Accessories','Kurtas & Kurtis','Skincare','Fragrances',
          'Western Wear','Footwear'
        ])
        AND image_url IS NOT NULL
        ORDER BY name, sort_order
        LIMIT 8
      `),
      pool.query(`
        SELECT id, name, slug, logo_url
        FROM brands
        WHERE logo_url IS NOT NULL
        ORDER BY name
        LIMIT 12
      `),
      pool.query(`
        SELECT ${PRODUCT_FIELDS}
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT 12
      `),
      pool.query(`
        SELECT ${PRODUCT_FIELDS}
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active' AND p.is_deal = true
        ORDER BY p.discount_pct DESC, p.created_at DESC
        LIMIT 12
      `),
      pool.query(`
        SELECT ${PRODUCT_FIELDS}
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active'
          AND (
            p.category_id IN (SELECT id FROM categories WHERE slug LIKE 'luxe%')
            OR p.base_price >= 2000
          )
        ORDER BY p.base_price DESC
        LIMIT 12
      `),
      pool.query(`
        SELECT ${PRODUCT_FIELDS}
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active' AND p.discount_pct >= 10
        ORDER BY p.discount_pct DESC, p.id % 17
        LIMIT 12
      `),
    ]);

    res.json({
      success: true,
      data: {
        banners,
        featuredCategories: catResult.rows,
        trendingCategories: trendingResult.rows,
        brands: brandResult.rows,
        newArrivals: newArrivalsResult.rows,
        deals: dealsResult.rows,
        luxeProducts: luxeResult.rows,
        recommended: recommendedResult.rows,
      },
    });
  } catch (err) { next(err); }
});

export default router;
