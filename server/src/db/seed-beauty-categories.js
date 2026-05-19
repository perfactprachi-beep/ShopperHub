import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── SSBeauty category tree (sourced from Shoppers Stop) ───────────────────────
const BEAUTY_TREE = {
  name: 'Beauty',
  children: [
    {
      name: 'Makeup', children: [
        { name: 'Face', children: [
          'Face Primers', 'Color Correctors', 'Concealers', 'BB & CC Creams',
          'Tinted Moisturizers', 'Foundations', 'Compacts', 'Blushes', 'Bronzers',
          'Highlighters & Illuminators', 'Setting Sprays', 'Face Palettes & Sets',
          'Makeup Removers', 'Loose Powders',
        ]},
        { name: 'Eyes', children: [
          'Under Eye Concealers', 'Kajals', 'Eye Pencils', 'Eyeliners', 'Mascaras',
          'Eye Shadows', 'Eye Primers', 'Eye Palettes & Sets',
          'Eye Brow Enhancers', 'False Eyelashes', 'Eye Makeup Removers',
        ]},
        { name: 'Lips', children: [
          'Lip Liners', 'Lipsticks', 'Lip Glosses', 'Lip Stains & Tints', 'Lip Balms & Treatments',
        ]},
        { name: 'Nails', children: [
          'Nail Polishes', 'Nail Art', 'Nail Care & Tools',
        ]},
      ],
    },
    {
      name: 'Skin', children: [
        { name: 'Cleansers & Exfoliators', children: [
          'Face Washes', 'Scrubs & Exfoliators', 'Facial Wipes',
        ]},
        'Toners & Mists',
        { name: 'Moisturizers', children: [
          'Face Moisturizers & Day Creams', 'Night Creams', 'Face Oils', 'Face Serums',
        ]},
        'Eye Care',
        'Lip Care',
        'Masks & Treatments',
        'Sun Care',
        'Kits & Combos',
        { name: 'Beauty & Hair Accessories', children: [
          'Makeup Tools', 'Brushes', 'Manicure And Pedicure',
        ]},
      ],
    },
    {
      name: 'Hair', children: [
        'Shampoo & Conditioners',
        { name: 'Hair Treatments', children: [
          'Hair Masks', 'Hair Oils', 'Hair Serums', 'Scalp Treatments',
        ]},
        'Hair Styling',
        { name: 'Tools & Accessories', children: [
          'Hair Brushes & Combs', 'Hair Dryers', 'Straighteners & Flat Irons',
          'Multi Stylers', 'Hair Accessories',
        ]},
        { name: 'Mens Grooming', children: [
          { name: 'Shaving', children: [
            'Razors & Cartridges', 'Shavers', 'Shaving Creams', 'Shaving Foams',
            'Shaving Gels', 'Pre & Post Shaves', 'Aftershave Lotions', 'Shaving Brushes',
          ]},
          { name: 'Beard Care', slug: 'beard-care', children: [
            'Beard Oils', 'Beard Balms', 'Beard Wash', 'Beard Brushes',
          ]},
          { name: 'Skin Care', slug: 'mens-skin-care' },
          { name: 'Hair Care', slug: 'mens-hair-care' },
          { name: 'Body Care', slug: 'mens-body-care' },
          { name: 'Fragrances', slug: 'mens-fragrances' },
        ]},
      ],
    },
    {
      name: 'Personal Care', children: [
        { name: 'Bath & Shower', children: [
          'Body Washes & Shower Gels', 'Body Scrubs & Exfoliators', 'Soaps', 'Bath & Shower Sets',
        ]},
        { name: 'Body Care', children: [
          'Body Moisturizers', 'Body Lotions & Body Oils', 'Body Scrubbers & Brushes',
          'Cellulite & Stretch Marks',
        ]},
        { name: 'Hands & Feet', children: [
          'Handwashes', 'Hand Sanitizers', 'Hand Creams', 'Foot Creams', 'Tissue Boxes',
        ]},
        'Feminine Hygiene',
      ],
    },
    'Fragrances',
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
  const name     = typeof node === 'string' ? node : node.name;
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

  // Remove old flat children that are now superseded by the detailed tree
  // (Skincare, Haircare, Bath & Body, Nail Care — Makeup & Fragrances are kept/reused)
  await client.query(
    `DELETE FROM categories WHERE slug IN ('skincare', 'haircare', 'bath-body', 'nail-care')`
  );

  await seedNode(BEAUTY_TREE, null, 3); // sort_order 3 matches Beauty's position in TREE
  await client.query('COMMIT');
  console.log('✓ Beauty categories seeded successfully.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
