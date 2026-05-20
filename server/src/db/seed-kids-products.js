import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function slugify(title, suffix) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + suffix;
}

const client = await pool.connect();
const { rows: brands }     = await client.query('SELECT id, name FROM brands ORDER BY id');
const { rows: categories } = await client.query('SELECT id, name, slug FROM categories WHERE parent_id IS NOT NULL');

function brand(name) { return (brands.find(b => b.name === name) || brands[0]).id; }
function cat(slug)   { return (categories.find(c => c.slug === slug) || categories[0]).id; }

const IMG = {
  boytee:    'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800',
  boyshirt:  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
  boyjeans:  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
  boyshorts: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800',
  boysport:  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800',
  boyinner:  'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800',
  girltop:   'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800',
  girldress: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',
  girlskirt: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
  girljeans: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
  girlsport: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800',
  girlinner: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800',
  sneakers:  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  sandals:   'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
  boots:     'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800',
  bodysuit:  'https://images.unsplash.com/photo-1519089029353-5b78a2f58aef?w=800',
  romper:    'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800',
  babyset:   'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800',
  backpack:  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  cap:       'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
  sunglass:  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
  watch:     'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
};

const SIZES_KIDS_CLOTH = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'];
const SIZES_KIDS_SHOES = ['1', '2', '3', '4', '5'];
const SIZES_BABY       = ['0-3M', '3-6M', '6-9M', '9-12M'];
const SIZES_ONE        = ['One Size'];

function getSizes(img) {
  if (['sneakers', 'sandals', 'boots'].includes(img)) return SIZES_KIDS_SHOES;
  if (['bodysuit', 'romper', 'babyset'].includes(img)) return SIZES_BABY;
  if (['sunglass', 'cap', 'backpack', 'watch'].includes(img)) return SIZES_ONE;
  return SIZES_KIDS_CLOTH;
}

