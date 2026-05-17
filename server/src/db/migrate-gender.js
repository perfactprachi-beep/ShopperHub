import { pool } from './pool.js';

async function migrate() {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;
  `);
  console.log('Migration: gender column added to users table');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
