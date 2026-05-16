-- ============================================================
-- Kids Products Seed — inspired by shoppersstop.com/category/kids
-- Categories used:
--   126 = Boys: T-Shirts & Polos  |  18 = Boys: Shorts  |  13 = Boys: Shirts
--   135 = Girls: Dresses & Frocks |  70 = Girls: Tops & T-Shirts | 128 = Girls: Jeans & Trousers
--    50 = Kids Footwear: Sports Shoes | 143 = School Shoes | 52 = Sandals & Floaters
--   148 = Infants: Bodysuits & Rompers | 150 = Infants: Sets & Combos
-- Brands: Stop(3) Allen Solly(1) AND(2) Puma(20) Adidas(19) Skechers(18) Life(17)
-- ============================================================

-- ── 1. Boys Graphic Print T-Shirt ────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Boys Graphic Print Round Neck T-Shirt',
  'boys-graphic-print-round-neck-t-shirt-puma',
  20, 126, 'kids', 699.00, 25,
  'Comfortable cotton-blend t-shirt featuring a bold graphic print on the front. Ribbed round neck and short sleeves. Ideal for casual everyday wear.',
  'active', 80
) RETURNING id;

-- ── 2. Boys Cargo Shorts ─────────────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Boys Cargo Shorts with Side Pockets',
  'boys-cargo-shorts-side-pockets-adidas',
  19, 18, 'kids', 799.00, 20,
  'Lightweight cargo shorts with multiple side pockets and an elasticated waistband. Great for school, play and outdoor activities.',
  'active', 60
) RETURNING id;

-- ── 3. Boys Checked Casual Shirt ─────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Boys Slim Fit Checked Casual Shirt',
  'boys-slim-fit-checked-casual-shirt-allen-solly',
  1, 13, 'kids', 999.00, 30,
  'Smart slim-fit shirt in a classic check pattern. Spread collar, full button placket, and curved hem. Perfect for casual outings and semi-formal occasions.',
  'active', 50
) RETURNING id;

-- ── 4. Boys Jogger Track Pants ────────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Boys Jogger Track Pants with Drawstring',
  'boys-jogger-track-pants-drawstring-puma',
  20, 126, 'kids', 899.00, 20,
  'Soft fleece jogger pants with ribbed cuffs, drawstring waist and side pockets. Ideal for sports, gym and casual wear.',
  'active', 70
) RETURNING id;

-- ── 5. Girls Floral Printed Dress ─────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Girls Floral Printed A-Line Dress',
  'girls-floral-printed-a-line-dress-and',
  2, 135, 'kids', 1299.00, 25,
  'Cute A-line dress with an all-over floral print. Features a round neck, short sleeves and a flared skirt. Made from breathable cotton fabric.',
  'active', 45
) RETURNING id;

-- ── 6. Girls Stripe T-Shirt ───────────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Girls Stripe Round Neck T-Shirt',
  'girls-stripe-round-neck-t-shirt-stop',
  3, 70, 'kids', 649.00, 20,
  'Vibrant stripe t-shirt in a soft cotton jersey fabric. Round neck, short sleeves and relaxed fit. A wardrobe essential for girls.',
  'active', 90
) RETURNING id;

-- ── 7. Girls Slim Fit Jeans ────────────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Girls Slim Fit Stretch Jeans',
  'girls-slim-fit-stretch-jeans-stop',
  3, 128, 'kids', 1099.00, 30,
  'Comfortable slim-fit jeans made from stretch denim. Five-pocket styling and an elasticated waistband for the perfect fit.',
  'active', 55
) RETURNING id;

-- ── 8. Girls Ethnic Kurta Set ─────────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Girls Festive Embroidered Kurta with Palazzo',
  'girls-festive-embroidered-kurta-palazzo-life',
  17, 78, 'kids', 1599.00, 25,
  'Beautiful festive kurta set with delicate embroidery on the yoke and hem. Paired with a matching palazzo for a complete ethnic look.',
  'active', 35
) RETURNING id;

-- ── 9. Kids Running Sports Shoes ──────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Kids Lightweight Running Sports Shoes',
  'kids-lightweight-running-sports-shoes-adidas',
  19, 50, 'kids', 2499.00, 20,
  'Breathable mesh upper with responsive cushioning sole. Lightweight design with lace-up closure. Suitable for running, sports and everyday active wear.',
  'active', 65
) RETURNING id;

