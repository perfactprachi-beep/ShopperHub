/**
 * Scans every product title for a known brand name and updates brand_id
 * where the title brand differs from the currently assigned brand.
 *
 * Run once:  node src/db/migrate-brand-mapping.js
 */
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    const { rows: brands } = await client.query(
      'SELECT id, name FROM brands ORDER BY LENGTH(name) DESC'
    );
    const { rows: products } = await client.query(
      'SELECT id, title, brand_id FROM products ORDER BY id'
    );

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      // Pad with spaces so "AND" doesn't match inside "Woodland" or "Sandals"
      const padded = ` ${product.title.toLowerCase()} `;

      const matched = brands.find((b) =>
        padded.includes(` ${b.name.toLowerCase()} `)
      );

      if (!matched) {
        skipped++;
        continue;
      }

      if (matched.id === product.brand_id) {
        skipped++;
        continue;
      }

      await client.query('UPDATE products SET brand_id = $1 WHERE id = $2', [
        matched.id,
        product.id,
      ]);

      console.log(
        `Updated: "${product.title}" → brand_id ${product.brand_id} → ${matched.id} (${matched.name})`
      );
      updated++;
    }

    console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
