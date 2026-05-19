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

const brand = name => (brands.find(b => b.name === name) || brands[0]).id;
const cat   = name => (categories.find(c => c.name === name) || categories[0]).id;

const IMG = {
  top:       'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&w=800&q=80',
  shirt:     'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&w=800&q=80',
  jeans:     'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&w=800&q=80',
  sweat:     'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&w=800&q=80',
  skirt:     'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&w=800&q=80',
  coord:     'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&w=800&q=80',
  kurta:     'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&w=800&q=80',
  saree:     'https://images.unsplash.com/photo-1583391733956-6c78276477e1?auto=format&w=800&q=80',
  lehenga:   'https://images.unsplash.com/photo-1617627143233-46ef90f975f7?auto=format&w=800&q=80',
  kurtaset:  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&w=800&q=80',
  dress:     'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&w=800&q=80',
  maxi:      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&w=800&q=80',
  jumpsuit:  'https://images.unsplash.com/photo-1485462537746-965f33f47f16?auto=format&w=800&q=80',
  sportsbra: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&w=800&q=80',
  legging:   'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&w=800&q=80',
  sportop:   'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&w=800&q=80',
  heels:     'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&w=800&q=80',
  flats:     'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&w=800&q=80',
  sneakers:  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&w=800&q=80',
  boots:     'https://images.unsplash.com/photo-1608256246200-88f0d416af6e?auto=format&w=800&q=80',
  sandals:   'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&w=800&q=80',
  handbag:   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&w=800&q=80',
  clutch:    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&w=800&q=80',
  sunglass:  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&w=800&q=80',
  jewel:     'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&w=800&q=80',
  sweater:   'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&w=800&q=80',
  jacket:    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&w=800&q=80',
  nightwear: 'https://images.unsplash.com/photo-1613979948043-0c26e6af6f6f?auto=format&w=800&q=80',
  bra:       'https://images.unsplash.com/photo-1571513722275-4ad9f4f67f07?auto=format&w=800&q=80',
};

const SIZES_CLOTH  = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SIZES_BOTTOM = ['26', '28', '30', '32', '34', '36'];
const SIZES_SHOES  = ['5', '6', '7', '8', '9', '10'];
const SIZES_ONE    = ['One Size'];

const getSizes = key => {
  if (['heels','flats','sneakers','boots','sandals'].includes(key)) return SIZES_SHOES;
  if (['jeans','skirt'].includes(key))                              return SIZES_BOTTOM;
  if (['handbag','clutch','sunglass','jewel'].includes(key))        return SIZES_ONE;
  return SIZES_CLOTH;
};