// cat slug → parent category slug
const PRODUCTS = [
  // ── Boys' Clothing ────────────────────────────────────────────────────────────
  { title: 'U.S. Polo Assn. Boys Polo Tee',       brand: 'U.S. Polo Assn.', catSlug: 'boys-clothing', price: 799,  disc: 20, img: 'boytee',   desc: 'Classic polo tee in pique cotton with signature embroidery.' },
  { title: 'Tommy Hilfiger Boys Graphic Tee',      brand: 'Tommy Hilfiger',  catSlug: 'boys-clothing', price: 1299, disc: 25, img: 'boytee',   desc: 'Fun graphic tee with bold Tommy logo print.' },
  { title: 'Allen Solly Boys Slim Shirt',          brand: 'Allen Solly',     catSlug: 'boys-clothing', price: 999,  disc: 20, img: 'boyshirt', desc: 'Smart casual slim-fit shirt for school and outings.' },
  { title: 'Peter England Boys Check Shirt',       brand: 'Peter England',   catSlug: 'boys-clothing', price: 899,  disc: 15, img: 'boyshirt', desc: 'Soft cotton check shirt with neat pocket detail.' },
  { title: "Levi's Boys Slim Jeans",               brand: "Levi's",          catSlug: 'boys-clothing', price: 1499, disc: 20, img: 'boyjeans', desc: 'Five-pocket slim jeans in soft stretch denim.' },
  { title: 'Wrangler Boys Regular Jeans',          brand: 'Wrangler',        catSlug: 'boys-clothing', price: 1199, disc: 25, img: 'boyjeans', desc: 'Classic straight-fit denim jeans for everyday wear.' },
  { title: 'Puma Boys Running Shorts',             brand: 'Puma',            catSlug: 'boys-clothing', price: 699,  disc: 20, img: 'boyshorts',desc: 'Lightweight dry-cell running shorts with side pockets.' },
  { title: 'Adidas Boys Training Shorts',          brand: 'Adidas',          catSlug: 'boys-clothing', price: 799,  disc: 15, img: 'boyshorts',desc: 'Breathable training shorts with elasticated waist.' },
  { title: 'Nike Boys Sportswear Tee',             brand: 'Nike',            catSlug: 'boys-clothing', price: 1099, disc: 20, img: 'boysport', desc: 'Dri-FIT crew-neck tee for active boys.' },
  { title: 'Reebok Boys Track Pant',               brand: 'Reebok',          catSlug: 'boys-clothing', price: 999,  disc: 25, img: 'boysport', desc: 'Slim-fit track pant with side stripes and drawstring waist.' },
  { title: 'Jockey Boys Trunk Pack',               brand: 'Jockey',          catSlug: 'boys-clothing', price: 499,  disc: 10, img: 'boyinner', desc: 'Pack of 3 ultra-soft cotton trunks.' },
  { title: 'Van Heusen Boys Chino',                brand: 'Van Heusen',      catSlug: 'boys-clothing', price: 1299, disc: 20, img: 'boyjeans', desc: 'Stretch-cotton slim chino in versatile colours.' },
  { title: 'Jack & Jones Boys Jogger',             brand: 'Jack & Jones',    catSlug: 'boys-clothing', price: 1099, disc: 20, img: 'boysport', desc: 'Casual jogger with ribbed cuffs and kangaroo pocket.' },
  { title: 'Calvin Klein Boys Polo',               brand: 'Calvin Klein',    catSlug: 'boys-clothing', price: 1799, disc: 15, img: 'boytee',   desc: 'Minimalist polo with CK chest logo.' },
  { title: 'U.S. Polo Assn. Boys Cargo Shorts',   brand: 'U.S. Polo Assn.', catSlug: 'boys-clothing', price: 999,  disc: 20, img: 'boyshorts',desc: 'Multi-pocket cargo shorts in durable twill fabric.' },
  { title: 'Puma Boys Full Zip Jacket',            brand: 'Puma',            catSlug: 'boys-clothing', price: 1699, disc: 20, img: 'boysport', desc: 'Lightweight full-zip jacket with Puma formstripe branding.' },
  { title: 'Allen Solly Boys Polo',                brand: 'Allen Solly',     catSlug: 'boys-clothing', price: 899,  disc: 20, img: 'boytee',   desc: 'Pique-texture polo in easy-care cotton.' },
  { title: 'Jockey Boys Vest Pack',                brand: 'Jockey',          catSlug: 'boys-clothing', price: 399,  disc: 10, img: 'boyinner', desc: 'Pack of 2 breathable cotton vests with tagless label.' },
  { title: 'Nike Boys Fleece Hoodie',              brand: 'Nike',            catSlug: 'boys-clothing', price: 2299, disc: 20, img: 'boysport', desc: 'Soft fleece pullover hoodie with kangaroo pocket.' },
  { title: 'Tommy Hilfiger Boys Chino',            brand: 'Tommy Hilfiger',  catSlug: 'boys-clothing', price: 1999, disc: 15, img: 'boyjeans', desc: 'Classic-fit chino in stretch cotton blend.' },

  // ── Girls' Clothing ───────────────────────────────────────────────────────────
  { title: 'AND Girls Floral Dress',               brand: 'AND',             catSlug: 'girls-clothing', price: 1299, disc: 25, img: 'girldress', desc: 'Flowy A-line dress with allover floral print.' },
  { title: 'Fratini Girls Ruffle Dress',           brand: 'Fratini',         catSlug: 'girls-clothing', price: 1499, disc: 20, img: 'girldress', desc: 'Tiered ruffle dress in soft chiffon fabric.' },
  { title: 'Allen Solly Girls Graphic Top',        brand: 'Allen Solly',     catSlug: 'girls-clothing', price: 799,  disc: 20, img: 'girltop',   desc: 'Relaxed fit top with fun graphic print.' },
  { title: 'Tommy Hilfiger Girls Stripe Top',      brand: 'Tommy Hilfiger',  catSlug: 'girls-clothing', price: 1199, disc: 20, img: 'girltop',   desc: 'Classic stripe top with Tommy flag embroidery.' },
  { title: "Levi's Girls Slim Jeans",              brand: "Levi's",          catSlug: 'girls-clothing', price: 1499, disc: 20, img: 'girljeans', desc: 'Slim-fit jeans in comfortable stretch denim.' },
  { title: 'Calvin Klein Girls Skinny Jeans',      brand: 'Calvin Klein',    catSlug: 'girls-clothing', price: 1999, disc: 15, img: 'girljeans', desc: 'High-rise skinny jeans with CK logo patch.' },
  { title: 'Puma Girls Training Leggings',         brand: 'Puma',            catSlug: 'girls-clothing', price: 999,  disc: 20, img: 'girlsport', desc: 'Full-length training leggings with moisture-wicking fabric.' },
  { title: 'Nike Girls Skort',                     brand: 'Nike',            catSlug: 'girls-clothing', price: 1199, disc: 20, img: 'girlskirt', desc: 'Active skort with built-in shorts for all-day play.' },
  { title: 'Adidas Girls Track Pant',              brand: 'Adidas',          catSlug: 'girls-clothing', price: 999,  disc: 25, img: 'girlsport', desc: 'Slim-fit track pant with clover logo and stripes.' },
  { title: 'Reebok Girls Sports Bra Top',          brand: 'Reebok',          catSlug: 'girls-clothing', price: 799,  disc: 20, img: 'girlsport', desc: 'Supportive sports bra top for active girls.' },
  { title: 'Jockey Girls Slip Shorts',             brand: 'Jockey',          catSlug: 'girls-clothing', price: 399,  disc: 10, img: 'girlinner', desc: 'Soft cotton slip shorts for all-day comfort.' },
  { title: 'AND Girls Midi Skirt',                 brand: 'AND',             catSlug: 'girls-clothing', price: 1099, disc: 20, img: 'girlskirt', desc: 'Flowy midi skirt with elasticated waist.' },
  { title: 'Allen Solly Girls Co-Ord Set',         brand: 'Allen Solly',     catSlug: 'girls-clothing', price: 1599, disc: 20, img: 'girltop',   desc: 'Matching top and shorts co-ord set in cotton.' },
  { title: 'Peter England Girls Ethnic Kurti',     brand: 'Peter England',   catSlug: 'girls-clothing', price: 899,  disc: 15, img: 'girldress', desc: 'Printed cotton kurti with mirror work detailing.' },
  { title: 'Tommy Hilfiger Girls Hoodie',          brand: 'Tommy Hilfiger',  catSlug: 'girls-clothing', price: 2499, disc: 15, img: 'girlsport', desc: 'Soft fleece hoodie with Tommy branding.' },
  { title: 'Van Heusen Girls Jogger',              brand: 'Van Heusen',      catSlug: 'girls-clothing', price: 1199, disc: 20, img: 'girlsport', desc: 'Comfortable jogger with elasticated waist and cuffs.' },
  { title: 'Fratini Girls Summer Dress',           brand: 'Fratini',         catSlug: 'girls-clothing', price: 1299, disc: 20, img: 'girldress', desc: 'Breezy cotton summer dress with smock detail.' },
  { title: 'Nike Girls DRI-FIT Tee',              brand: 'Nike',            catSlug: 'girls-clothing', price: 999,  disc: 20, img: 'girltop',   desc: 'Sweat-wicking tee for active play.' },

  // ── Kids Footwear ─────────────────────────────────────────────────────────────
  { title: 'Puma Kids Pacer Sneakers',             brand: 'Puma',            catSlug: 'kids-footwear', price: 2499, disc: 20, img: 'sneakers', desc: 'Lightweight Pacer sneakers with velcro closure for easy wear.' },
  { title: 'Adidas Kids Duramo Runners',           brand: 'Adidas',          catSlug: 'kids-footwear', price: 2999, disc: 15, img: 'sneakers', desc: 'Cushioned running shoes with breathable mesh upper.' },
  { title: 'Nike Kids Revolution Shoes',           brand: 'Nike',            catSlug: 'kids-footwear', price: 3499, disc: 20, img: 'sneakers', desc: 'Lightweight revolution shoes with foam cushioning.' },
  { title: 'Reebok Kids Club C Sneakers',          brand: 'Reebok',          catSlug: 'kids-footwear', price: 2799, disc: 25, img: 'sneakers', desc: 'Classic Club C silhouette in durable leather-look upper.' },
  { title: 'Skechers Kids Breathe-Easy Slip-Ons', brand: 'Skechers',        catSlug: 'kids-footwear', price: 1999, disc: 20, img: 'sneakers', desc: 'Easy slip-on sneakers with memory foam insole.' },
  { title: 'U.S. Polo Assn. Kids Sandals',        brand: 'U.S. Polo Assn.', catSlug: 'kids-footwear', price: 1299, disc: 20, img: 'sandals',  desc: 'Comfortable velcro sandals with cushioned footbed.' },
  { title: 'Puma Kids Softride Sandals',           brand: 'Puma',            catSlug: 'kids-footwear', price: 1499, disc: 15, img: 'sandals',  desc: 'Ergonomic softride sandals with adjustable straps.' },
  { title: 'Tommy Hilfiger Kids Ankle Boots',      brand: 'Tommy Hilfiger',  catSlug: 'kids-footwear', price: 3999, disc: 20, img: 'boots',    desc: 'Smart ankle boots with side zip and branded tag.' },
  { title: 'Adidas Kids AltaSport Shoes',          brand: 'Adidas',          catSlug: 'kids-footwear', price: 2199, disc: 20, img: 'sneakers', desc: 'Versatile sport shoes for school and play.' },
  { title: 'Nike Kids Flex Runner',                brand: 'Nike',            catSlug: 'kids-footwear', price: 3999, disc: 15, img: 'sneakers', desc: 'Flexible sole running shoes with slip-on design.' },

  // ── Infants & Toddlers ────────────────────────────────────────────────────────
  { title: 'Allen Solly Infant Bodysuit Set',      brand: 'Allen Solly',     catSlug: 'infants-toddlers', price: 799,  disc: 15, img: 'bodysuit', desc: 'Soft 100% cotton bodysuit set with snap closure.' },
  { title: 'U.S. Polo Assn. Baby Romper',          brand: 'U.S. Polo Assn.', catSlug: 'infants-toddlers', price: 899,  disc: 20, img: 'romper',   desc: 'Cute all-in-one romper in breathable cotton.' },
  { title: 'Tommy Hilfiger Baby Sleepsuit',        brand: 'Tommy Hilfiger',  catSlug: 'infants-toddlers', price: 1299, disc: 15, img: 'bodysuit', desc: 'Cosy sleepsuit in organic cotton with zip front.' },
  { title: 'Jockey Infant 3-Pack Bodysuits',       brand: 'Jockey',          catSlug: 'infants-toddlers', price: 699,  disc: 10, img: 'bodysuit', desc: 'Pack of 3 breathable cotton bodysuits with snap neckline.' },
  { title: 'Allen Solly Baby 5-Piece Gift Set',    brand: 'Allen Solly',     catSlug: 'infants-toddlers', price: 1499, disc: 20, img: 'babyset',  desc: 'Complete 5-piece gift set with bodysuit, cap, socks and mittens.' },
  { title: 'U.S. Polo Assn. Toddler Dungaree',    brand: 'U.S. Polo Assn.', catSlug: 'infants-toddlers', price: 1099, disc: 20, img: 'romper',   desc: 'Adorable denim dungaree with bib front and adjustable straps.' },
  { title: 'Nike Infant Romper & Cap Set',         brand: 'Nike',            catSlug: 'infants-toddlers', price: 1499, disc: 15, img: 'romper',   desc: 'Soft jersey romper and matching cap set.' },
  { title: 'Puma Baby Logo Bodysuit',              brand: 'Puma',            catSlug: 'infants-toddlers', price: 799,  disc: 20, img: 'bodysuit', desc: 'Snap-closure bodysuit with embroidered Puma logo.' },

  // ── Kids Accessories ──────────────────────────────────────────────────────────
  { title: 'Puma Kids School Backpack',            brand: 'Puma',            catSlug: 'kids-accessories', price: 1499, disc: 20, img: 'backpack', desc: 'Durable 20L backpack with laptop sleeve and multiple pockets.' },
  { title: 'Adidas Kids Training Backpack',        brand: 'Adidas',          catSlug: 'kids-accessories', price: 1699, disc: 15, img: 'backpack', desc: 'Lightweight training bag with padded straps.' },
  { title: 'Nike Kids Heritage Bag',               brand: 'Nike',            catSlug: 'kids-accessories', price: 1999, disc: 20, img: 'backpack', desc: 'Heritage backpack with large main compartment and Swoosh logo.' },
  { title: 'Tommy Hilfiger Kids Cap',              brand: 'Tommy Hilfiger',  catSlug: 'kids-accessories', price: 799,  disc: 15, img: 'cap',      desc: 'Classic five-panel cap with embroidered Tommy logo.' },
  { title: 'Puma Kids Essential Cap',              brand: 'Puma',            catSlug: 'kids-accessories', price: 599,  disc: 20, img: 'cap',      desc: 'Adjustable cap in moisture-wicking fabric.' },
  { title: 'Reebok Kids Sport Sunglasses',         brand: 'Reebok',          catSlug: 'kids-accessories', price: 899,  disc: 25, img: 'sunglass', desc: 'Impact-resistant sports sunglasses with UV400 protection.' },
  { title: 'U.S. Polo Assn. Kids Sunnies',        brand: 'U.S. Polo Assn.', catSlug: 'kids-accessories', price: 699,  disc: 20, img: 'sunglass', desc: 'Lightweight aviator sunglasses with UV protection.' },
  { title: 'Titan Kids Watch',                     brand: 'Titan',           catSlug: 'kids-accessories', price: 1299, disc: 15, img: 'watch',    desc: 'Colourful quartz watch with durable silicone strap.' },
];

