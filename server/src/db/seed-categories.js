import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Category tree ──────────────────────────────────────────────────────────────
// Format: { name, children?: [] }
const TREE = [
  {
    name: 'Men', children: [
      { name: 'Casual Wear', children: [
        'T-Shirts', 'Polos', 'Shirts', 'Sweatshirts & Pullovers',
        'Jackets', 'Jeans', 'Casual Trousers & Chinos', 'Shorts',
        'Cargos Track Pants & Joggers', 'Co-Ords',
      ]},
      { name: 'Formal Wear', children: [
        'Shirts', 'Trousers', 'Suit Sets', 'Blazers & Coats',
      ]},
      { name: 'Athleisure', children: [
        'Active T-Shirts', 'Jackets & Sweatshirts', 'Shorts',
        'Track Pants & Joggers', 'Cargos', 'Tracksuits & Sets',
      ]},
      { name: 'Innerwear & Sleepwear', children: [
        'Vests', 'Loungewear T-Shirts', 'Shorts Pyjamas & Loose Pants', 'Briefs & Trunks',
      ]},
      { name: 'Indian & Festive Wear', children: [
        'Kurtas', 'Kurta Sets', 'Nehru Jackets', 'Dhotis & Pyjamas',
      ]},
      { name: 'Winterwear', children: [
        'Sweaters & Cardigans', 'Sweatshirts & Pullovers', 'Jackets & Coats', 'Thermals',
      ]},
      { name: 'Footwear', children: [
        'Casual Shoes & Loafers', 'Sports Shoes', 'Formal Shoes',
        'Sandals & Floaters', 'Flip Flops & Sliders', 'Boots', 'Socks',
      ]},
      { name: 'Watches', children: [
        'Smart Watches & Fitness Bands', 'Analog Watches', 'Chronograph Watches', 'Digital Watches',
      ]},
      { name: 'Accessories', children: [
        'Belts', 'Caps & Hats', 'Handkerchiefs', 'Wallets', 'Sunglasses', 'Ties & Pocket Squares',
      ]},
    ],
  },
  {
    name: 'Women', children: [
      { name: 'Western Wear', children: [
        'Tops & T-Shirts', 'Shirts & Blouses', 'Sweatshirts & Hoodies',
        'Jackets & Coats', 'Jeans', 'Trousers & Palazzos', 'Shorts & Skirts', 'Co-Ord Sets',
      ]},
      { name: 'Ethnic Wear', children: [
        'Kurtas & Kurtis', 'Kurta Sets', 'Sarees', 'Lehengas',
        'Salwar Suits', 'Dupattas & Stoles', 'Ethnic Jackets',
      ]},
      { name: 'Dresses & Jumpsuits', children: [
        'Casual Dresses', 'Party Dresses', 'Maxi Dresses', 'Jumpsuits & Playsuits',
      ]},
      { name: 'Activewear', children: [
        'Sports Tops', 'Sports Bras', 'Yoga Pants & Leggings', 'Track Pants', 'Joggers',
      ]},
      { name: 'Innerwear & Sleepwear', children: [
        'Bras', 'Panties', 'Nightwear & Loungewear', 'Shapewear',
      ]},
      { name: 'Winterwear', children: [
        'Sweaters & Cardigans', 'Sweatshirts', 'Jackets & Coats', 'Shawls & Wraps',
      ]},
      { name: 'Footwear', children: [
        'Heels', 'Flats & Ballerinas', 'Sneakers', 'Boots',
        'Sandals', 'Ethnic Footwear', 'Sports Shoes',
      ]},
      { name: 'Handbags & Accessories', children: [
        'Handbags', 'Clutches', 'Backpacks', 'Wallets',
        'Belts', 'Sunglasses', 'Scarves & Stoles', 'Jewellery',
      ]},
    ],
  },
  {
    name: 'Kids', children: [
      { name: 'Boys Clothing', children: [
        'T-Shirts & Polos', 'Shirts', 'Jeans & Trousers', 'Shorts',
        'Ethnic Wear', 'Sportswear', 'Innerwear & Socks',
      ]},
      { name: 'Girls Clothing', children: [
        'Tops & T-Shirts', 'Dresses & Frocks', 'Ethnic Wear',
        'Jeans & Trousers', 'Skirts', 'Sportswear', 'Innerwear & Socks',
      ]},
      { name: 'Kids Footwear', children: [
        'Casual Shoes', 'School Shoes', 'Sports Shoes', 'Sandals & Floaters', 'Boots',
      ]},
      { name: 'Infants & Toddlers', children: [
        'Bodysuits & Rompers', 'Sleepwear', 'Sets & Combos', 'Innerwear',
      ]},
      { name: 'Kids Accessories', children: [
        'Bags & Backpacks', 'Caps & Hats', 'Sunglasses', 'Watches',
      ]},
    ],
  },
  {
    name: 'Beauty', children: [
      'Skincare', 'Haircare', 'Makeup', 'Fragrances', 'Bath & Body', 'Nail Care',
    ],
  },
  {
    name: 'Luxe', slug: 'luxe', children: [
      { name: 'Watches', slug: 'luxe-watches', children: [
        { name: 'Tissot',         slug: 'luxe-watches-tissot' },
        { name: 'Michael Kors',   slug: 'luxe-watches-michael-kors' },
        { name: 'Coach',          slug: 'luxe-watches-coach' },
        { name: 'Emporio Armani', slug: 'luxe-watches-emporio-armani' },
        { name: 'GUESS',          slug: 'luxe-watches-guess' },
      ]},
      { name: 'Sunglasses', slug: 'luxe-sunglasses', children: [
        { name: 'Tom Ford', slug: 'luxe-sunglasses-tom-ford' },
        { name: 'Rayban',   slug: 'luxe-sunglasses-rayban' },
        { name: 'GUESS',    slug: 'luxe-sunglasses-guess' },
        { name: 'CARRERA',  slug: 'luxe-sunglasses-carrera' },
      ]},
      { name: 'Handbags', slug: 'luxe-handbags', children: [
        { name: 'ALDO',        slug: 'luxe-handbags-aldo' },
        { name: 'STEVE MADDEN',slug: 'luxe-handbags-steve-madden' },
        { name: 'GUESS',       slug: 'luxe-handbags-guess' },
        { name: 'HIDESIGN',    slug: 'luxe-handbags-hidesign' },
      ]},
      { name: 'Jewellery', slug: 'luxe-jewellery', children: [
        { name: 'Swarovski',  slug: 'luxe-jewellery-swarovski' },
        { name: 'Michael Kors', slug: 'luxe-jewellery-michael-kors' },
      ]},
      { name: 'Fragrances', slug: 'luxe-fragrances', children: [
        { name: 'Giorgio Armani', slug: 'luxe-fragrances-giorgio-armani' },
        { name: 'Versace',        slug: 'luxe-fragrances-versace' },
        { name: 'Burberry',       slug: 'luxe-fragrances-burberry' },
      ]},
      { name: 'Skin Care', slug: 'luxe-skin-care', children: [
        { name: 'Shiseido',       slug: 'luxe-skin-care-shiseido' },
        { name: 'Clarins',        slug: 'luxe-skin-care-clarins' },
        { name: 'Elizabeth Arden',slug: 'luxe-skin-care-elizabeth-arden' },
      ]},
      { name: 'Makeup', slug: 'luxe-makeup', children: [
        { name: 'Estee Lauder', slug: 'luxe-makeup-estee-lauder' },
        { name: 'Bobbi Brown',  slug: 'luxe-makeup-bobbi-brown' },
        { name: 'M.A.C',        slug: 'luxe-makeup-mac' },
        { name: 'Smashbox',     slug: 'luxe-makeup-smashbox' },
        { name: 'NARS',         slug: 'luxe-makeup-nars' },
        { name: 'Clinique',     slug: 'luxe-makeup-clinique' },
      ]},
    ],
  },
];