-- ── 10. Kids School Shoes ─────────────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Kids Lace-Up Leather School Shoes',
  'kids-lace-up-leather-school-shoes-skechers',
  18, 143, 'kids', 1799.00, 15,
  'Durable school shoes with a genuine leather upper and cushioned insole. Slip-resistant sole for safety. Sturdy and comfortable for all-day wear.',
  'active', 80
) RETURNING id;

-- ── 11. Kids Casual Sandals ────────────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Kids Velcro Casual Sandals',
  'kids-velcro-casual-sandals-stop',
  3, 52, 'kids', 899.00, 25,
  'Comfy open-toe sandals with adjustable velcro straps and a cushioned footbed. Lightweight EVA sole perfect for summer and vacation wear.',
  'active', 70
) RETURNING id;

-- ── 12. Infant Cotton Romper Set ──────────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Infant Pure Cotton Printed Romper',
  'infant-pure-cotton-printed-romper-stop',
  3, 148, 'kids', 599.00, 20,
  'Super soft 100% cotton romper with snap buttons for easy diaper changes. Fun prints and bright colours make it a must-have for newborns.',
  'active', 100
) RETURNING id;

-- ── 13. Infant Clothing Sets & Combos ────────────────────────────────────
INSERT INTO products (title, slug, brand_id, category_id, gender, base_price, discount_pct, description, status, stock)
VALUES (
  'Infant 3-Piece Clothing Gift Set',
  'infant-3-piece-clothing-gift-set-stop',
  3, 150, 'kids', 999.00, 20,
  'Adorable 3-piece gift set including bodysuit, bib and booties. Made from gentle organic cotton. Ideal as a newborn gift.',
  'active', 60
) RETURNING id;

-- ============================================================
-- Product Images (Unsplash URLs)
-- ============================================================

-- Boys Graphic T-Shirt
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800', true
FROM products WHERE slug = 'boys-graphic-print-round-neck-t-shirt-puma';

INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800', false
FROM products WHERE slug = 'boys-graphic-print-round-neck-t-shirt-puma';

-- Boys Cargo Shorts
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800', true
FROM products WHERE slug = 'boys-cargo-shorts-side-pockets-adidas';

INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800', false
FROM products WHERE slug = 'boys-cargo-shorts-side-pockets-adidas';

-- Boys Checked Shirt
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800', true
FROM products WHERE slug = 'boys-slim-fit-checked-casual-shirt-allen-solly';

INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800', false
FROM products WHERE slug = 'boys-slim-fit-checked-casual-shirt-allen-solly';

-- Boys Jogger Track Pants
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800', true
FROM products WHERE slug = 'boys-jogger-track-pants-drawstring-puma';

-- Girls Floral Dress
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1471286174890-9c112ac6476a?w=800', true
FROM products WHERE slug = 'girls-floral-printed-a-line-dress-and';

INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800', false
FROM products WHERE slug = 'girls-floral-printed-a-line-dress-and';

-- Girls Stripe T-Shirt
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', true
FROM products WHERE slug = 'girls-stripe-round-neck-t-shirt-stop';

-- Girls Slim Jeans
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1617952986600-802f965dcdbc?w=800', true
FROM products WHERE slug = 'girls-slim-fit-stretch-jeans-stop';

-- Girls Ethnic Kurta
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1612812328099-f0e4b20c5adf?w=800', true
FROM products WHERE slug = 'girls-festive-embroidered-kurta-palazzo-life';

-- Kids Sports Shoes
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', true
FROM products WHERE slug = 'kids-lightweight-running-sports-shoes-adidas';

INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800', false
FROM products WHERE slug = 'kids-lightweight-running-sports-shoes-adidas';

-- Kids School Shoes
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800', true
FROM products WHERE slug = 'kids-lace-up-leather-school-shoes-skechers';

-- Kids Sandals
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800', true
FROM products WHERE slug = 'kids-velcro-casual-sandals-stop';

-- Infant Romper
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800', true
FROM products WHERE slug = 'infant-pure-cotton-printed-romper-stop';

INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800', false
FROM products WHERE slug = 'infant-pure-cotton-printed-romper-stop';

-- Infant Gift Set
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800', true
FROM products WHERE slug = 'infant-3-piece-clothing-gift-set-stop';

-- ============================================================
-- Variants (sizes per product)
-- ============================================================

