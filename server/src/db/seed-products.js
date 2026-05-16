import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function slug(title, id) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + id;
}

const client = await pool.connect();

// ── Load existing brands & categories ─────────────────────────────────────────
const { rows: brands }     = await client.query('SELECT id, name, slug FROM brands ORDER BY id');
const { rows: categories } = await client.query("SELECT id, name, slug FROM categories WHERE parent_id IS NOT NULL ORDER BY id");

function brand(name)    { return brands.find(b => b.name === name) || brands[0]; }
function cat(name)      { return categories.find(c => c.name === name) || categories[0]; }

// Unsplash fashion images — each array = [primary, alt]
const IMAGES = {
  tshirt:    ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800'],
  polo:      ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800', 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800'],
  shirt:     ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'],
  jeans:     ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800'],
  chinos:    ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'],
  jacket:    ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800'],
  sneakers:  ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'],
  formal:    ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800'],
  dress:     ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
  top:       ['https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=800', 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800'],
  kurta:     ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800'],
  saree:     ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'],
  watch:     ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
  bag:       ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
  heels:     ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800', 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800'],
  sweater:   ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
  trackpant: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800', 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=800'],
  shorts:    ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800', 'https://images.unsplash.com/photo-1534534573898-db5148bc8b0c?w=800'],
  blazer:    ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', 'https://images.unsplash.com/photo-1519235677-7a5a1e6eeef3?w=800'],
  perfume:   ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=800', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800'],
};

const SIZES_CLOTHING = ['XS','S','M','L','XL','XXL'];
const SIZES_SHOES    = ['6','7','8','9','10','11'];
const COLORS_COMMON  = ['Black','White','Navy','Grey'];
const COLORS_WOMEN   = ['Black','White','Pink','Blue','Red'];

