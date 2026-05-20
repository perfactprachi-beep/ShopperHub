import 'dotenv/config';
import { pool } from './pool.js';

async function migrate() {
  console.log('Adding sub_category_id to products...');

  await pool.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category_id INT REFERENCES categories(id)
  `);
  console.log('Column added.');

  // For products whose category_id points to a child category (has parent_id),
  // move category_id → sub_category_id and set category_id = parent.
  const { rowCount } = await pool.query(`
    UPDATE products p
    SET
      sub_category_id = p.category_id,
      category_id     = c.parent_id
    FROM categories c
    WHERE c.id = p.category_id
      AND c.parent_id IS NOT NULL
  `);
  console.log(`Migrated ${rowCount} products.`);

  await pool.end();
  console.log('Done.');
}

migrate().catch(err => { console.error(err); process.exit(1); });
