import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
`;

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('User status migration complete.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('User status migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
