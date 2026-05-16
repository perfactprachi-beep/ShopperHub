import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
`;

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Phase 7 migration complete.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Phase 7 migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
