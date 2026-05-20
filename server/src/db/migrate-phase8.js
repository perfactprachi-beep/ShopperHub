import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(title,''))
    ) STORED;

CREATE INDEX IF NOT EXISTS products_search_idx ON products USING GIN(search_vector);
`;

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Phase 8 migration complete — search_vector column + index added.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Phase 8 migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
