import { pool } from '../../src/db/pool.js';
import { log } from '../utils/logger.js';

export async function importCategories(categories) {
  log('Importing categories to DB...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const parentMap = {};

    for (const cat of categories.filter((c) => !c.parentName)) {
      const { rows } = await client.query(
        `INSERT INTO categories (name, slug, parent_id, sort_order)
         VALUES ($1, $2, NULL, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [cat.name, cat.slug, 0]
      );
      parentMap[cat.name] = rows[0].id;
      log(`  Category: ${cat.name} (id: ${rows[0].id})`);
    }

    for (const cat of categories.filter((c) => c.parentName)) {
      const parentId = parentMap[cat.parentName];
      if (!parentId) continue;
      const { rows } = await client.query(
        `INSERT INTO categories (name, slug, parent_id, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id
         RETURNING id`,
        [cat.name, cat.slug, parentId, 1]
      );
      log(`  Sub-category: ${cat.name} under ${cat.parentName} (id: ${rows[0].id})`);
    }

    await client.query('COMMIT');
    log(`Categories import done: ${categories.length} records`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