// ── 50 products ───────────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── Men Casual ──────────────────────────────────────────────────────────────
  { title:"Louis Philippe Slim Fit Polo", brand:"Louis Philippe", cat:"Polos", gender:"men",   price:1499, disc:20, stock:80,  img:"polo",      desc:"Premium cotton slim-fit polo with ribbed collar." },
  { title:"Peter England Graphic Tee",    brand:"Peter England", cat:"T-Shirts", gender:"men", price:799,  disc:30, stock:120, img:"tshirt",    desc:"Soft cotton graphic tee for everyday casual wear." },
  { title:"Allen Solly Printed Shirt",    brand:"Allen Solly",  cat:"Shirts",   gender:"men", price:1299, disc:25, stock:60,  img:"shirt",     desc:"Relaxed-fit printed shirt in breathable cotton." },
  { title:"Van Heusen Slim Chinos",       brand:"Van Heusen",   cat:"Casual Trousers & Chinos", gender:"men", price:1899, disc:15, stock:90, img:"chinos", desc:"Stretch chinos with a modern slim silhouette." },
  { title:"Raymond Straight Jeans",       brand:"Raymond",      cat:"Jeans",    gender:"men", price:2199, disc:10, stock:75,  img:"jeans",     desc:"Classic straight-leg denim jeans in mid-wash blue." },
  { title:"U.S. Polo Assn. Henley Tee",  brand:"U.S. Polo Assn.", cat:"T-Shirts", gender:"men", price:999, disc:20, stock:100, img:"tshirt",  desc:"Soft pique Henley tee with signature embroidery." },
  { title:"Tommy Hilfiger Casual Shorts", brand:"Tommy Hilfiger", cat:"Shorts", gender:"men", price:2499, disc:15, stock:60,  img:"shorts",    desc:"Classic-fit chino shorts with an adjustable waistband." },
  { title:"Calvin Klein Track Pants",     brand:"Calvin Klein",  cat:"Cargos Track Pants & Joggers", gender:"men", price:3499, disc:20, stock:50, img:"trackpant", desc:"Slim-fit joggers with CK logo waistband." },

  // ── Men Formal ──────────────────────────────────────────────────────────────
  { title:"Van Heusen Formal Shirt",      brand:"Van Heusen",   cat:"Shirts",   gender:"men", price:1699, disc:20, stock:80,  img:"shirt",     desc:"Wrinkle-resistant formal shirt in solid poplin." },
  { title:"Louis Philippe Suit Blazer",   brand:"Louis Philippe", cat:"Blazers & Coats", gender:"men", price:8999, disc:10, stock:30, img:"blazer",  desc:"Single-breasted slim blazer in Italian wool blend." },
  { title:"Raymond Formal Trousers",      brand:"Raymond",      cat:"Trousers", gender:"men", price:2499, disc:15, stock:60,  img:"chinos",    desc:"Flat-front formal trousers in fine wool blend." },
  { title:"Peter England Formal Shirt",   brand:"Peter England", cat:"Shirts",  gender:"men", price:1299, disc:25, stock:90,  img:"shirt",     desc:"Easy-iron formal shirt with button-down collar." },
  { title:"Allen Solly Slim Suit",        brand:"Allen Solly",  cat:"Suit Sets", gender:"men", price:12999, disc:15, stock:20, img:"blazer",   desc:"Two-piece slim-cut suit in textured charcoal fabric." },

  // ── Men Winterwear ───────────────────────────────────────────────────────────
  { title:"Tommy Hilfiger Crew Sweater",  brand:"Tommy Hilfiger", cat:"Sweaters & Cardigans", gender:"men", price:4999, disc:20, stock:45, img:"sweater", desc:"Soft merino-blend crew-neck sweater with flag logo." },
  { title:"Calvin Klein Zip Jacket",      brand:"Calvin Klein",  cat:"Jackets & Coats", gender:"men", price:5999, disc:15, stock:35, img:"jacket",   desc:"Lightweight quilted jacket with minimalist design." },
  { title:"U.S. Polo Assn. Sweatshirt",  brand:"U.S. Polo Assn.", cat:"Sweatshirts & Pullovers", gender:"men", price:1999, disc:25, stock:70, img:"sweater", desc:"Fleece-lined sweatshirt with embroidered polo logo." },

  // ── Men Footwear ─────────────────────────────────────────────────────────────
  { title:"Clarks Casual Sneakers",       brand:"Clarks",       cat:"Casual Shoes & Loafers", gender:"men", price:4999, disc:10, stock:55, img:"sneakers",  desc:"Cushioned casual sneakers in premium leather." },
  { title:"Woodland Sports Shoes",        brand:"Woodland",     cat:"Sports Shoes", gender:"men", price:3499, disc:20, stock:65, img:"sneakers",   desc:"Durable sports shoes with memory foam insole." },
  { title:"Bata Formal Derby Shoes",      brand:"Bata",         cat:"Formal Shoes", gender:"men", price:2999, disc:15, stock:50, img:"formal",     desc:"Classic derby shoes in polished genuine leather." },

  // ── Men Watches ──────────────────────────────────────────────────────────────
  { title:"Fossil Analog Watch",          brand:"Fossil",       cat:"Analog Watches", gender:"men", price:9999, disc:20, stock:30, img:"watch",     desc:"Stainless steel case with leather strap and date display." },
  { title:"Titan Chronograph Watch",      brand:"Titan",        cat:"Chronograph Watches", gender:"men", price:6999, disc:15, stock:40, img:"watch", desc:"Sleek chronograph with tachymeter bezel." },

  // ── Women Western ────────────────────────────────────────────────────────────
  { title:"Allen Solly Floral Top",       brand:"Allen Solly",  cat:"Tops & T-Shirts", gender:"women", price:999,  disc:30, stock:90,  img:"top",    desc:"Relaxed floral print top in soft rayon." },
  { title:"Levi's Skinny Jeans",          brand:"Levi's",       cat:"Jeans",    gender:"women", price:2999, disc:20, stock:70,  img:"jeans",  desc:"High-rise skinny jeans in classic dark indigo wash." },
  { title:"Tommy Hilfiger Blouse",        brand:"Tommy Hilfiger", cat:"Shirts & Blouses", gender:"women", price:3499, disc:15, stock:55, img:"shirt", desc:"Classic stripe blouse with relaxed fit." },
  { title:"Calvin Klein Co-ord Set",      brand:"Calvin Klein",  cat:"Co-Ord Sets", gender:"women", price:5999, disc:20, stock:35, img:"top",    desc:"Matching two-piece set in stretch jersey fabric." },
  { title:"Van Heusen Formal Trousers",   brand:"Van Heusen",   cat:"Trousers & Palazzos", gender:"women", price:1999, disc:15, stock:60, img:"chinos", desc:"Wide-leg formal trousers with a concealed zip." },
  { title:"Allen Solly Hooded Sweatshirt",brand:"Allen Solly",  cat:"Sweatshirts & Hoodies", gender:"women", price:1699, disc:20, stock:80, img:"sweater", desc:"Soft-fleece hoodie with kangaroo pocket." },
  { title:"U.S. Polo Assn. Denim Shorts", brand:"U.S. Polo Assn.", cat:"Shorts & Skirts", gender:"women", price:1499, disc:25, stock:65, img:"shorts", desc:"Classic denim shorts with frayed hem detail." },

  // ── Women Dresses ────────────────────────────────────────────────────────────
  { title:"Vero Moda Maxi Dress",         brand:"Vero Moda",    cat:"Maxi Dresses", gender:"women", price:2499, disc:30, stock:50, img:"dress",  desc:"Flowy floral maxi dress in lightweight crepe." },
  { title:"AND Wrap Dress",               brand:"AND",           cat:"Casual Dresses", gender:"women", price:1999, disc:20, stock:60, img:"dress",  desc:"Elegant wrap dress with tie-waist in solid colour." },
  { title:"Marks & Spencer Party Dress",  brand:"Marks & Spencer", cat:"Party Dresses", gender:"women", price:3999, disc:15, stock:35, img:"dress", desc:"Embellished bodycon dress for special occasions." },

  // ── Women Ethnic ─────────────────────────────────────────────────────────────
  { title:"Biba Printed Kurta",           brand:"Biba",         cat:"Kurtas & Kurtis", gender:"women", price:1299, disc:20, stock:90,  img:"kurta", desc:"Block-print cotton kurta with mandarin collar." },
  { title:"W for Woman Kurta Set",        brand:"W",            cat:"Kurta Sets", gender:"women", price:2499, disc:15, stock:70,  img:"kurta",  desc:"Chikankari embroidered kurta with palazzo set." },
  { title:"Global Desi Anarkali",         brand:"Global Desi",  cat:"Salwar Suits", gender:"women", price:3499, disc:25, stock:45,  img:"saree",  desc:"Flared anarkali suit with embroidered yoke." },
  { title:"Fabindia Cotton Saree",        brand:"Fabindia",     cat:"Sarees", gender:"women", price:3999, disc:10, stock:30, img:"saree",   desc:"Handwoven cotton saree with zari border." },

  // ── Women Footwear ───────────────────────────────────────────────────────────
  { title:"Steve Madden Block Heels",     brand:"Steve Madden", cat:"Heels", gender:"women", price:3999, disc:20, stock:45, img:"heels",   desc:"Comfortable block-heel pumps in faux suede." },
  { title:"Clarks Leather Flats",         brand:"Clarks",       cat:"Flats & Ballerinas", gender:"women", price:2999, disc:15, stock:55, img:"heels", desc:"Classic ballet flats in genuine leather." },
  { title:"Nike Women's Sneakers",        brand:"Nike",         cat:"Sneakers", gender:"women", price:4999, disc:10, stock:60, img:"sneakers", desc:"Lightweight running-inspired sneakers with Air cushioning." },

  // ── Women Bags ───────────────────────────────────────────────────────────────
  { title:"Hidesign Leather Tote",        brand:"Hidesign",     cat:"Handbags", gender:"women", price:5999, disc:15, stock:30, img:"bag",    desc:"Spacious full-grain leather tote with interior pockets." },
  { title:"Lavie Sling Bag",              brand:"Lavie",        cat:"Handbags", gender:"women", price:1999, disc:30, stock:55, img:"bag",    desc:"Compact structured sling bag with gold-tone hardware." },

  // ── Women Watches ────────────────────────────────────────────────────────────
  { title:"Fossil Jacqueline Watch",      brand:"Fossil",       cat:"Analog Watches", gender:"women", price:8999, disc:20, stock:25, img:"watch",  desc:"Rose-gold case with blush leather strap and crystal markers." },
  { title:"Titan Raga Watch",             brand:"Titan",        cat:"Analog Watches", gender:"women", price:5999, disc:10, stock:35, img:"watch",  desc:"Slim oval-case watch with mesh bracelet." },

  // ── Women Activewear ─────────────────────────────────────────────────────────
  { title:"Nike Pro Training Tights",     brand:"Nike",         cat:"Yoga Pants & Leggings", gender:"women", price:2999, disc:15, stock:70, img:"trackpant", desc:"High-waist compressive tights with Dri-FIT technology." },
  { title:"Adidas Sports Bra",            brand:"Adidas",       cat:"Sports Bras", gender:"women", price:1999, disc:20, stock:80, img:"top",       desc:"Medium-support sports bra with adjustable straps." },

  // ── Women Winterwear ─────────────────────────────────────────────────────────
  { title:"Marks & Spencer Wool Cardigan",brand:"Marks & Spencer", cat:"Sweaters & Cardigans", gender:"women", price:3499, disc:20, stock:40, img:"sweater", desc:"Open-front merino wool cardigan with ribbed detailing." },
  { title:"AND Quilted Jacket",           brand:"AND",           cat:"Jackets & Coats", gender:"women", price:3999, disc:25, stock:35, img:"jacket",  desc:"Lightweight puffer jacket with detachable hood." },

  // ── Kids ─────────────────────────────────────────────────────────────────────
  { title:"H&M Boys Graphic Tee",        brand:"H&M",           cat:"T-Shirts & Polos", gender:"kids", price:599,  disc:20, stock:100, img:"tshirt",  desc:"Fun graphic tee in soft jersey cotton for boys." },
  { title:"Zara Girls Floral Dress",      brand:"Zara",          cat:"Dresses & Frocks", gender:"kids", price:1499, disc:15, stock:60,  img:"dress",   desc:"Pretty floral print dress with smocked bodice." },
  { title:"H&M Kids Denim Jeans",        brand:"H&M",           cat:"Jeans & Trousers", gender:"kids", price:999,  disc:25, stock:80,  img:"jeans",   desc:"Comfortable stretch denim jeans with adjustable waist." },

  // ── Fragrance / Beauty ───────────────────────────────────────────────────────
  { title:"Calvin Klein Eternity EDP",    brand:"Calvin Klein",  cat:"Fragrances", gender:"unisex", price:5999, disc:10, stock:30, img:"perfume",  desc:"Timeless floral-woody fragrance for men and women." },
  { title:"Tommy Hilfiger Tommy EDP",     brand:"Tommy Hilfiger", cat:"Fragrances", gender:"men",   price:4999, disc:15, stock:35, img:"perfume",  desc:"Fresh aromatic scent inspired by the American outdoors." },
];

