import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS phone     TEXT;
ALTER TABLE orders    ADD COLUMN IF NOT EXISTS status    TEXT DEFAULT 'pending';
`;

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Phase 5 migration complete.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Phase 5 migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
