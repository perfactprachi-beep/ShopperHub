import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const schemaSql = `
-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  location        TEXT NOT NULL,
  manager_name    TEXT,
  contact_number  TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id                    SERIAL PRIMARY KEY,
  product_id            INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id            INT REFERENCES product_variants(id) ON DELETE CASCADE,
  warehouse_id          INT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  sku                   TEXT,
  stock_quantity        INT DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity     INT DEFAULT 0 CHECK (reserved_quantity >= 0),
  low_stock_threshold   INT DEFAULT 10,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, variant_id, warehouse_id)
);

-- Inventory logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id            SERIAL PRIMARY KEY,
  inventory_id  INT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  action_type   TEXT NOT NULL CHECK (action_type IN ('stock_added', 'stock_removed', 'order_deduction', 'return_restock', 'manual_update', 'transfer')),
  quantity      INT NOT NULL,
  admin_id      INT REFERENCES users(id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(stock_quantity, low_stock_threshold);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_inventory_id ON inventory_logs(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);

-- Trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_warehouses_updated_at') THEN
    CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inventory_updated_at') THEN
    CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
`;

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(schemaSql);
  console.log('Tables created (or already exist).');

  // ── Seed warehouses ────────────────────────────────────────────────────────
  const { rows: whCount } = await client.query('SELECT COUNT(*) FROM warehouses');
  if (parseInt(whCount[0].count, 10) === 0) {
    await client.query(`
      INSERT INTO warehouses (name, location, manager_name, contact_number) VALUES
        ('Mumbai Central Warehouse', 'Lower Parel, Mumbai, Maharashtra 400013', 'Rakesh Sharma',  '9876543210'),
        ('Ahmedabad Fulfilment Hub', 'GIDC Naroda, Ahmedabad, Gujarat 382330',  'Mehul Patel',    '9988776655'),
        ('Delhi NCR Dispatch Centre','Udyog Vihar, Gurugram, Haryana 122022',    'Ananya Kapoor',  '9111222333')
    `);
    console.log('Seeded 3 warehouses.');
  } else {
    console.log('Warehouses already seeded — skipping.');
  }

  // ── Seed inventory from product_variants ──────────────────────────────────
  const { rows: invCount } = await client.query('SELECT COUNT(*) FROM inventory');
  if (parseInt(invCount[0].count, 10) === 0) {
    const { rows: wh } = await client.query('SELECT id FROM warehouses ORDER BY id');
    const wIds = wh.map(r => r.id);

    const { rows: variants } = await client.query(
      'SELECT id, product_id, sku, stock FROM product_variants ORDER BY product_id, id'
    );

    if (variants.length && wIds.length) {
      const vals = variants.map((v, i) => {
        const wId = wIds[i % wIds.length];
        const qty = Math.max(0, v.stock || 0);
        const threshold = qty > 0 ? Math.max(3, Math.floor(qty * 0.2)) : 5;
        const sku = v.sku ? v.sku.replace(/'/g, "''") : `INV-${v.id}`;
        return `(${v.product_id}, ${v.id}, ${wId}, '${sku}', ${qty}, ${threshold})`;
      });

      await client.query(
        `INSERT INTO inventory (product_id, variant_id, warehouse_id, sku, stock_quantity, low_stock_threshold)
         VALUES ${vals.join(',\n')}
         ON CONFLICT (product_id, variant_id, warehouse_id) DO NOTHING`
      );
      console.log(`Seeded ${vals.length} inventory records.`);
    }

    // ── Seed inventory logs ──────────────────────────────────────────────────
    const { rows: adminRows } = await client.query(
      "SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1"
    );
    const adminId = adminRows[0]?.id || null;

    const { rows: invRows } = await client.query('SELECT id FROM inventory ORDER BY id LIMIT 15');

    if (invRows.length) {
      const logTypes = ['stock_added', 'manual_update', 'return_restock', 'stock_added', 'manual_update'];
      const logQtys  = [100, -5, 10, 50, -3];
      const logNotes = [
        'Initial stock received from supplier',
        'Manual correction after audit',
        'Customer return restocked',
        'Restocked from vendor delivery',
        'Damaged goods removed'
      ];

      const logVals = invRows.map((r, i) => {
        const t = logTypes[i % logTypes.length];
        const q = logQtys[i % logQtys.length];
        const n = logNotes[i % logNotes.length].replace(/'/g, "''");
        const a = adminId ? adminId : 'NULL';
        return `(${r.id}, '${t}', ${q}, ${a}, '${n}')`;
      });

      await client.query(
        `INSERT INTO inventory_logs (inventory_id, action_type, quantity, admin_id, notes)
         VALUES ${logVals.join(',\n')}`
      );
      console.log(`Seeded ${logVals.length} inventory log records.`);
    }
  } else {
    console.log('Inventory already has data — skipping seed.');
  }

  await client.query('COMMIT');
  console.log('Inventory migration + seed complete.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Inventory migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
