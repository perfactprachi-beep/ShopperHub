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
function cat(name)   { return (categories.find(c => c.name === name) || categories[0]).id; }

// Curated Unsplash images per product type
const IMG = {
  tshirt:      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  polo:        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
  shirt:       'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
  jeans:       'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
  chinos:      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
  jacket:      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  sneakers:    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  formal:      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800',
  dress:       'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800',
  top:         'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=800',
  kurta:       'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
  saree:       'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
  watch:       'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
  bag:         'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
  heels:       'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
  sweater:     'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
  trackpant:   'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800',
  shorts:      'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800',
  blazer:      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  perfume:     'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800',
  skincare:    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
  makeup:      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
  haircare:    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
  nailcare:    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
  bathbody:    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
  sandals:     'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
  socks:       'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800',
  tie:         'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800',
  belt:        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  wallet:      'https://images.unsplash.com/photo-1627123424574-724758594913?w=800',
  sunglasses:  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
  cap:         'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
  scarf:       'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800',
  jewellery:   'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
  clutch:      'https://images.unsplash.com/photo-1566150905458-1bf1ac880b54?w=800',
  backpack:    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  innerwear:   'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800',
  pyjama:      'https://images.unsplash.com/photo-1587655424526-f2b025ed7d32?w=800',
  romper:      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
  kidstshirt:  'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800',
  kidsdress:   'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800',
  kidsjeans:   'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=800',
  kidsshoes:   'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
  jogger:      'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=800',
  coord:       'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=800',
  lehenga:     'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
  dupatta:     'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
  dhoti:       'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
  nehru:       'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  sliders:     'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
  thermals:    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
  digital:     'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  smartwatch:  'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
  jumpsuit:    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800',
  shawl:       'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800',
};