// ── Insert ────────────────────────────────────────────────────────────────────
try {
  await client.query('BEGIN');

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p   = PRODUCTS[i];
    const br  = brand(p.brand);
    const ct  = cat(p.cat);
    const sl  = slug(p.title, Date.now() + i);

    const { rows: [product] } = await client.query(
      `INSERT INTO products (title, slug, brand_id, category_id, description, gender, base_price, discount_pct, stock, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active') RETURNING id`,
      [p.title, sl, br.id, ct.id, p.desc, p.gender, p.price, p.disc, p.stock]
    );

    const imgs = IMAGES[p.img] || IMAGES.tshirt;
    for (let j = 0; j < imgs.length; j++) {
      await client.query(
        `INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES ($1,$2,$3,$4)`,
        [product.id, imgs[j], j === 0, j]
      );
    }

    // Add size variants
    const sizes = ['sneakers','heels','formal'].includes(p.img) ? SIZES_SHOES : SIZES_CLOTHING.slice(0, 5);
    const colors = p.gender === 'women' ? COLORS_WOMEN : COLORS_COMMON;
    for (const size of sizes.slice(0, 4)) {
      await client.query(
        `INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price)
         VALUES ($1,$2,$3,$4,$5,0)`,
        [product.id, size, colors[0], `${sl}-${size}`.slice(0, 50), Math.floor(p.stock / 4)]
      );
    }

    console.log(`✓ [${i + 1}/50] ${p.title}`);
  }

  await client.query('COMMIT');
  console.log('\n✅ All 50 products seeded with images and variants.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