// ── Seed ───────────────────────────────────────────────────────────────────────
async function upsert(name, slugOverride, parentId, sortOrder) {
  const s = slugOverride || slug(name);
  const { rows } = await pool.query(
    `INSERT INTO categories (name, slug, parent_id, sort_order)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (slug) DO UPDATE SET name=$1, parent_id=$3, sort_order=$4
     RETURNING id`,
    [name, s, parentId || null, sortOrder]
  );
  return rows[0].id;
}

async function seedNode(node, parentId, sort, slugPrefix) {
  const name     = typeof node === 'string' ? node : node.name;
  const nodeSlug = typeof node === 'object' && node.slug
    ? node.slug
    : slugPrefix
      ? `${slugPrefix}-${slug(name)}`
      : slug(name);
  const id = await upsert(name, nodeSlug, parentId, sort);
  if (typeof node === 'object' && node.children) {
    for (let i = 0; i < node.children.length; i++) {
      await seedNode(node.children[i], id, i, slugPrefix ? nodeSlug : null);
    }
  }
  return id;
}

const client = await pool.connect();
try {
  await client.query('BEGIN');
  for (let i = 0; i < TREE.length; i++) {
    await seedNode(TREE[i], null, i, null);
    console.log(`✓ ${TREE[i].name}`);
  }
  await client.query('COMMIT');
  console.log('\nAll categories seeded successfully.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