-- Boys T-Shirt variants (sizes 4-5Y to 12-13Y)
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Multi', 'PUMA-BOYS-TEE-' || s.size, 20, 0
FROM products p, (VALUES ('4-5Y'),('6-7Y'),('8-9Y'),('10-11Y'),('12-13Y')) AS s(size)
WHERE p.slug = 'boys-graphic-print-round-neck-t-shirt-puma';

-- Boys Shorts variants
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Olive', 'ADI-BOYS-SHT-' || s.size, 15, 0
FROM products p, (VALUES ('4-5Y'),('6-7Y'),('8-9Y'),('10-11Y'),('12-13Y')) AS s(size)
WHERE p.slug = 'boys-cargo-shorts-side-pockets-adidas';

-- Boys Shirt variants
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Blue Check', 'AS-BOYS-SHIRT-' || s.size, 12, 0
FROM products p, (VALUES ('4-5Y'),('6-7Y'),('8-9Y'),('10-11Y'),('12-13Y')) AS s(size)
WHERE p.slug = 'boys-slim-fit-checked-casual-shirt-allen-solly';

-- Boys Joggers
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Black', 'PUMA-BOYS-JOG-' || s.size, 18, 0
FROM products p, (VALUES ('4-5Y'),('6-7Y'),('8-9Y'),('10-11Y'),('12-13Y')) AS s(size)
WHERE p.slug = 'boys-jogger-track-pants-drawstring-puma';

-- Girls Dress variants
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Floral Pink', 'AND-GIRLS-DRS-' || s.size, 10, 0
FROM products p, (VALUES ('4-5Y'),('6-7Y'),('8-9Y'),('10-11Y'),('12-13Y')) AS s(size)
WHERE p.slug = 'girls-floral-printed-a-line-dress-and';

-- Girls T-Shirt variants
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Stripe Multi', 'STOP-GIRLS-TEE-' || s.size, 22, 0
FROM products p, (VALUES ('4-5Y'),('6-7Y'),('8-9Y'),('10-11Y'),('12-13Y')) AS s(size)
WHERE p.slug = 'girls-stripe-round-neck-t-shirt-stop';

-- Girls Jeans variants
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Blue', 'STOP-GIRLS-JNS-' || s.size, 14, 0
FROM products p, (VALUES ('4-5Y'),('6-7Y'),('8-9Y'),('10-11Y'),('12-13Y')) AS s(size)
WHERE p.slug = 'girls-slim-fit-stretch-jeans-stop';

-- Girls Ethnic Kurta
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Pink Gold', 'LIFE-GIRLS-KRT-' || s.size, 8, 0
FROM products p, (VALUES ('4-5Y'),('6-7Y'),('8-9Y'),('10-11Y'),('12-13Y')) AS s(size)
WHERE p.slug = 'girls-festive-embroidered-kurta-palazzo-life';

-- Kids Sports Shoes variants (UK sizes 1-5)
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Black Red', 'ADI-KIDS-SPT-' || s.size, 15, 0
FROM products p, (VALUES ('UK 1'),('UK 2'),('UK 3'),('UK 4'),('UK 5')) AS s(size)
WHERE p.slug = 'kids-lightweight-running-sports-shoes-adidas';

-- Kids School Shoes
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Black', 'SKX-KIDS-SCH-' || s.size, 18, 0
FROM products p, (VALUES ('UK 1'),('UK 2'),('UK 3'),('UK 4'),('UK 5')) AS s(size)
WHERE p.slug = 'kids-lace-up-leather-school-shoes-skechers';

-- Kids Sandals
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Blue', 'STOP-KIDS-SND-' || s.size, 20, 0
FROM products p, (VALUES ('UK 1'),('UK 2'),('UK 3'),('UK 4'),('UK 5')) AS s(size)
WHERE p.slug = 'kids-velcro-casual-sandals-stop';

-- Infant Romper (age-based sizes)
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Yellow Print', 'STOP-INF-RMP-' || s.size, 25, 0
FROM products p, (VALUES ('0-3M'),('3-6M'),('6-9M'),('9-12M'),('12-18M')) AS s(size)
WHERE p.slug = 'infant-pure-cotton-printed-romper-stop';

-- Infant Gift Set
INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
SELECT id, s.size, 'Mint', 'STOP-INF-SET-' || s.size, 15, 0
FROM products p, (VALUES ('0-3M'),('3-6M'),('6-9M'),('9-12M')) AS s(size)
WHERE p.slug = 'infant-3-piece-clothing-gift-set-stop';