const PRODUCTS = [
  /* ── Western Wear → Tops & T-Shirts ───────────────────────────── */
  { title: 'AND Floral Print Crop Top',        img: 'top',     price: 1299,  disc: 20, cat: 'Tops & T-Shirts',       brand: 'AND' },
  { title: 'Allen Solly Striped T-Shirt',      img: 'top',     price: 799,   disc: 15, cat: 'Tops & T-Shirts',       brand: 'Allen Solly' },
  { title: 'Tommy Hilfiger Logo Tee',          img: 'top',     price: 1999,  disc: 25, cat: 'Tops & T-Shirts',       brand: 'Tommy Hilfiger' },
  { title: 'U.S. Polo Assn. Women Polo Top',   img: 'top',     price: 1499,  disc: 20, cat: 'Tops & T-Shirts',       brand: 'U.S. Polo Assn.' },
  { title: 'Calvin Klein Ribbed Crop Top',     img: 'top',     price: 2499,  disc: 30, cat: 'Tops & T-Shirts',       brand: 'Calvin Klein' },
  { title: 'AND Ruched Satin Top',             img: 'coord',   price: 1599,  disc: 20, cat: 'Tops & T-Shirts',       brand: 'AND' },
  { title: 'Stop Embroidered Casual Top',      img: 'top',     price: 699,   disc: 10, cat: 'Tops & T-Shirts',       brand: 'Stop' },

  /* ── Western Wear → Shirts & Blouses ─────────────────────────── */
  { title: 'AND Solid Satin Shirt',            img: 'shirt',   price: 1899,  disc: 25, cat: 'Shirts & Blouses',      brand: 'AND' },
  { title: 'Allen Solly Oxford Shirt',         img: 'shirt',   price: 1299,  disc: 20, cat: 'Shirts & Blouses',      brand: 'Allen Solly' },
  { title: 'Van Heusen Work Shirt',            img: 'shirt',   price: 1499,  disc: 15, cat: 'Shirts & Blouses',      brand: 'Van Heusen' },
  { title: 'Tommy Hilfiger Dobby Blouse',      img: 'shirt',   price: 2299,  disc: 25, cat: 'Shirts & Blouses',      brand: 'Tommy Hilfiger' },

  /* ── Western Wear → Jeans ─────────────────────────────────────── */
  { title: "Levi's 311 Shaping Skinny Jeans",  img: 'jeans',   price: 3299,  disc: 20, cat: 'Jeans',                 brand: "Levi's" },
  { title: 'Wrangler High Rise Mom Jeans',     img: 'jeans',   price: 2499,  disc: 25, cat: 'Jeans',                 brand: 'Wrangler' },
  { title: 'Calvin Klein Wide Leg Jeans',      img: 'jeans',   price: 3999,  disc: 30, cat: 'Jeans',                 brand: 'Calvin Klein' },
  { title: 'AND Distressed Bootcut Jeans',     img: 'jeans',   price: 1999,  disc: 20, cat: 'Jeans',                 brand: 'AND' },

  /* ── Western Wear → Sweatshirts & Hoodies ────────────────────── */
  { title: 'Puma Women Graphic Hoodie',        img: 'sweat',   price: 2299,  disc: 30, cat: 'Sweatshirts & Hoodies', brand: 'Puma' },
  { title: 'Adidas Essentials Sweatshirt',     img: 'sweat',   price: 2999,  disc: 25, cat: 'Sweatshirts & Hoodies', brand: 'Adidas' },
  { title: 'Tommy Hilfiger Logo Hoodie',       img: 'sweat',   price: 3999,  disc: 20, cat: 'Sweatshirts & Hoodies', brand: 'Tommy Hilfiger' },

  /* ── Western Wear → Shorts & Skirts ─────────────────────────── */
  { title: 'AND Pleated Mini Skirt',           img: 'skirt',   price: 1299,  disc: 20, cat: 'Shorts & Skirts',       brand: 'AND' },
  { title: 'Stop Denim A-Line Skirt',          img: 'skirt',   price: 899,   disc: 15, cat: 'Shorts & Skirts',       brand: 'Stop' },
  { title: 'Calvin Klein Midi Pencil Skirt',   img: 'skirt',   price: 2499,  disc: 25, cat: 'Shorts & Skirts',       brand: 'Calvin Klein' },

  /* ── Western Wear → Co-Ord Sets ─────────────────────────────── */
  { title: 'AND Blazer & Trouser Co-Ord Set',  img: 'coord',   price: 3499,  disc: 25, cat: 'Co-Ord Sets',           brand: 'AND' },
  { title: 'Stop Printed Co-Ord Set',          img: 'coord',   price: 1499,  disc: 20, cat: 'Co-Ord Sets',           brand: 'Stop' },

  /* ── Ethnic Wear → Kurtas & Kurtis ──────────────────────────── */
  { title: 'Kashmiri Embroidered Long Kurta',  img: 'kurta',   price: 2499,  disc: 30, cat: 'Kurtas & Kurtis',       brand: 'Stop' },
  { title: 'Stop Cotton Printed Kurti',        img: 'kurta',   price: 999,   disc: 20, cat: 'Kurtas & Kurtis',       brand: 'Stop' },
  { title: 'AND Anarkali Flared Kurta',        img: 'kurta',   price: 1799,  disc: 25, cat: 'Kurtas & Kurtis',       brand: 'AND' },
  { title: 'Fratini Lucknowi Chikankari Kurta',img: 'kurta',   price: 2999,  disc: 30, cat: 'Kurtas & Kurtis',       brand: 'Fratini' },
  { title: 'Stop Rayon Straight Kurta',        img: 'kurta',   price: 799,   disc: 15, cat: 'Kurtas & Kurtis',       brand: 'Stop' },
  { title: 'Allen Solly Casual Kurta',         img: 'kurta',   price: 1299,  disc: 20, cat: 'Kurtas & Kurtis',       brand: 'Allen Solly' },

  /* ── Ethnic Wear → Sarees ────────────────────────────────────── */
  { title: 'Fratini Georgette Printed Saree',  img: 'saree',   price: 2999,  disc: 25, cat: 'Sarees',                brand: 'Fratini' },
  { title: 'Stop Silk Blend Festive Saree',    img: 'saree',   price: 3499,  disc: 30, cat: 'Sarees',                brand: 'Stop' },
  { title: 'AND Embellished Party Saree',      img: 'saree',   price: 3999,  disc: 20, cat: 'Sarees',                brand: 'AND' },
  { title: 'Fratini Chiffon Casual Saree',     img: 'saree',   price: 1999,  disc: 25, cat: 'Sarees',                brand: 'Fratini' },

  /* ── Ethnic Wear → Lehengas ──────────────────────────────────── */
  { title: 'Fratini Embroidered Bridal Lehenga', img: 'lehenga', price: 8999, disc: 15, cat: 'Lehengas',             brand: 'Fratini' },
  { title: 'Stop Sequin Party Lehenga',        img: 'lehenga', price: 5499,  disc: 20, cat: 'Lehengas',              brand: 'Stop' },
  { title: 'AND Floral Print Lehenga Set',     img: 'lehenga', price: 4499,  disc: 25, cat: 'Lehengas',              brand: 'AND' },

  /* ── Ethnic Wear → Kurta Sets ────────────────────────────────── */
  { title: 'Stop Cotton Kurta Palazzo Set',    img: 'kurtaset', price: 1799, disc: 25, cat: 'Kurta Sets',            brand: 'Stop' },
  { title: 'Fratini Silk Kurta Dupatta Set',   img: 'kurtaset', price: 2999, disc: 20, cat: 'Kurta Sets',            brand: 'Fratini' },
  { title: 'AND Printed Kurta Sharara Set',    img: 'kurtaset', price: 2499, disc: 25, cat: 'Kurta Sets',            brand: 'AND' },

  /* ── Dresses & Jumpsuits → Casual Dresses ───────────────────── */
  { title: 'AND Floral Wrap Midi Dress',       img: 'dress',   price: 1999,  disc: 25, cat: 'Casual Dresses',        brand: 'AND' },
  { title: 'Stop Polka Dot Shirt Dress',       img: 'dress',   price: 1299,  disc: 20, cat: 'Casual Dresses',        brand: 'Stop' },
  { title: 'Tommy Hilfiger Fit & Flare Dress', img: 'dress',   price: 3499,  disc: 25, cat: 'Casual Dresses',        brand: 'Tommy Hilfiger' },
  { title: 'AND Striped A-Line Dress',         img: 'dress',   price: 1799,  disc: 20, cat: 'Casual Dresses',        brand: 'AND' },

  /* ── Dresses & Jumpsuits → Party Dresses ────────────────────── */
  { title: 'AND Sequin Bodycon Dress',         img: 'dress',   price: 2999,  disc: 30, cat: 'Party Dresses',         brand: 'AND' },
  { title: 'Stop Off-Shoulder Party Dress',    img: 'dress',   price: 2299,  disc: 25, cat: 'Party Dresses',         brand: 'Stop' },
  { title: 'Fratini Velvet Slip Dress',        img: 'dress',   price: 3499,  disc: 20, cat: 'Party Dresses',         brand: 'Fratini' },

  /* ── Dresses & Jumpsuits → Maxi Dresses ─────────────────────── */
  { title: 'AND Boho Floral Maxi Dress',       img: 'maxi',    price: 2499,  disc: 25, cat: 'Maxi Dresses',          brand: 'AND' },
  { title: 'Stop Solid Satin Maxi Dress',      img: 'maxi',    price: 1999,  disc: 20, cat: 'Maxi Dresses',          brand: 'Stop' },

  /* ── Dresses & Jumpsuits → Jumpsuits & Playsuits ────────────── */
  { title: 'AND Wide Leg Linen Jumpsuit',      img: 'jumpsuit', price: 2299, disc: 25, cat: 'Jumpsuits & Playsuits', brand: 'AND' },
  { title: 'Stop Tie-Dye Playsuit',            img: 'jumpsuit', price: 1499, disc: 20, cat: 'Jumpsuits & Playsuits', brand: 'Stop' },

  /* ── Activewear → Sports Tops ────────────────────────────────── */
  { title: 'Nike Dri-FIT Women Running Top',   img: 'sportop',  price: 2199, disc: 30, cat: 'Sports Tops',           brand: 'Nike' },
  { title: 'Puma Train Favourite Women Top',   img: 'sportop',  price: 1799, disc: 25, cat: 'Sports Tops',           brand: 'Puma' },
  { title: 'Adidas AEROREADY Training Top',    img: 'sportop',  price: 1999, disc: 25, cat: 'Sports Tops',           brand: 'Adidas' },
  { title: 'Reebok Women Workout Tank',        img: 'sportop',  price: 1499, disc: 20, cat: 'Sports Tops',           brand: 'Reebok' },

  /* ── Activewear → Yoga Pants & Leggings ─────────────────────── */
  { title: 'Nike One Women Tight Leggings',    img: 'legging',  price: 2799, disc: 30, cat: 'Yoga Pants & Leggings', brand: 'Nike' },
  { title: 'Puma Studio Printed Leggings',     img: 'legging',  price: 2199, disc: 25, cat: 'Yoga Pants & Leggings', brand: 'Puma' },
  { title: 'Adidas Yoga Studio Pants',         img: 'legging',  price: 2499, disc: 25, cat: 'Yoga Pants & Leggings', brand: 'Adidas' },
  { title: 'Reebok Lux High-Rise Leggings',    img: 'legging',  price: 2099, disc: 20, cat: 'Yoga Pants & Leggings', brand: 'Reebok' },

  /* ── Activewear → Sports Bras ────────────────────────────────── */
  { title: 'Nike Dri-FIT Sports Bra',          img: 'sportsbra',price: 1799, disc: 25, cat: 'Sports Bras',           brand: 'Nike' },
  { title: 'Puma Train Crossback Bra',         img: 'sportsbra',price: 1499, disc: 20, cat: 'Sports Bras',           brand: 'Puma' },
  { title: 'Jockey High Support Sports Bra',   img: 'sportsbra',price: 999,  disc: 15, cat: 'Sports Bras',           brand: 'Jockey' },

  /* ── Footwear → Heels ────────────────────────────────────────── */
  { title: 'ALDO Strappy Stiletto Heels',      img: 'heels',   price: 3999,  disc: 30, cat: 'Heels',                 brand: 'ALDO' },
  { title: 'Steve Madden Block Heel Sandals',  img: 'heels',   price: 4499,  disc: 25, cat: 'Heels',                 brand: 'Steve Madden' },
  { title: 'ALDO Kitten Heel Mules',           img: 'heels',   price: 3299,  disc: 20, cat: 'Heels',                 brand: 'ALDO' },
  { title: 'Steve Madden Ankle Strap Heels',   img: 'heels',   price: 4999,  disc: 30, cat: 'Heels',                 brand: 'Steve Madden' },

  /* ── Footwear → Flats & Ballerinas ──────────────────────────── */
  { title: 'ALDO Pointed Toe Ballet Flats',    img: 'flats',   price: 2499,  disc: 20, cat: 'Flats & Ballerinas',    brand: 'ALDO' },
  { title: 'Steve Madden Embellished Flats',   img: 'flats',   price: 2999,  disc: 25, cat: 'Flats & Ballerinas',    brand: 'Steve Madden' },
  { title: 'Skechers Memory Foam Ballet Flats',img: 'flats',   price: 1999,  disc: 20, cat: 'Flats & Ballerinas',    brand: 'Skechers' },

  /* ── Footwear → Sneakers ─────────────────────────────────────── */
  { title: 'Nike Air Max Women Sneakers',      img: 'sneakers',price: 6999,  disc: 20, cat: 'Sneakers',              brand: 'Nike' },
  { title: 'Adidas Stan Smith Women White',    img: 'sneakers',price: 5999,  disc: 20, cat: 'Sneakers',              brand: 'Adidas' },
  { title: 'Skechers D\'Lites Chunky Sneaker', img: 'sneakers',price: 3999,  disc: 25, cat: 'Sneakers',              brand: 'Skechers' },

  /* ── Footwear → Boots ────────────────────────────────────────── */
  { title: 'ALDO Knee High Block Heel Boots',  img: 'boots',   price: 5499,  disc: 25, cat: 'Boots',                 brand: 'ALDO' },
  { title: 'Steve Madden Chelsea Ankle Boots', img: 'boots',   price: 4999,  disc: 20, cat: 'Boots',                 brand: 'Steve Madden' },

  /* ── Footwear → Sandals ──────────────────────────────────────── */
  { title: 'ALDO Slide Sandals',               img: 'sandals', price: 2499,  disc: 20, cat: 'Sandals',               brand: 'ALDO' },
  { title: 'Steve Madden Toe Ring Sandals',    img: 'sandals', price: 2999,  disc: 25, cat: 'Sandals',               brand: 'Steve Madden' },

  /* ── Handbags & Accessories → Handbags ──────────────────────── */
  { title: 'ALDO Structured Tote Bag',         img: 'handbag', price: 3999,  disc: 25, cat: 'Handbags',              brand: 'ALDO' },
  { title: 'Steve Madden Quilted Shoulder Bag',img: 'handbag', price: 4499,  disc: 30, cat: 'Handbags',              brand: 'Steve Madden' },
  { title: 'Hidesign Leather Satchel Bag',     img: 'handbag', price: 6999,  disc: 20, cat: 'Handbags',              brand: 'Hidesign' },
  { title: 'GUESS Logo Print Tote',            img: 'handbag', price: 5499,  disc: 25, cat: 'Handbags',              brand: 'GUESS' },
  { title: 'ALDO Crossbody Mini Bag',          img: 'handbag', price: 2999,  disc: 20, cat: 'Handbags',              brand: 'ALDO' },

  /* ── Handbags & Accessories → Clutches ──────────────────────── */
  { title: 'ALDO Envelope Clutch Bag',         img: 'clutch',  price: 1999,  disc: 20, cat: 'Clutches',              brand: 'ALDO' },
  { title: 'Steve Madden Beaded Minaudière',   img: 'clutch',  price: 2999,  disc: 25, cat: 'Clutches',              brand: 'Steve Madden' },
  { title: 'GUESS Metallic Evening Clutch',    img: 'clutch',  price: 2499,  disc: 20, cat: 'Clutches',              brand: 'GUESS' },

  /* ── Handbags & Accessories → Sunglasses ────────────────────── */
  { title: 'Tom Ford Cat-Eye Sunglasses',      img: 'sunglass',price: 12999, disc: 10, cat: 'Sunglasses',            brand: 'Tom Ford' },
  { title: 'Rayban Round Metal Sunglasses',    img: 'sunglass',price: 7999,  disc: 15, cat: 'Sunglasses',            brand: 'Rayban' },
  { title: 'GUESS Oversized Sunglasses',       img: 'sunglass',price: 4999,  disc: 20, cat: 'Sunglasses',            brand: 'GUESS' },

  /* ── Handbags & Accessories → Jewellery ─────────────────────── */
  { title: 'Swarovski Crystal Statement Necklace', img: 'jewel', price: 7999, disc: 10, cat: 'Jewellery',            brand: 'Swarovski' },
  { title: 'Michael Kors Gold Bangle Set',     img: 'jewel',   price: 5499,  disc: 15, cat: 'Jewellery',             brand: 'Michael Kors' },
  { title: 'Swarovski Stud Earrings',          img: 'jewel',   price: 3999,  disc: 10, cat: 'Jewellery',             brand: 'Swarovski' },

  /* ── Winterwear → Sweaters & Cardigans ──────────────────────── */
  { title: 'Tommy Hilfiger Cable Knit Sweater',img: 'sweater', price: 3999,  disc: 25, cat: 'Sweaters & Cardigans',  brand: 'Tommy Hilfiger' },
  { title: 'Allen Solly Merino Cardigan',      img: 'sweater', price: 2499,  disc: 20, cat: 'Sweaters & Cardigans',  brand: 'Allen Solly' },
  { title: 'AND Oversized Knit Pullover',      img: 'sweater', price: 1999,  disc: 25, cat: 'Sweaters & Cardigans',  brand: 'AND' },

  /* ── Winterwear → Jackets & Coats ───────────────────────────── */
  { title: 'Adidas Puffer Jacket Women',       img: 'jacket',  price: 4999,  disc: 30, cat: 'Jackets & Coats',       brand: 'Adidas' },
  { title: 'Tommy Hilfiger Belted Trench Coat',img: 'jacket',  price: 6999,  disc: 20, cat: 'Jackets & Coats',       brand: 'Tommy Hilfiger' },
  { title: 'AND Faux Leather Biker Jacket',    img: 'jacket',  price: 3499,  disc: 25, cat: 'Jackets & Coats',       brand: 'AND' },

  /* ── Innerwear & Sleepwear → Bras ────────────────────────────── */
  { title: 'Jockey Seamless Everyday Bra',     img: 'bra',     price: 699,   disc: 10, cat: 'Bras',                  brand: 'Jockey' },
  { title: 'Jockey Underwired Padded Bra',     img: 'bra',     price: 899,   disc: 15, cat: 'Bras',                  brand: 'Jockey' },

  /* ── Innerwear & Sleepwear → Nightwear & Loungewear ─────────── */
  { title: 'Jockey Women Satin Nightdress',    img: 'nightwear',price: 999,  disc: 15, cat: 'Nightwear & Loungewear', brand: 'Jockey' },
  { title: 'Stop Printed Pyjama Set',          img: 'nightwear',price: 799,  disc: 10, cat: 'Nightwear & Loungewear', brand: 'Stop' },
];

