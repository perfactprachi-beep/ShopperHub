import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

await pool.query(`
  ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
`);

console.log('Migration complete: addresses.is_deleted added');
await pool.end();
