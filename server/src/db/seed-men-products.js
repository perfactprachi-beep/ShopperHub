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

const IMG = {
  tshirt:     'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  polo:       'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
  shirt:      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
  jeans:      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
  chinos:     'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
  jacket:     'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  sneakers:   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  formal:     'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800',
  kurta:      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
  watch:      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
  sweater:    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
  trackpant:  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800',
  shorts:     'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800',
  blazer:     'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  sandals:    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
  socks:      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800',
  tie:        'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800',
  belt:       'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  wallet:     'https://images.unsplash.com/photo-1627123424574-724758594913?w=800',
  sunglasses: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
  cap:        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
  innerwear:  'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800',
  pyjama:     'https://images.unsplash.com/photo-1587655424526-f2b025ed7d32?w=800',
  jogger:     'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=800',
  sliders:    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
  thermals:   'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
  digital:    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  smartwatch: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
  nehru:      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
  dhoti:      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
  coord:      'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=800',
  perfume:    'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800',
  scarf:      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800',
};

const PRODUCTS = [
  // ── Casual Wear › T-Shirts ──────────────────────────────────────────────────
  { title:'Peter England Graphic Tee',       brand:'Peter England',   cat:'T-Shirts',                      price:799,  disc:30, stock:120, img:'tshirt',   desc:'Soft 100% cotton graphic tee with printed chest motif.' },
  { title:'U.S. Polo Assn. Henley Tee',      brand:'U.S. Polo Assn.', cat:'T-Shirts',                      price:999,  disc:20, stock:100, img:'tshirt',   desc:'Pique Henley tee with signature embroidery and button placket.' },
  { title:'Jack & Jones Slim Fit Tee',        brand:'Jack & Jones',    cat:'T-Shirts',                      price:899,  disc:25, stock:90,  img:'tshirt',   desc:'Slim-fit crew-neck tee in soft jersey cotton.' },
  { title:'Wrangler Regular Tee',             brand:'Wrangler',        cat:'T-Shirts',                      price:699,  disc:20, stock:110, img:'tshirt',   desc:'Classic straight-fit tee with Wrangler chest logo.' },

  // ── Casual Wear › Polos ─────────────────────────────────────────────────────
  { title:'Louis Philippe Slim Polo',         brand:'Louis Philippe',  cat:'Polos',                         price:1499, disc:20, stock:80,  img:'polo',     desc:'Premium cotton slim-fit polo with ribbed collar and cuffs.' },
  { title:'Tommy Hilfiger Classic Polo',      brand:'Tommy Hilfiger',  cat:'Polos',                         price:2999, disc:15, stock:65,  img:'polo',     desc:'Iconic two-button polo with embroidered flag logo.' },
  { title:'Allen Solly Pique Polo',           brand:'Allen Solly',     cat:'Polos',                         price:1199, disc:25, stock:85,  img:'polo',     desc:'Pique texture polo in easy-care cotton for everyday style.' },

  // ── Casual Wear › Jackets ───────────────────────────────────────────────────
  { title:'Calvin Klein Zip-Up Jacket',       brand:'Calvin Klein',    cat:'Jackets',                       price:5999, disc:15, stock:35,  img:'jacket',   desc:'Lightweight quilted jacket with minimalist CK branding.' },
  { title:'Tommy Hilfiger Bomber Jacket',     brand:'Tommy Hilfiger',  cat:'Jackets',                       price:6499, disc:20, stock:30,  img:'jacket',   desc:'Satin bomber jacket with ribbed hem and signature stripe.' },

  // ── Casual Wear › Casual Trousers & Chinos ──────────────────────────────────
  { title:'Van Heusen Slim Chinos',           brand:'Van Heusen',      cat:'Casual Trousers & Chinos',      price:1899, disc:15, stock:90,  img:'chinos',   desc:'Stretch-cotton slim chinos with modern tapered silhouette.' },
  { title:'Allen Solly Regular Chinos',       brand:'Allen Solly',     cat:'Casual Trousers & Chinos',      price:1699, disc:20, stock:75,  img:'chinos',   desc:'Washed cotton chinos with flat-front cut for all-day comfort.' },

  // ── Casual Wear › Cargos Track Pants & Joggers ──────────────────────────────
  { title:'Adidas Cargo Joggers',             brand:'Adidas',          cat:'Cargos Track Pants & Joggers',  price:2499, disc:15, stock:60,  img:'trackpant',desc:'Relaxed cargo joggers with zip side pockets and tapered hem.' },
  { title:'Puma Slim Track Pants',            brand:'Puma',            cat:'Cargos Track Pants & Joggers',  price:1999, disc:20, stock:70,  img:'trackpant',desc:'Slim-fit track pants with Puma formstripe and drawstring waist.' },

  // ── Casual Wear › Co-Ords ───────────────────────────────────────────────────
  { title:'Tommy Hilfiger Co-Ord Set',        brand:'Tommy Hilfiger',  cat:'Co-Ords',                       price:6999, disc:15, stock:30,  img:'coord',    desc:'Matching shirt and shorts set in lightweight linen blend.' },

  // ── Casual Wear › Shorts ────────────────────────────────────────────────────
  { title:'Tommy Hilfiger Chino Shorts',      brand:'Tommy Hilfiger',  cat:'Shorts',                        price:2499, disc:15, stock:60,  img:'shorts',   desc:'Classic-fit chino shorts with adjustable waistband.' },
  { title:'Jack & Jones Cargo Shorts',        brand:'Jack & Jones',    cat:'Shorts',                        price:1799, disc:20, stock:75,  img:'shorts',   desc:'Multi-pocket cargo shorts in durable cotton twill.' },

  // ── Casual Wear › Sweatshirts & Pullovers ───────────────────────────────────
  { title:'Allen Solly Crew Sweatshirt',      brand:'Allen Solly',     cat:'Sweatshirts & Pullovers',       price:1599, disc:20, stock:80,  img:'sweater',  desc:'Fleece-lined crew-neck sweatshirt with embroidered branding.' },
  { title:'U.S. Polo Assn. Pullover',         brand:'U.S. Polo Assn.', cat:'Sweatshirts & Pullovers',       price:1999, disc:25, stock:70,  img:'sweater',  desc:'Mid-weight pullover hoodie with kangaroo pocket.' },

  // ── Formal Wear › Trousers ──────────────────────────────────────────────────
  { title:'Raymond Flat-Front Trousers',      brand:'Raymond',         cat:'Trousers',                      price:2499, disc:15, stock:60,  img:'chinos',   desc:'Flat-front formal trousers in premium wool-blend fabric.' },
  { title:'Van Heusen Formal Trousers',       brand:'Van Heusen',      cat:'Trousers',                      price:1999, disc:20, stock:70,  img:'chinos',   desc:'Wrinkle-resistant formal trousers with straight cut.' },

  // ── Formal Wear › Suit Sets ─────────────────────────────────────────────────
  { title:'Allen Solly Slim Suit Set',        brand:'Allen Solly',     cat:'Suit Sets',                     price:12999,disc:15, stock:20,  img:'blazer',   desc:'Two-piece slim-cut suit in textured charcoal fabric.' },
  { title:'Louis Philippe Classic Suit',      brand:'Louis Philippe',  cat:'Suit Sets',                     price:17999,disc:10, stock:15,  img:'blazer',   desc:'Single-breasted business suit in Italian wool blend.' },

  // ── Formal Wear › Blazers & Coats ───────────────────────────────────────────
  { title:'Louis Philippe Slim Blazer',       brand:'Louis Philippe',  cat:'Blazers & Coats',               price:8999, disc:10, stock:30,  img:'blazer',   desc:'Single-breasted slim blazer in structured Italian wool blend.' },
  { title:'Raymond Structured Blazer',        brand:'Raymond',         cat:'Blazers & Coats',               price:7499, disc:15, stock:25,  img:'blazer',   desc:'Notch-lapel structured blazer with two-button front.' },

  // ── Shirts (direct child of Men) ────────────────────────────────────────────
  { title:'Van Heusen Poplin Formal Shirt',   brand:'Van Heusen',      cat:'Shirts',                        price:1699, disc:20, stock:80,  img:'shirt',    desc:'Wrinkle-resistant formal shirt in solid poplin weave.' },
  { title:'Allen Solly Printed Shirt',        brand:'Allen Solly',     cat:'Shirts',                        price:1299, disc:25, stock:60,  img:'shirt',    desc:'Relaxed-fit printed casual shirt in breathable cotton.' },
  { title:'Peter England Check Shirt',        brand:'Peter England',   cat:'Shirts',                        price:1099, disc:25, stock:90,  img:'shirt',    desc:'Classic check shirt in easy-iron soft cotton.' },
  { title:'Louis Philippe Oxford Shirt',      brand:'Louis Philippe',  cat:'Shirts',                        price:2199, disc:20, stock:55,  img:'shirt',    desc:'Premium Oxford weave shirt with button-down collar.' },

  // ── Athleisure › Active T-Shirts ────────────────────────────────────────────
  { title:'Adidas Training Tee',              brand:'Adidas',          cat:'Active T-Shirts',               price:1299, disc:20, stock:80,  img:'tshirt',   desc:'Moisture-wicking AEROREADY training tee with 3-stripe sleeves.' },
  { title:'Nike Dri-FIT Tee',                 brand:'Nike',            cat:'Active T-Shirts',               price:1499, disc:15, stock:75,  img:'tshirt',   desc:'Sweat-wicking Dri-FIT tee for training and runs.' },
  { title:'Puma Active Training Tee',         brand:'Puma',            cat:'Active T-Shirts',               price:999,  disc:20, stock:90,  img:'tshirt',   desc:'Lightweight performance tee with dryCELL moisture management.' },

  // ── Athleisure › Jackets & Sweatshirts ──────────────────────────────────────
  { title:'Adidas Tiro Track Jacket',         brand:'Adidas',          cat:'Jackets & Sweatshirts',         price:2999, disc:20, stock:55,  img:'jacket',   desc:'Iconic Tiro jacket with contrast 3-stripes and zip pockets.' },
  { title:'Nike Therma Sweatshirt',           brand:'Nike',            cat:'Jackets & Sweatshirts',         price:2799, disc:15, stock:50,  img:'sweater',  desc:'Therma-FIT fleece sweatshirt for cold-weather training.' },

  // ── Athleisure › Track Pants & Joggers ──────────────────────────────────────
  { title:'Adidas Essentials Joggers',        brand:'Adidas',          cat:'Track Pants & Joggers',         price:2299, disc:20, stock:65,  img:'jogger',   desc:'French terry joggers with tapered cut and zip pockets.' },
  { title:'Puma Training Joggers',            brand:'Puma',            cat:'Track Pants & Joggers',         price:1999, disc:15, stock:70,  img:'jogger',   desc:'Slim-fit training joggers with dryCELL moisture management.' },
  { title:'Reebok Training Track Pants',      brand:'Reebok',          cat:'Track Pants & Joggers',         price:1799, disc:20, stock:60,  img:'trackpant',desc:'Lightweight track pants with mesh panels for ventilation.' },

  // ── Athleisure › Cargos ─────────────────────────────────────────────────────
  { title:'Nike Sportswear Cargo Pants',      brand:'Nike',            cat:'Cargos',                        price:3499, disc:15, stock:45,  img:'trackpant',desc:'Woven cargo pants with multiple utility pockets.' },

  // ── Athleisure › Tracksuits & Sets ──────────────────────────────────────────
  { title:'Adidas Tracksuit Set',             brand:'Adidas',          cat:'Tracksuits & Sets',             price:4999, disc:20, stock:35,  img:'trackpant',desc:'Matching track jacket and jogger set in French terry.' },
  { title:'Puma Training Tracksuit',          brand:'Puma',            cat:'Tracksuits & Sets',             price:4499, disc:15, stock:30,  img:'trackpant',desc:'Zip-up jacket and slim-leg pants set with Puma branding.' },

  // ── Jeans (direct child of Men) ─────────────────────────────────────────────
  { title:"Levi's 511 Slim Fit Jeans",        brand:"Levi's",          cat:'Jeans',                         price:2999, disc:20, stock:70,  img:'jeans',    desc:'Classic slim-fit jeans in mid-wash stretch denim.' },
  { title:'Wrangler Regular Jeans',           brand:'Wrangler',        cat:'Jeans',                         price:2499, disc:15, stock:80,  img:'jeans',    desc:'Straight-leg regular-fit jeans in classic dark rinse.' },
  { title:'Calvin Klein Skinny Jeans',        brand:'Calvin Klein',    cat:'Jeans',                         price:3999, disc:20, stock:55,  img:'jeans',    desc:'Five-pocket skinny jeans in clean indigo wash.' },

  // ── Footwear › Casual Shoes & Loafers ───────────────────────────────────────
  { title:'Skechers Slip-On Loafers',         brand:'Skechers',        cat:'Casual Shoes & Loafers',        price:3499, disc:20, stock:55,  img:'sneakers', desc:'Memory Foam slip-on loafers in premium suede.' },

  // ── Footwear › Sports Shoes ─────────────────────────────────────────────────
  { title:'Adidas Ultraboost Running Shoes',  brand:'Adidas',          cat:'Sports Shoes',                  price:8999, disc:10, stock:40,  img:'sneakers', desc:'Boost cushioned running shoes with Primeknit upper.' },
  { title:'Nike Air Max Shoes',               brand:'Nike',            cat:'Sports Shoes',                  price:9999, disc:10, stock:35,  img:'sneakers', desc:'Visible Air unit with Phylon midsole for all-day cushioning.' },
  { title:'Puma Softride Sports Shoes',       brand:'Puma',            cat:'Sports Shoes',                  price:4499, disc:20, stock:50,  img:'sneakers', desc:'SoftFoam+ insole running shoes with mesh upper.' },
  { title:'Reebok Nano Training Shoes',       brand:'Reebok',          cat:'Sports Shoes',                  price:5999, disc:15, stock:45,  img:'sneakers', desc:'Versatile cross-training shoes with Floatride Energy Foam.' },
  { title:'Skechers Go Walk Shoes',           brand:'Skechers',        cat:'Sports Shoes',                  price:3999, disc:25, stock:60,  img:'sneakers', desc:'Ultra-lightweight walking shoes with ULTRA GO cushioning.' },

  // ── Footwear › Formal Shoes ─────────────────────────────────────────────────
  { title:'Allen Solly Leather Derby',        brand:'Allen Solly',     cat:'Formal Shoes',                  price:2999, disc:20, stock:50,  img:'formal',   desc:'Classic full-brogue derby shoes in genuine leather.' },

  // ── Footwear › Sandals & Floaters ───────────────────────────────────────────
  { title:'Puma Sport Floaters',              brand:'Puma',            cat:'Sandals & Floaters',            price:1799, disc:20, stock:65,  img:'sandals',  desc:'Lightweight sport sandals with hook-and-loop strap closure.' },
  { title:'Adidas Comfort Sandals',           brand:'Adidas',          cat:'Sandals & Floaters',            price:1999, disc:15, stock:60,  img:'sandals',  desc:'Cloudfoam cushioned sport sandals with adjustable straps.' },

  // ── Footwear › Flip Flops & Sliders ────────────────────────────────────────
  { title:'Adidas Adilette Sliders',          brand:'Adidas',          cat:'Flip Flops & Sliders',          price:1499, disc:20, stock:80,  img:'sliders',  desc:'Classic Adilette sliders with contoured Cloud Foam footbed.' },
  { title:'Puma Lead Cat Sliders',            brand:'Puma',            cat:'Flip Flops & Sliders',          price:1299, disc:15, stock:70,  img:'sliders',  desc:'Soft EVA sliders with embossed Puma cat logo.' },

  // ── Footwear › Boots ────────────────────────────────────────────────────────
  { title:'Skechers Relaxed Fit Boots',       brand:'Skechers',        cat:'Boots',                         price:4999, disc:15, stock:35,  img:'sneakers', desc:'Memory Foam ankle boots with lace-up closure and padded collar.' },

  // ── Footwear › Socks ────────────────────────────────────────────────────────
  { title:'Jockey Ankle Socks Pack of 3',     brand:'Jockey',          cat:'Socks',                         price:399,  disc:10, stock:150, img:'socks',    desc:'Cushioned combed-cotton ankle socks with reinforced heel.' },

  // ── Indian & Festive Wear › Kurtas ──────────────────────────────────────────
  { title:'Raymond Cotton Kurta',             brand:'Raymond',         cat:'Kurtas',                        price:1999, disc:15, stock:45,  img:'kurta',    desc:'Straight-cut cotton kurta with mandarin collar and placket.' },
  { title:'Allen Solly Festive Kurta',        brand:'Allen Solly',     cat:'Kurtas',                        price:2499, disc:20, stock:35,  img:'kurta',    desc:'Embroidered festive kurta in silk-blend fabric.' },

  // ── Indian & Festive Wear › Kurta Sets ──────────────────────────────────────
  { title:'Raymond Kurta Pyjama Set',         brand:'Raymond',         cat:'Kurta Sets',                    price:3499, disc:15, stock:30,  img:'kurta',    desc:'Printed cotton kurta with matching straight pyjama.' },

  // ── Indian & Festive Wear › Nehru Jackets ───────────────────────────────────
  { title:'Van Heusen Nehru Jacket',          brand:'Van Heusen',      cat:'Nehru Jackets',                 price:2999, disc:20, stock:30,  img:'nehru',    desc:'Mandarin-collar Nehru jacket in textured Zari fabric.' },

  // ── Indian & Festive Wear › Dhotis & Pyjamas ────────────────────────────────
  { title:'Raymond Cotton Dhoti',             brand:'Raymond',         cat:'Dhotis & Pyjamas',              price:1299, disc:10, stock:50,  img:'dhoti',    desc:'Handloom cotton dhoti with woven gold border.' },

  // ── Accessories › Belts ─────────────────────────────────────────────────────
  { title:'Louis Philippe Leather Belt',      brand:'Louis Philippe',  cat:'Belts',                         price:1299, disc:20, stock:70,  img:'belt',     desc:'Full-grain leather belt with pin-buckle in brushed nickel.' },
  { title:'Allen Solly Reversible Belt',      brand:'Allen Solly',     cat:'Belts',                         price:999,  disc:15, stock:80,  img:'belt',     desc:'Reversible black and tan leather belt with silver buckle.' },

  // ── Accessories › Caps & Hats ───────────────────────────────────────────────
  { title:'Adidas Baseball Cap',              brand:'Adidas',          cat:'Caps & Hats',                   price:799,  disc:20, stock:100, img:'cap',      desc:'Structured 6-panel cap with 3-stripes logo and adjustable strap.' },
  { title:'Puma Sports Cap',                  brand:'Puma',            cat:'Caps & Hats',                   price:699,  disc:15, stock:90,  img:'cap',      desc:'Lightweight performance cap with ventilation eyelets.' },

  // ── Accessories › Handkerchiefs ─────────────────────────────────────────────
  { title:'Van Heusen Linen Handkerchiefs',   brand:'Van Heusen',      cat:'Handkerchiefs',                 price:349,  disc:10, stock:120, img:'scarf',    desc:'Pack of 3 pure linen handkerchiefs with contrast border.' },

  // ── Accessories › Wallets ───────────────────────────────────────────────────
  { title:'Tommy Hilfiger Slim Wallet',       brand:'Tommy Hilfiger',  cat:'Wallets',                       price:2499, disc:20, stock:55,  img:'wallet',   desc:'Slim bi-fold wallet in smooth genuine leather with logo tab.' },
  { title:'Calvin Klein Bifold Wallet',       brand:'Calvin Klein',    cat:'Wallets',                       price:2999, disc:15, stock:45,  img:'wallet',   desc:'Minimalist bifold wallet in nappa leather with card slots.' },

  // ── Accessories › Sunglasses ────────────────────────────────────────────────
  { title:'Rayban Aviator Sunglasses',        brand:'Rayban',          cat:'Sunglasses',                    price:6999, disc:10, stock:35,  img:'sunglasses',desc:'Iconic metal aviator with UV-protective glass lenses.' },
  { title:'Carrera Sport Sunglasses',         brand:'Carrera',         cat:'Sunglasses',                    price:4999, disc:15, stock:40,  img:'sunglasses',desc:'Sport-wrap sunglasses with polarised lenses and rubberised arms.' },
  { title:'Tom Ford Square Sunglasses',       brand:'Tom Ford',        cat:'Sunglasses',                    price:19999,disc:10, stock:20,  img:'sunglasses',desc:'Bold square acetate frame with gradient tinted lenses.' },

  // ── Accessories › Ties & Pocket Squares ─────────────────────────────────────
  { title:'Van Heusen Silk Tie',              brand:'Van Heusen',      cat:'Ties & Pocket Squares',         price:1199, disc:20, stock:65,  img:'tie',      desc:'100% pure silk woven tie with matching pocket square.' },
  { title:'Louis Philippe Repp Stripe Tie',   brand:'Louis Philippe',  cat:'Ties & Pocket Squares',         price:1499, disc:15, stock:60,  img:'tie',      desc:'Classic repp-stripe silk tie in navy and gold.' },

  // ── Innerwear & Sleepwear › Vests ───────────────────────────────────────────
  { title:'Jockey Classic Cotton Vests',      brand:'Jockey',          cat:'Vests',                         price:599,  disc:10, stock:120, img:'innerwear',desc:'Pack of 3 tagless combed-cotton vests for all-day comfort.' },

  // ── Innerwear & Sleepwear › Loungewear T-Shirts ─────────────────────────────
  { title:'Jockey Lounge T-Shirt',            brand:'Jockey',          cat:'Loungewear T-Shirts',           price:699,  disc:10, stock:90,  img:'tshirt',   desc:'Ultra-soft cotton lounge tee with relaxed fit.' },

  // ── Innerwear & Sleepwear › Shorts Pyjamas & Loose Pants ────────────────────
  { title:'Jockey Cotton Shorts Pyjama',      brand:'Jockey',          cat:'Shorts Pyjamas & Loose Pants',  price:899,  disc:10, stock:80,  img:'pyjama',   desc:'Drawstring cotton shorts pyjama with side pockets.' },

  // ── Innerwear & Sleepwear › Briefs & Trunks ─────────────────────────────────
  { title:'Jockey Mid-Rise Trunks Pack',      brand:'Jockey',          cat:'Briefs & Trunks',               price:799,  disc:15, stock:100, img:'innerwear',desc:'Pack of 2 mid-rise cotton trunks with elasticated waistband.' },

  // ── Winterwear › Sweaters & Cardigans ───────────────────────────────────────
  { title:'Tommy Hilfiger Merino Sweater',    brand:'Tommy Hilfiger',  cat:'Sweaters & Cardigans',          price:4999, disc:20, stock:45,  img:'sweater',  desc:'Soft merino-blend crew-neck sweater with embroidered flag logo.' },
  { title:'Calvin Klein Cotton Cardigan',     brand:'Calvin Klein',    cat:'Sweaters & Cardigans',          price:4499, disc:15, stock:40,  img:'sweater',  desc:'Open-front cotton cardigan with ribbed placket and hem.' },

  // ── Winterwear › Sweatshirts & Pullovers ────────────────────────────────────
  { title:'Adidas Essentials Sweatshirt',     brand:'Adidas',          cat:'Sweatshirts & Pullovers',       price:1999, disc:20, stock:75,  img:'sweater',  desc:'French terry sweatshirt with embroidered Adidas badge of sport.' },
  { title:'Puma Amplified Sweatshirt',        brand:'Puma',            cat:'Sweatshirts & Pullovers',       price:1799, disc:25, stock:70,  img:'sweater',  desc:'Fleece-back sweatshirt with large Puma graphic on chest.' },

  // ── Winterwear › Jackets & Coats ────────────────────────────────────────────
  { title:'Tommy Hilfiger Puffer Jacket',     brand:'Tommy Hilfiger',  cat:'Jackets & Coats',               price:7999, disc:20, stock:30,  img:'jacket',   desc:'Packable down-fill puffer jacket with stand-up collar.' },
  { title:'Calvin Klein Overcoat',            brand:'Calvin Klein',    cat:'Jackets & Coats',               price:9999, disc:15, stock:20,  img:'blazer',   desc:'Double-breasted wool-blend overcoat with notch lapels.' },

  // ── Winterwear › Thermals ───────────────────────────────────────────────────
  { title:'Jockey Thermal Set',               brand:'Jockey',          cat:'Thermals',                      price:1299, disc:10, stock:80,  img:'thermals', desc:'Crew-neck thermal top and bottom set in waffle-knit fabric.' },

  // ── Watches › Smart Watches & Fitness Bands ─────────────────────────────────
  { title:'Fossil Gen 6 Smartwatch',          brand:'Fossil',          cat:'Smart Watches & Fitness Bands', price:17999,disc:20, stock:25,  img:'smartwatch',desc:'Wear OS smartwatch with heart rate, GPS and NFC payments.' },
  { title:'Titan Crest Smartwatch',           brand:'Titan',           cat:'Smart Watches & Fitness Bands', price:5999, disc:15, stock:40,  img:'smartwatch',desc:'Full-touch AMOLED smartwatch with SpO2 and 14-day battery.' },

  // ── Watches › Analog Watches ────────────────────────────────────────────────
  { title:'Fossil Neutra Analog Watch',       brand:'Fossil',          cat:'Analog Watches',                price:9999, disc:20, stock:30,  img:'watch',    desc:'Minimalist stainless-steel case with mesh bracelet and date.' },
  { title:'Titan Regalia Analog Watch',       brand:'Titan',           cat:'Analog Watches',                price:6999, disc:10, stock:35,  img:'watch',    desc:'Sapphire-glass analog with exhibition caseback.' },

  // ── Watches › Chronograph Watches ───────────────────────────────────────────
  { title:'Fossil Townsman Chronograph',      brand:'Fossil',          cat:'Chronograph Watches',           price:13999,disc:15, stock:20,  img:'watch',    desc:'Multi-function chronograph with tachymeter and leather strap.' },
  { title:'Titan Octane Chronograph',         brand:'Titan',           cat:'Chronograph Watches',           price:8999, disc:10, stock:25,  img:'watch',    desc:'Sports chronograph with 100m water resistance and rubber strap.' },

  // ── Watches › Digital Watches ───────────────────────────────────────────────
  { title:'Casio G-Shock Digital Watch',      brand:'Casio',           cat:'Digital Watches',               price:4999, disc:15, stock:40,  img:'digital',  desc:'Shock-resistant G-Shock with EL backlight and 200m water resistance.' },
  { title:'Casio Edifice Solar Digital',      brand:'Casio',           cat:'Digital Watches',               price:3499, disc:20, stock:45,  img:'digital',  desc:'Solar-powered digital watch with world time and stopwatch.' },
];

