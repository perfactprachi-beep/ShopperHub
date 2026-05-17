import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const client = await pool.connect();

try {
  await client.query('BEGIN');

  // Parent categories
  const { rows: parentCats } = await client.query(`
    INSERT INTO categories (name, slug, sort_order) VALUES
      ('Men',    'men',    1),
      ('Women',  'women',  2),
      ('Kids',   'kids',   3),
      ('Beauty', 'beauty', 4),
      ('Home',   'home',   5)
    ON CONFLICT (slug) DO NOTHING
    RETURNING id, slug
  `);

  const menId = parentCats.find(c => c.slug === 'men')?.id;

  // Sub-categories under Men
  if (menId) {
    await client.query(`
      INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
        ('Shirts',   'men-shirts',   $1, 1),
        ('Jeans',    'men-jeans',    $1, 2),
        ('Footwear', 'men-footwear', $1, 3)
      ON CONFLICT (slug) DO NOTHING
    `, [menId]);
  }

  // Brands
  await client.query(`
    INSERT INTO brands (name, slug, description) VALUES
      ('Allen Solly', 'allen-solly', 'Premium casual and formal wear brand'),
      ('AND',         'and',         'Contemporary women''s fashion brand'),
      ('Stop',        'stop',        'ShoppersHub private label')
    ON CONFLICT (slug) DO NOTHING
  `);

  // Admin user
  const passwordHash = await bcrypt.hash('Admin@1234', 12);
  await client.query(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('admin@shoppersstop.com', $1, 'Super Admin', 'admin')
    ON CONFLICT (email) DO NOTHING
  `, [passwordHash]);

  await client.query('COMMIT');
  console.log('Seed complete.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