const SEED_SUFFIX = 'k' + Date.now();

try {
  await client.query('BEGIN');
  let inserted = 0;
  let skuSeq = 0;

  for (const p of PRODUCTS) {
    const catId   = cat(p.catSlug);
    const brandId = brand(p.brand);
    const pSlug   = slugify(p.title, SEED_SUFFIX);
    const sizeArr = getSizes(p.img);

    const { rows: [product] } = await client.query(
      `INSERT INTO products
         (title, slug, base_price, discount_pct, gender, category_id, brand_id, status, description)
       VALUES ($1,$2,$3,$4,'kids',$5,$6,'active',$7)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      [p.title, pSlug, p.price, p.disc, catId, brandId, p.desc]
    );
    if (!product) continue;

    const pid    = product.id;
    const altKey = Object.keys(IMG)[(inserted + 5) % Object.keys(IMG).length];
    const altImg = IMG[altKey] !== IMG[p.img] ? IMG[altKey] : IMG.boytee;

    await client.query(
      `INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES ($1,$2,true,0),($1,$3,false,1)`,
      [pid, IMG[p.img], altImg]
    );

    for (const size of sizeArr) {
      const sku = `K-${++skuSeq}-${size}`;
      await client.query(
        `INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price) VALUES ($1,$2,$3,$4,$5,0)`,
        [pid, size, 'Assorted', sku, Math.floor(Math.random() * 30) + 5]
      );
    }
    inserted++;
  }

  await client.query('COMMIT');
  console.log(`\n✓ ${inserted} kids products seeded successfully.`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
