import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function connectDB(retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { rows } = await pool.query('SELECT NOW()');
      console.log('DB connected at', rows[0].now);
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = 2000 * attempt;
      console.warn(`DB connection attempt ${attempt} failed — retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
