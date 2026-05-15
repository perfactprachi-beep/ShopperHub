import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  email            TEXT UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  full_name        TEXT,
  phone            TEXT,
  role             TEXT DEFAULT 'customer',
  first_citizen_points INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS addresses (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT,
  line1      TEXT,
  line2      TEXT,
  city       TEXT,
  state      TEXT,
  pincode    TEXT,
  is_default BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  parent_id  INT REFERENCES categories(id) ON DELETE SET NULL,
  image_url  TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS brands (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  logo_url    TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  brand_id     INT REFERENCES brands(id) ON DELETE SET NULL,
  category_id  INT REFERENCES categories(id) ON DELETE SET NULL,
  description  TEXT,
  gender       TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex')),
  base_price   NUMERIC(10, 2) NOT NULL,
  discount_pct INT DEFAULT 0,
  stock        INT DEFAULT 0,
  status       TEXT DEFAULT 'active',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id          SERIAL PRIMARY KEY,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        TEXT,
  color       TEXT,
  sku         TEXT UNIQUE,
  stock       INT DEFAULT 0,
  extra_price NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_images (
  id         SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     SMALLINT CHECK (rating BETWEEN 1 AND 5),
  body       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE TABLE IF NOT EXISTS wishlists (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id         SERIAL PRIMARY KEY,
  code       TEXT UNIQUE NOT NULL,
  type       TEXT CHECK (type IN ('flat', 'percent')),
  value      NUMERIC,
  min_order  NUMERIC DEFAULT 0,
  max_uses   INT,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active  BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  address_id        INT NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  coupon_id         INT REFERENCES coupons(id) ON DELETE SET NULL,
  subtotal          NUMERIC NOT NULL,
  discount          NUMERIC DEFAULT 0,
  shipping          NUMERIC DEFAULT 0,
  total             NUMERIC NOT NULL,
  points_earned     INT DEFAULT 0,
  status            TEXT DEFAULT 'pending',
  payment_method    TEXT,
  payment_status    TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity   INT NOT NULL,
  unit_price NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS banners (
  id         SERIAL PRIMARY KEY,
  title      TEXT,
  image_url  TEXT,
  link       TEXT,
  position   TEXT,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_title_gin
  ON products USING gin(to_tsvector('english', title));
`;

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Migration complete — all 13 tables created.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
