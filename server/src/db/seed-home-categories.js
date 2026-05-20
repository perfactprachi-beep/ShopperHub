import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Home / HomeStop category tree (sourced from Shoppers Stop) ─────────────────
const HOME_TREE = {
  name: 'Home',
  children: [
    {
      name: 'Bedding', children: [
        { name: 'Bed Sheets', children: [
          'Single Bedsheet Sets', 'Double Bedsheet Sets', 'Fitted Bedsheets',
          'Bed In A Bag', 'Pillow Covers',
        ]},
        { name: 'Quilts Comforters & Dohars', slug: 'quilts-comforters', children: [
          'Comforters', 'Dohars', 'Blankets & Quilts',
          'Bed Covers', 'Duvet Covers',
        ]},
        { name: 'Pillows', children: [
          'Memory Foam Pillows', 'Pillow Covers',
        ]},
        'Covers & Protectors',
        'Diwan Sets',
      ],
    },
    {
      name: 'Bath & Laundry', children: [
        { name: 'Towels', children: [
          'Bath Towels', 'Hand Towels & Face Towels', 'Towel Sets',
        ]},
        'Bath Rugs & Mats',
        'Shower Curtains',
        'Bathroom Accessories',
        'Laundry Bags & Baskets',
      ],
    },
    {
      name: 'Living', children: [
        { name: 'Cushions & Covers', children: [
          'Cushion Sets', 'Cushion Fillers', 'Cushion Covers',
        ]},
        { name: 'Curtains', children: [
          'Window Curtains', 'Door Curtains',
        ]},
        { name: 'Floor Coverings', children: [
          'Door Mats', 'Carpets', 'Rugs', 'Runners',
        ]},
        'Sofa Covers & Throws',
        'Chair Pads',
        'Chair Covers',
        { name: 'Home Décor', slug: 'home-decor', children: [
          'Vases & Planters', 'Candles & Holders', 'Wall Art & Frames', 'Clocks',
        ]},
      ],
    },
    {
      name: 'Dining', children: [
        { name: 'Dinnerware', children: [
          'Dinner Sets', 'Dinner Plates', 'Quarter Plates & Side Plates',
          'Katoris & Bowls', 'Serving Bowls',
        ]},
        { name: 'Serveware', children: [
          'Platters', 'Cloches & Cake Stands', 'Bowls & Accessories',
        ]},
        { name: 'Table Tops', children: [
          'Trays', 'Condiment Sets', 'Coasters & Trivets', 'Tissue Box', 'Baskets',
        ]},
        { name: 'Cutlery', children: [
          'Spoons', 'Forks', 'Knives', 'Cutlery Stands', 'Cutlery Sets',
        ]},
        { name: 'Drinkware', children: [
          'Glasses & Tumblers', 'Mugs & Cups', 'Jugs & Carafes', 'Flasks & Bottles',
        ]},
      ],
    },
    {
      name: 'Kitchen', children: [
        { name: 'Cookware & Bakeware', children: [
          'Cookware Sets', 'Tawas', 'Pots & Pans', 'Fry Pans',
          'Kadai & Woks', 'Pressure Cookers', 'Bakeware',
        ]},
        { name: 'Food Preps & Tools', children: [
          'Chopping Boards', 'Knives & Graters', 'Oil & Spice', 'Kitchen Tools',
        ]},
        { name: 'Storage Solution', children: [
          'Containers & Jars', 'Casseroles', 'Lunch Boxes & Bags', 'Bins & Baskets',
        ]},
        { name: 'Table & Kitchen Linens', children: [
          'Aprons & Gloves', 'Kitchen Towels & Napkins', 'Table Runners & Mats',
        ]},
        { name: 'Kitchen Appliances', children: [
          'Breakfast Essentials', 'Mixer & Grinders', 'Kettles & Coffee Makers',
        ]},
      ],
    },
  ],
};

// ── Upsert helper ──────────────────────────────────────────────────────────────
async function upsert(name, slugVal, parentId, sortOrder) {
  const { rows } = await pool.query(
    `INSERT INTO categories (name, slug, parent_id, sort_order)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (slug) DO UPDATE SET name=$1, parent_id=$3, sort_order=$4
     RETURNING id`,
    [name, slugVal, parentId || null, sortOrder]
  );
  return rows[0].id;
}

async function seedNode(node, parentId, sort) {
  const name    = typeof node === 'string' ? node : node.name;
  const nodeSlug = typeof node === 'object' && node.slug ? node.slug : slug(name);
  const id = await upsert(name, nodeSlug, parentId, sort);
  if (typeof node === 'object' && node.children) {
    for (let i = 0; i < node.children.length; i++) {
      await seedNode(node.children[i], id, i);
    }
  }
  return id;
}

// ── Run ────────────────────────────────────────────────────────────────────────
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await seedNode(HOME_TREE, null, 10); // sort_order 10 puts Home after existing top-level categories
  await client.query('COMMIT');
  console.log('✓ Home categories seeded successfully.');
  console.log('  Run: node server/src/db/seed-home-categories.js');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
