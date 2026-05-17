import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
CREATE TABLE IF NOT EXISTS payment_methods (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(50)  UNIQUE NOT NULL,
  description TEXT,
  icon_type   VARCHAR(50)  DEFAULT 'card',
  is_active   BOOLEAN      DEFAULT true,
  sort_order  INT          DEFAULT 0,
  created_at  TIMESTAMPTZ  DEFAULT now()
);

INSERT INTO payment_methods (name, code, description, icon_type, sort_order)
VALUES
  ('Online Payment', 'razorpay', 'UPI · Cards · Net Banking · Wallets via Razorpay', 'card', 1),
  ('Cash on Delivery', 'cod', 'Pay with cash when your order arrives', 'cash', 2)
ON CONFLICT (code) DO NOTHING;
`;

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Payment methods migration complete — payment_methods table created with default entries.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Payment methods migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
