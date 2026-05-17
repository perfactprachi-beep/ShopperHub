import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS express_eligible       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS store_pickup_eligible  BOOLEAN DEFAULT FALSE;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'standard';

-- ── Express Delivery & Store Pickup ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stores (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  city       TEXT NOT NULL,
  state      TEXT NOT NULL,
  address    TEXT NOT NULL,
  pincode    TEXT NOT NULL,
  lat        NUMERIC(10,7),
  lng        NUMERIC(10,7),
  phone      TEXT,
  timing     TEXT DEFAULT '10:00 AM – 10:00 PM',
  is_active  BOOL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO stores (name, city, state, address, pincode, lat, lng) VALUES
('Shoppers Stop - Phoenix Palladium',   'Mumbai',    'Maharashtra', 'Lower Parel, Mumbai',          '400013', 18.9944,  72.8303),
('Shoppers Stop - Inorbit Mall',        'Mumbai',    'Maharashtra', 'Malad West, Mumbai',           '400064', 19.1860,  72.8481),
('Shoppers Stop - Forum Mall',          'Bengaluru', 'Karnataka',   'Koramangala, Bengaluru',       '560095', 12.9348,  77.6101),
('Shoppers Stop - Garuda Mall',         'Bengaluru', 'Karnataka',   'Magrath Road, Bengaluru',      '560025', 12.9727,  77.6101),
('Shoppers Stop - Express Avenue',      'Chennai',   'Tamil Nadu',  'Royapettah, Chennai',          '600002', 13.0524,  80.2623),
('Shoppers Stop - Ambience Mall',       'Gurugram',  'Haryana',     'NH-8, Gurugram',               '122001', 28.5025,  77.0938),
('Shoppers Stop - Pacific Mall',        'Delhi',     'Delhi',       'Tagore Garden, Delhi',         '110027', 28.6669,  77.1036),
('Shoppers Stop - Quest Mall',          'Kolkata',   'West Bengal', 'Syed Amir Ali Ave, Kolkata',   '700017', 22.5434,  88.3540),
('Shoppers Stop - Phoenix Market City', 'Pune',      'Maharashtra', 'Nagar Road, Pune',             '411014', 18.5545,  73.9282),
('Shoppers Stop - Ahmedabad One',       'Ahmedabad', 'Gujarat',     'Vastrapur, Ahmedabad',         '380015', 23.0395,  72.5236)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS store_inventory (
  id         SERIAL PRIMARY KEY,
  store_id   INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  variant_id INT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  stock      INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, variant_id)
);
CREATE INDEX IF NOT EXISTS idx_store_inv_store   ON store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inv_variant ON store_inventory(variant_id);

INSERT INTO store_inventory (store_id, variant_id, stock)
SELECT s.id, pv.id, floor(random() * 15)::int
FROM stores s CROSS JOIN product_variants pv
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS express_pincodes (
  pincode      TEXT PRIMARY KEY,
  city         TEXT,
  is_express   BOOL DEFAULT true,
  delivery_hrs INT  DEFAULT 24
);

INSERT INTO express_pincodes (pincode, city, is_express, delivery_hrs) VALUES
('400001','Mumbai',true,24),    ('400013','Mumbai',true,24),
('400064','Mumbai',true,24),    ('110001','Delhi',true,24),
('110027','Delhi',true,24),     ('560001','Bengaluru',true,24),
('560095','Bengaluru',true,24), ('600001','Chennai',true,24),
('600002','Chennai',true,24),   ('380001','Ahmedabad',true,24),
('380015','Ahmedabad',true,24), ('411001','Pune',true,24),
('122001','Gurugram',true,24),  ('700001','Kolkata',true,24),
('500001','Hyderabad',true,24), ('302001','Jaipur',false,48),
('226001','Lucknow',false,48),  ('700017','Kolkata',true,24)
ON CONFLICT DO NOTHING;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'express_delivery'
    CHECK (delivery_method IN ('express_delivery','store_pickup')),
  ADD COLUMN IF NOT EXISTS store_id        INT  REFERENCES stores(id),
  ADD COLUMN IF NOT EXISTS pickup_status   TEXT DEFAULT NULL
    CHECK (pickup_status IN ('pending','ready','collected','expired')),
  ADD COLUMN IF NOT EXISTS pickup_pin      TEXT,
  ADD COLUMN IF NOT EXISTS expected_by     TIMESTAMPTZ;
`;

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Delivery migration complete.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Delivery migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
