import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query('BEGIN');

  await client.query(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS eyebrow TEXT`);
  await client.query(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle TEXT`);
  await client.query(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS align TEXT DEFAULT 'left'`);

  await client.query('COMMIT');
  console.log('Migration complete: banners table has eyebrow, subtitle, align columns.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
