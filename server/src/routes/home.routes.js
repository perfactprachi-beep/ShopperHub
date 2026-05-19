import { Router } from 'express';
import { pool } from '../db/pool.js';
import { getActiveBanners } from '../db/queries/banners.js';
import { searchProducts } from '../db/queries/products.js';

const router = Router();

const PRODUCT_FIELDS = `
  p.id, p.title, p.slug, p.base_price, p.discount_pct, p.gender, p.stock,
  b.name AS brand_name, b.slug AS brand_slug,
  (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url
`;

router.get('/', async (_req, res, next) => {
  try {
    const [
      banners,
      collectionBannersResult,
      catResult,
      trendingResult,
      brandResult,
      newArrivalsResult,
      dealsResult,
      luxeResult,
      recommendedResult,
      fragranceBrandsResult,
      watchBrandsResult,
      ethnicBrandsResult,
    ] = await Promise.all([
      getActiveBanners(),

      // Shop the Collection cards (position='collection')
      pool.query(`
        SELECT id, title, image_url, link
        FROM banners
        WHERE position = 'collection' AND is_active = true
        ORDER BY sort_order
      `),

      // Top-level categories for "Shop by Category"
      pool.query(`
        SELECT id, name, slug, image_url
        FROM categories
        WHERE parent_id IS NULL
        ORDER BY sort_order, name
        LIMIT 9
      `),

      // Trending Now grid
      pool.query(`
        SELECT DISTINCT ON (c.name) c.id, c.name, c.slug, c.image_url
        FROM categories c
        LEFT JOIN categories p ON p.id = c.parent_id
        WHERE c.name = ANY(ARRAY[
          'T-Shirts','Jeans','Dresses & Jumpsuits','Watches',
          'Handbags & Accessories','Kurtas & Kurtis','Skincare','Fragrances',
          'Western Wear','Footwear'
        ])
        AND c.image_url IS NOT NULL
        ORDER BY
          c.name,
          CASE WHEN c.name = 'Footwear' AND LOWER(COALESCE(p.name,'')) = 'women' THEN 0 ELSE 1 END,
          c.sort_order
        LIMIT 8
      `),

      // Top Brands strip
      pool.query(`
        SELECT id, name, slug, logo_url
        FROM brands
        WHERE logo_url IS NOT NULL
        ORDER BY name
        LIMIT 16
      `),

      // New Arrivals
      pool.query(`
        SELECT ${PRODUCT_FIELDS}
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT 12
      `),

      // Top Deals
      pool.query(`
        SELECT ${PRODUCT_FIELDS}
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active' AND p.is_deal = true
        ORDER BY p.discount_pct DESC, p.created_at DESC
        LIMIT 12
      `),

      // Luxe Collection
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

      // Recommended
      pool.query(`
        SELECT ${PRODUCT_FIELDS}
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active' AND p.discount_pct >= 10
        ORDER BY p.discount_pct DESC, p.id % 17
        LIMIT 12
      `),

      // Fragrance & Beauty brands
      pool.query(`
        SELECT DISTINCT br.id, br.name, br.slug, br.logo_url
        FROM brands br
        JOIN products p ON p.brand_id = br.id
        JOIN categories c ON c.id = p.category_id
        WHERE p.status = 'active'
          AND (LOWER(c.name) LIKE '%fragrance%' OR LOWER(c.name) LIKE '%skin%' OR LOWER(c.name) LIKE '%beauty%')
        ORDER BY br.name
        LIMIT 10
      `),

      // Watch brands
      pool.query(`
        SELECT DISTINCT br.id, br.name, br.slug, br.logo_url
        FROM brands br
        JOIN products p ON p.brand_id = br.id
        JOIN categories c ON c.id = p.category_id
        WHERE p.status = 'active'
          AND LOWER(c.name) LIKE '%watch%'
        ORDER BY br.name
        LIMIT 10
      `),

      // Ethnic & Festive brands
      pool.query(`
        SELECT DISTINCT br.id, br.name, br.slug, br.logo_url
        FROM brands br
        JOIN products p ON p.brand_id = br.id
        JOIN categories c ON c.id = p.category_id
        WHERE p.status = 'active'
          AND (LOWER(c.name) LIKE '%kurta%' OR LOWER(c.name) LIKE '%ethnic%' OR LOWER(c.name) LIKE '%salwar%')
        ORDER BY br.name
        LIMIT 10
      `),
    ]);

    res.json({
      success: true,
      data: {
        banners,
        collectionBanners: collectionBannersResult.rows,
        featuredCategories: catResult.rows,
        trendingCategories: trendingResult.rows,
        brands: brandResult.rows,
        newArrivals: newArrivalsResult.rows,
        deals: dealsResult.rows,
        luxeProducts: luxeResult.rows,
        recommended: recommendedResult.rows,
        brandStrips: {
          fragrances: fragranceBrandsResult.rows,
          watches: watchBrandsResult.rows,
          ethnic: ethnicBrandsResult.rows,
        },
      },
    });
  } catch (err) { next(err); }
});

// ── Search suggestions ────────────────────────────────────────────────────────
router.get('/search/suggestions', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    let products;
    if (q.length >= 2) {
      products = await searchProducts(q, 10);
    } else {
      const { rows } = await pool.query(`
        SELECT p.id, p.title, p.slug, p.base_price, p.discount_pct,
               b.name AS brand_name,
               (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image_url
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        WHERE p.status = 'active' AND p.discount_pct > 0
        ORDER BY p.discount_pct DESC, p.created_at DESC
        LIMIT 10
      `);
      products = rows;
    }
    res.json({ success: true, data: { products } });
  } catch (err) { next(err); }
});

export default router;