// ── All products to seed (cat name must match categories table exactly) ─────
const PRODUCTS = [
  // ── Men Casual Wear ────────────────────────────────────────────────────────
  { title:'Arrow Slim Fit Jacket',         brand:'Arrow',         cat:'Jackets',              gender:'men',   price:3999, disc:20, stock:45, img:'jacket',    desc:'Lightweight slim-fit jacket in water-resistant fabric.' },
  { title:'Indian Terrain Co-ord Set',     brand:'Indian Terrain',cat:'Co-Ords',              gender:'men',   price:3499, disc:15, stock:35, img:'coord',     desc:'Matching shirt and trouser co-ord set in linen blend.' },

  // ── Men Athleisure ─────────────────────────────────────────────────────────
  { title:'Adidas Training Tee',           brand:'Adidas',        cat:'Active T-Shirts',      gender:'men',   price:1299, disc:20, stock:80, img:'tshirt',    desc:'Moisture-wicking training tee with 3-stripe detail.' },
  { title:'Fila Zip Jacket',               brand:'Fila',          cat:'Jackets & Sweatshirts',gender:'men',   price:2999, disc:25, stock:50, img:'jacket',    desc:'Lightweight zip-through jacket with contrast panel.' },
  { title:'Adidas Cargo Joggers',          brand:'Adidas',        cat:'Cargos',               gender:'men',   price:2499, disc:15, stock:60, img:'trackpant', desc:'Relaxed cargo joggers with zip pockets.' },
  { title:'ASICS Running Joggers',         brand:'ASICS',         cat:'Track Pants & Joggers',gender:'men',   price:2799, disc:20, stock:55, img:'jogger',    desc:'Lightweight running joggers with reflective detail.' },
  { title:'Fila Tracksuit Set',            brand:'Fila',          cat:'Tracksuits & Sets',    gender:'men',   price:4499, disc:20, stock:30, img:'trackpant', desc:'Matching jacket and jogger tracksuit set.' },

  // ── Men Innerwear & Sleepwear ──────────────────────────────────────────────
  { title:'Jockey Classic Vests Pack',     brand:'Jockey',        cat:'Vests',                gender:'men',   price:599,  disc:10, stock:120,img:'innerwear', desc:'Pack of 3 combed cotton vests with tagless design.' },
  { title:'Jockey Cotton Trunks',          brand:'Jockey',        cat:'Briefs & Trunks',      gender:'men',   price:799,  disc:15, stock:100,img:'innerwear', desc:'Pack of 2 mid-rise cotton trunks with elasticated waist.' },
  { title:'Jockey Lounge T-Shirt',         brand:'Jockey',        cat:'Loungewear T-Shirts',  gender:'men',   price:699,  disc:10, stock:90, img:'tshirt',    desc:'Soft cotton lounge tee for everyday comfort.' },
  { title:'Jockey Shorts Pyjama',          brand:'Jockey',        cat:'Shorts Pyjamas & Loose Pants', gender:'men', price:899, disc:10, stock:80, img:'pyjama', desc:'Relaxed-fit cotton shorts pyjama with drawstring.' },

  // ── Men Indian & Festive Wear ──────────────────────────────────────────────
  { title:'Manyavar Festive Kurta',        brand:'Biba',          cat:'Kurtas',               gender:'men',   price:2499, disc:15, stock:40, img:'kurta',     desc:'Embroidered festive kurta in silk-blend fabric.' },
  { title:'Allen Solly Nehru Jacket',      brand:'Allen Solly',   cat:'Nehru Jackets',        gender:'men',   price:2999, disc:20, stock:30, img:'nehru',     desc:'Mandarin-collar Nehru jacket in textured fabric.' },
  { title:'Fabindia Cotton Dhoti',         brand:'Fabindia',      cat:'Dhotis & Pyjamas',     gender:'men',   price:1299, disc:10, stock:50, img:'dhoti',     desc:'Handwoven cotton dhoti with zari border.' },

  // ── Men Accessories ────────────────────────────────────────────────────────
  { title:'Louis Philippe Silk Tie',       brand:'Louis Philippe', cat:'Ties & Pocket Squares',gender:'men',  price:1499, disc:20, stock:60, img:'tie',       desc:'100% silk woven tie with pocket square set.' },
  { title:'Allen Solly Linen Handkerchief',brand:'Allen Solly',   cat:'Handkerchiefs',        gender:'men',   price:299,  disc:10, stock:100,img:'scarf',     desc:'Pack of 3 pure linen handkerchiefs with hem stitch.' },

  // ── Men Footwear ───────────────────────────────────────────────────────────
  { title:'Woodland Leather Sandals',      brand:'Woodland',      cat:'Sandals & Floaters',   gender:'men',   price:1999, disc:15, stock:55, img:'sandals',   desc:'Comfortable leather sandals with adjustable straps.' },
  { title:'Adidas Adilette Sliders',       brand:'Adidas',        cat:'Flip Flops & Sliders', gender:'men',   price:1499, disc:20, stock:70, img:'sliders',   desc:'Classic adilette sliders with cloud foam footbed.' },
  { title:'Jockey Ankle Socks Pack',       brand:'Jockey',        cat:'Socks',                gender:'men',   price:399,  disc:10, stock:150,img:'socks',     desc:'Pack of 3 cushioned ankle socks in combed cotton.' },

  // ── Men Watches ────────────────────────────────────────────────────────────
  { title:'Casio G-Shock Digital',         brand:'Casio',         cat:'Digital Watches',      gender:'men',   price:4999, disc:15, stock:35, img:'digital',   desc:'Shock-resistant G-Shock with EL backlight and 200m WR.' },
  { title:'Fastrack Smartwatch',           brand:'Fastrack',      cat:'Smart Watches & Fitness Bands', gender:'men', price:3999, disc:20, stock:40, img:'smartwatch', desc:'Full-touch smart display with health tracking and GPS.' },

  // ── Women Western Wear ─────────────────────────────────────────────────────
  { title:"Levi's 501 Women Jeans",        brand:"Levi's",        cat:'Jeans',                gender:'women', price:2999, disc:20, stock:65, img:'jeans',     desc:'Iconic straight-leg jeans in classic light wash denim.' },

  // ── Women Activewear ───────────────────────────────────────────────────────
  { title:'Nike Running Tank Top',         brand:'Nike',          cat:'Sports Tops',          gender:'women', price:1799, disc:15, stock:75, img:'top',       desc:'Lightweight Dri-FIT tank top for training and runs.' },
  { title:'Adidas Track Pants Women',      brand:'Adidas',        cat:'Track Pants',          gender:'women', price:2299, disc:20, stock:60, img:'trackpant', desc:'High-waist track pants with slim taper fit.' },
  { title:'ASICS Women Joggers',           brand:'ASICS',         cat:'Joggers',              gender:'women', price:2499, disc:15, stock:55, img:'jogger',    desc:'Comfortable joggers with moisture management.' },

  // ── Women Innerwear & Sleepwear ────────────────────────────────────────────
  { title:'Jockey Seamless Panties',       brand:'Jockey',        cat:'Panties',              gender:'women', price:599,  disc:10, stock:100,img:'innerwear', desc:'Pack of 3 seamless microfibre panties for all-day comfort.' },
  { title:'Jockey Nightwear Set',          brand:'Jockey',        cat:'Nightwear & Loungewear',gender:'women',price:1299, disc:15, stock:70, img:'pyjama',    desc:'Soft cotton nightwear top and pyjama set.' },
  { title:'Jockey Shapewear Brief',        brand:'Jockey',        cat:'Shapewear',            gender:'women', price:999,  disc:10, stock:60, img:'innerwear', desc:'Tummy-control high-waist shapewear brief.' },

  // ── Women Ethnic Wear ──────────────────────────────────────────────────────
  { title:'Biba Mirror Work Lehenga',      brand:'Biba',          cat:'Lehengas',             gender:'women', price:5999, disc:25, stock:25, img:'lehenga',   desc:'Festive lehenga with mirror-work embroidery and dupatta.' },
  { title:'Fabindia Cotton Dupatta',       brand:'Fabindia',      cat:'Dupattas & Stoles',    gender:'women', price:899,  disc:10, stock:80, img:'dupatta',   desc:'Handwoven cotton dupatta with block-print border.' },
  { title:'Global Desi Ethnic Jacket',     brand:'Global Desi',   cat:'Ethnic Jackets',       gender:'women', price:1999, disc:20, stock:45, img:'jacket',    desc:'Embroidered short ethnic jacket for layering over kurtas.' },

  // ── Women Dresses & Jumpsuits ──────────────────────────────────────────────
  { title:'AND Belted Jumpsuit',           brand:'AND',           cat:'Jumpsuits & Playsuits', gender:'women',price:2999, disc:20, stock:40, img:'jumpsuit',  desc:'Wide-leg jumpsuit with self-tie belt in crepe fabric.' },

  // ── Women Footwear ─────────────────────────────────────────────────────────
  { title:'Bata Kolhapuri Chappals',       brand:'Bata',          cat:'Ethnic Footwear',      gender:'women', price:999,  disc:15, stock:60, img:'sandals',   desc:'Traditional Kolhapuri chappals in genuine leather.' },
  { title:'Clarks Women Sandals',          brand:'Clarks',        cat:'Sandals',              gender:'women', price:2999, disc:15, stock:50, img:'sandals',   desc:'Comfortable strappy sandals with cushioned footbed.' },

  // ── Women Handbags & Accessories ───────────────────────────────────────────
  { title:'Lavie Structured Clutch',       brand:'Lavie',         cat:'Clutches',             gender:'women', price:1499, disc:25, stock:45, img:'clutch',    desc:'Sleek structured clutch with metallic clasp and chain strap.' },
  { title:'Hidesign Leather Backpack',     brand:'Hidesign',      cat:'Backpacks',            gender:'women', price:4999, disc:15, stock:30, img:'backpack',  desc:'Full-grain leather backpack with laptop compartment.' },
  { title:'Da Milano Leather Wallet',      brand:'Da Milano',     cat:'Wallets',              gender:'women', price:1999, disc:20, stock:55, img:'wallet',    desc:'Slim bi-fold wallet in genuine nappa leather.' },
  { title:'Allen Solly Leather Belt',      brand:'Allen Solly',   cat:'Belts',                gender:'women', price:799,  disc:15, stock:70, img:'belt',      desc:'Pin-buckle leather belt in classic tan.' },
  { title:'Chumbak Printed Scarf',         brand:'Fabindia',      cat:'Scarves & Stoles',     gender:'women', price:699,  disc:10, stock:80, img:'scarf',     desc:'Lightweight printed scarf in soft viscose.' },
  { title:'Estée Lauder Pearl Necklace',   brand:'Estée Lauder',  cat:'Jewellery',            gender:'women', price:2499, disc:20, stock:30, img:'jewellery', desc:'Delicate freshwater pearl necklace with gold clasp.' },

  // ── Women Winterwear ───────────────────────────────────────────────────────
  { title:'AND Woollen Shawl',             brand:'AND',           cat:'Shawls & Wraps',       gender:'women', price:1999, disc:15, stock:45, img:'shawl',     desc:'Soft woollen shawl with fringed edges in solid colour.' },
  { title:'Allen Solly Sweatshirt Women',  brand:'Allen Solly',   cat:'Sweatshirts',          gender:'women', price:1299, disc:20, stock:65, img:'sweater',   desc:'Relaxed-fit crew-neck sweatshirt in French terry fabric.' },

  // ── Girls Clothing ─────────────────────────────────────────────────────────
  { title:"Zara Girls Ethnic Dress",       brand:'Zara',          cat:'Ethnic Wear',          gender:'kids',  price:1299, disc:15, stock:50, img:'kidsdress', desc:'Embroidered festive dress with mirror work for girls.' },
  { title:"H&M Girls Mini Skirt",          brand:'H&M',           cat:'Skirts',               gender:'kids',  price:699,  disc:20, stock:60, img:'shorts',    desc:'Flared A-line mini skirt in cotton blend.' },
  { title:"Gini & Jony Girls Sports Set",  brand:'Gini & Jony',   cat:'Sportswear',           gender:'kids',  price:999,  disc:15, stock:70, img:'trackpant', desc:'Moisture-wicking sports top and jogger set.' },
  { title:"Gini & Jony Girls Socks Pack",  brand:'Gini & Jony',   cat:'Innerwear & Socks',    gender:'kids',  price:299,  disc:10, stock:100,img:'socks',     desc:'Pack of 3 soft cotton socks with anti-slip grip.' },

  // ── Boys Clothing ──────────────────────────────────────────────────────────
  { title:"H&M Boys Oxford Shirt",         brand:'H&M',           cat:'Shirts',               gender:'kids',  price:799,  disc:20, stock:60, img:'shirt',     desc:'Classic oxford shirt in easy-care cotton for boys.' },

  // ── Kids Footwear ──────────────────────────────────────────────────────────
  { title:'Bata Kids School Shoes',        brand:'Bata',          cat:'School Shoes',         gender:'kids',  price:1299, disc:15, stock:70, img:'kidsshoes', desc:'Durable lace-up school shoes in polished leather.' },
  { title:'Bata Kids Casual Shoes',        brand:'Bata',          cat:'Casual Shoes',         gender:'kids',  price:999,  disc:20, stock:80, img:'kidsshoes', desc:'Lightweight velcro strap casual shoes.' },
  { title:'Adidas Kids Sandals',           brand:'Adidas',        cat:'Sandals & Floaters',   gender:'kids',  price:1299, disc:15, stock:60, img:'sandals',   desc:'Comfortable sports sandals with hook-and-loop closure.' },
  { title:'Woodland Kids Boots',           brand:'Woodland',      cat:'Boots',                gender:'kids',  price:1999, disc:20, stock:40, img:'sneakers',  desc:'Sturdy ankle boots with waterproof suede upper.' },

  // ── Kids Accessories ───────────────────────────────────────────────────────
  { title:'Gini & Jony Kids Backpack',     brand:'Gini & Jony',   cat:'Bags & Backpacks',     gender:'kids',  price:799,  disc:15, stock:80, img:'backpack',  desc:'Lightweight school backpack with multiple compartments.' },
  { title:'H&M Kids Baseball Cap',         brand:'H&M',           cat:'Caps & Hats',          gender:'kids',  price:399,  disc:10, stock:100,img:'cap',       desc:'Classic 6-panel baseball cap with adjustable back strap.' },
  { title:'Fastrack Kids Sunglasses',      brand:'Fastrack',      cat:'Sunglasses',           gender:'kids',  price:499,  disc:20, stock:80, img:'sunglasses',desc:'UV400 wraparound sunglasses for kids.' },
  { title:'Fastrack Kids Digital Watch',   brand:'Fastrack',      cat:'Watches',              gender:'kids',  price:999,  disc:15, stock:60, img:'digital',   desc:'Durable digital watch with alarm and stopwatch.' },

  // ── Infants & Toddlers ─────────────────────────────────────────────────────
  { title:'H&M Baby Bodysuit Set',         brand:'H&M',           cat:'Bodysuits & Rompers',  gender:'kids',  price:899,  disc:15, stock:70, img:'romper',    desc:'Pack of 3 soft cotton bodysuit in pastel prints.' },
  { title:'H&M Baby Sleepsuit',            brand:'H&M',           cat:'Sleepwear',            gender:'kids',  price:799,  disc:10, stock:80, img:'pyjama',    desc:'Soft fleece sleepsuit with zip closure for easy dressing.' },
  { title:"Gini & Jony Baby Clothing Set", brand:'Gini & Jony',   cat:'Sets & Combos',        gender:'kids',  price:1199, disc:20, stock:60, img:'romper',    desc:'5-piece newborn starter set with tees, romper and socks.' },

  // ── Beauty ─────────────────────────────────────────────────────────────────
  { title:'Forest Essentials Face Wash',   brand:'Forest Essentials',cat:'Skincare',           gender:'unisex',price:995,  disc:10, stock:80, img:'skincare',  desc:'Ayurvedic rose and sandalwood face wash for all skin types.' },
  { title:'Kama Ayurveda Moisturiser',     brand:'Kama Ayurveda', cat:'Skincare',             gender:'unisex',price:1295, disc:15, stock:60, img:'skincare',  desc:'Hydrating daily moisturiser with saffron and lotus.' },
  { title:'Kama Ayurveda Shampoo',         brand:'Kama Ayurveda', cat:'Haircare',             gender:'unisex',price:895,  disc:10, stock:70, img:'haircare',  desc:'Natural protein-enriched shampoo for damaged hair.' },
  { title:'Dyson Hair Serum',              brand:'Dyson',         cat:'Haircare',             gender:'unisex',price:1499, disc:15, stock:45, img:'haircare',  desc:'Lightweight frizz-control serum for all hair types.' },
  { title:'Bobbi Brown Lipstick',          brand:'Bobbi Brown',   cat:'Makeup',               gender:'women', price:2800, disc:10, stock:50, img:'makeup',    desc:'Long-wear creamy lipstick in classic nudes and reds.' },
  { title:'Clinique Foundation',           brand:'Clinique',      cat:'Makeup',               gender:'women', price:3200, disc:15, stock:40, img:'makeup',    desc:'Oil-free liquid foundation with SPF 15 for flawless coverage.' },
  { title:'Estée Lauder Night Cream',      brand:'Estée Lauder',  cat:'Bath & Body',          gender:'unisex',price:4500, disc:10, stock:30, img:'bathbody',  desc:'Rich repair night cream with peptides and retinol.' },
  { title:'Forest Essentials Body Lotion', brand:'Forest Essentials',cat:'Bath & Body',        gender:'unisex',price:1250, disc:15, stock:55, img:'bathbody',  desc:'Luxury body lotion with sandalwood and rose extracts.' },
  { title:'Bobbi Brown Nail Polish',       brand:'Bobbi Brown',   cat:'Nail Care',            gender:'women', price:1200, disc:10, stock:65, img:'nailcare',  desc:'Long-lasting chip-resistant nail colour in 12 shades.' },
  { title:'Estée Lauder Nail Kit',         brand:'Estée Lauder',  cat:'Nail Care',            gender:'women', price:999,  disc:15, stock:50, img:'nailcare',  desc:'Complete nail care kit with file, cuticle oil and buffer.' },
];