const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL'];
const SIZES_SHOES    = ['6', '7', '8', '9', '10'];
const SIZES_NONE     = ['One Size'];

function getSizes(img) {
  if (['sneakers', 'formal', 'sandals', 'sliders'].includes(img)) return SIZES_SHOES.slice(0, 4);
  if (['watch', 'digital', 'smartwatch', 'belt', 'wallet', 'cap', 'sunglasses', 'tie', 'socks', 'scarf', 'perfume'].includes(img)) return SIZES_NONE;
  return SIZES_CLOTHING.slice(0, 4);
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
       VALUES ($1,$2,$3,$4,$5,'men',$6,$7,$8,'active') RETURNING id`,
      [p.title, sl, brandId, catId, p.desc, p.price, p.disc, p.stock]
    );

    const primaryImg = IMG[p.img] || IMG.tshirt;
    const altKey     = Object.keys(IMG)[(count + 3) % Object.keys(IMG).length];
    const altImg     = IMG[altKey] !== primaryImg ? IMG[altKey] : IMG.shirt;
    for (const [j, url] of [primaryImg, altImg].entries()) {
      await client.query(
        `INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES ($1,$2,$3,$4)`,
        [product.id, url, j === 0, j]
      );
    }

    const sizes = getSizes(p.img);
    for (const size of sizes) {
      await client.query(
        `INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price) VALUES ($1,$2,$3,$4,$5,0)`,
        [product.id, size, 'Navy', `${sl}-${size}`.slice(0, 50), Math.ceil(p.stock / sizes.length)]
      );
    }

    count++;
    console.log(`✓ [${count}] ${p.title} → ${p.cat}`);
  }

  await client.query('COMMIT');
  console.log(`\n✅ ${count} men's products seeded across all subcategories.`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌ Failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
