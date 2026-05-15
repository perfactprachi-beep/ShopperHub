import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verify connection on startup
const { rows } = await pool.query('SELECT NOW()');
console.log('DB connected at', rows[0].now);