const SEED_SUFFIX = 'w' + Date.now();

try {
  await client.query('BEGIN');

  let inserted = 0;
  let skuSeq = 0;
  for (const p of PRODUCTS) {
    const categoryId = cat(p.cat);
    const brandId    = brand(p.brand);
    const sizeArr    = getSizes(p.img);
    const pSlug      = slugify(p.title, SEED_SUFFIX);

    const { rows: [product] } = await client.query(
      `INSERT INTO products
         (title, slug, base_price, discount_pct, gender, category_id, brand_id, status, description)
       VALUES ($1,$2,$3,$4,'women',$5,$6,'active',$7)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      [p.title, pSlug, p.price, p.disc, categoryId, brandId,
       `${p.title} — premium quality women's fashion from ${p.brand}.`]
    );
    if (!product) continue;

    const pid = product.id;
    const alt = p.img + '2';
    const altImg = IMG[alt] || IMG[p.img];

    await client.query(
      `INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES ($1,$2,true,0),($1,$3,false,1)`,
      [pid, IMG[p.img], altImg]
    );

    for (let i = 0; i < sizeArr.length; i++) {
      const sku = `W-${++skuSeq}-${sizeArr[i]}`;
      await client.query(
        `INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price) VALUES ($1,$2,$3,$4,$5,0)`,
        [pid, sizeArr[i], 'Assorted', sku, Math.floor(Math.random() * 25) + 5]
      );
    }
    inserted++;
  }

  await client.query('COMMIT');
  console.log(`\n✓ ${inserted} women's products seeded successfully.`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