const SIZES_CLOTHING = ['XS','S','M','L','XL'];
const SIZES_SHOES    = ['6','7','8','9','10'];
const SIZES_KIDS     = ['2Y','4Y','6Y','8Y','10Y'];
const SIZES_INFANTS  = ['0-3M','3-6M','6-12M','12-18M'];

function getSizes(img, gender) {
  if (['sneakers','heels','formal','sandals','kidsshoes','sliders'].includes(img)) {
    return gender === 'kids' ? SIZES_KIDS.slice(0,4) : SIZES_SHOES.slice(0,4);
  }
  if (['romper','pyjama'].includes(img)) return SIZES_INFANTS;
  if (gender === 'kids') return SIZES_KIDS.slice(0,4);
  return SIZES_CLOTHING.slice(0,4);
}

try {
  await client.query('BEGIN');
  let count = 0;

  for (const p of PRODUCTS) {
    const catId   = cat(p.cat);
    const brandId = brand(p.brand);
    const sl      = slugify(p.title, Date.now() + count);

    const { rows: [product] } = await client.query(
      `INSERT INTO products (title, slug, brand_id, category_id, description, gender, base_price, discount_pct, stock, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active') RETURNING id`,
      [p.title, sl, brandId, catId, p.desc, p.gender, p.price, p.disc, p.stock]
    );

    // 2 images
    const imgs = [IMG[p.img], Object.values(IMG).find((v, i) => i % 5 === count % 5 && v !== IMG[p.img]) || IMG.tshirt];
    for (let j = 0; j < 2; j++) {
      await client.query(
        `INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES ($1,$2,$3,$4)`,
        [product.id, imgs[j], j === 0, j]
      );
    }

    // Size variants
    const sizes = getSizes(p.img, p.gender);
    const color = p.gender === 'women' ? 'Black' : p.gender === 'kids' ? 'Blue' : 'Navy';
    for (const size of sizes) {
      await client.query(
        `INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price) VALUES ($1,$2,$3,$4,$5,0)`,
        [product.id, size, color, `${sl}-${size}`.slice(0,50), Math.ceil(p.stock / sizes.length)]
      );
    }

    count++;
    console.log(`✓ [${count}] ${p.title} → ${p.cat}`);
  }

  await client.query('COMMIT');
  console.log(`\n✅ ${count} products seeded across all subcategories.`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌ Failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
