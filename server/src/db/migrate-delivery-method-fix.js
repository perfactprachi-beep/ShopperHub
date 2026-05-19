import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query('BEGIN');

  // Drop old check constraint (auto-named by Postgres)
  await client.query(`
    ALTER TABLE orders
      DROP CONSTRAINT IF EXISTS orders_delivery_method_check
  `);

  // Add new constraint that includes standard_delivery
  await client.query(`
    ALTER TABLE orders
      ADD CONSTRAINT orders_delivery_method_check
      CHECK (delivery_method IN ('standard_delivery', 'express_delivery', 'store_pickup'))
  `);

  // Fix the default value too
  await client.query(`
    ALTER TABLE orders
      ALTER COLUMN delivery_method SET DEFAULT 'standard_delivery'
  `);

  // Fix any existing rows that have 'standard' (shouldn't be any but just in case)
  await client.query(`
    UPDATE orders SET delivery_method = 'standard_delivery'
    WHERE delivery_method NOT IN ('standard_delivery', 'express_delivery', 'store_pickup')
  `);

  await client.query('COMMIT');
  console.log('Migration complete: delivery_method constraint updated.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
