import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(stock_quantity, low_stock_threshold);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_inventory_id ON inventory_logs(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default warehouse if none exists
INSERT INTO warehouses (name, location, manager_name, contact_number)
SELECT 'Main Warehouse', 'Default Location', 'System Admin', '0000000000'
WHERE NOT EXISTS (SELECT 1 FROM warehouses);
`;

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Inventory module migration complete — warehouses, inventory, and inventory_logs tables created.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Inventory migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}