import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function slugify(title, suffix) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + suffix;
}

const client = await pool.connect();
const { rows: brands }     = await client.query('SELECT id, name FROM brands ORDER BY id');
const { rows: categories } = await client.query('SELECT id, name, slug FROM categories');

function brand(name) { return (brands.find(b => b.name === name) || brands[0]).id; }
function cat(name)   { return (categories.find(c => c.name === name || c.slug === name) || categories[0]).id; }

const IMG = {
  foundation:   'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
  lipstick:     'https://images.unsplash.com/photo-1586495777744-4e6232bf2177?w=800',
  eyeshadow:    'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=800',
  mascara:      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
  skincare:     'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
  serum:        'https://images.unsplash.com/photo-1570194065650-d99fb4b38250?w=800',
  perfume:      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800',
  haircare:     'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
  nailpolish:   'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
  bodycare:     'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800',
  blush:        'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=800',
  cleanser:     'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
  sunscreen:    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
  hairdryer:    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
  shaving:      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
  bodywash:     'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800',
  lipbalm:      'https://images.unsplash.com/photo-1586495777744-4e6232bf2177?w=800',
  concealer:    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
  palette:      'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=800',
  kajal:        'https://images.unsplash.com/photo-1510590337863-2f85f3b1d0f9?w=800',
};

const PRODUCTS = [
  // ── Makeup › Face › Foundations ─────────────────────────────────────────────
  { title:'M.A.C Studio Fix Fluid Foundation',      brand:'M.A.C',          cat:'Foundations',                    price:3400, disc:10, stock:80,  img:'foundation', desc:'Full-coverage liquid foundation with SPF 15. Natural matte finish. 40+ shades.', gender:'women' },
  { title:'Estee Lauder Double Wear Foundation',    brand:'Estee Lauder',   cat:'Foundations',                    price:4200, disc:15, stock:65,  img:'foundation', desc:'24-hour wear foundation that stays fresh and looks natural all day.', gender:'women' },
  { title:'Bobbi Brown Skin Foundation SPF15',      brand:'Bobbi Brown',    cat:'Foundations',                    price:4500, disc:10, stock:55,  img:'foundation', desc:'Lightweight, buildable coverage for a second-skin finish.', gender:'women' },
  { title:'Clinique Even Better Foundation',        brand:'Clinique',       cat:'Foundations',                    price:3800, disc:12, stock:60,  img:'foundation', desc:'Improves skin tone with every wear. SPF 15. Allergy tested.', gender:'women' },

  // ── Makeup › Face › Concealers ──────────────────────────────────────────────
  { title:'NARS Radiant Creamy Concealer',          brand:'NARS',           cat:'Concealers',                     price:2800, disc:10, stock:75,  img:'concealer',  desc:'Creamy, full-coverage concealer with a luminous finish for under eyes.', gender:'women' },
  { title:'Clinique Beyond Perfecting Concealer',   brand:'Clinique',       cat:'Concealers',                     price:2400, disc:10, stock:70,  img:'concealer',  desc:'Buildable coverage in a smoothing formula. Allergy tested.', gender:'women' },

  // ── Makeup › Face › Face Primers ────────────────────────────────────────────
  { title:'Smashbox Photo Finish Primer',           brand:'Smashbox',       cat:'Face Primers',                   price:2600, disc:12, stock:60,  img:'skincare',   desc:'Iconic silky primer that smooths pores and extends makeup wear.', gender:'women' },
  { title:'M.A.C Prep + Prime Fix+',               brand:'M.A.C',          cat:'Face Primers',                   price:1800, disc:10, stock:80,  img:'skincare',   desc:'Hydrating primer spray that refreshes skin and sets makeup.', gender:'women' },

  // ── Makeup › Face › BB & CC Creams ──────────────────────────────────────────
  { title:'Clinique Moisture Surge CC Cream',       brand:'Clinique',       cat:'BB & CC Creams',                 price:2500, disc:15, stock:55,  img:'skincare',   desc:'5-in-1 color-correcting cream with SPF 30 and all-day hydration.', gender:'women' },
  { title:'Smashbox Camera Ready BB Water',         brand:'Smashbox',       cat:'BB & CC Creams',                 price:2200, disc:10, stock:50,  img:'skincare',   desc:'Lightweight BB water for dewy, natural coverage with SPF 30.', gender:'women' },

  // ── Makeup › Face › Blushes ─────────────────────────────────────────────────
  { title:'NARS Orgasm Blush',                      brand:'NARS',           cat:'Blushes',                        price:3200, disc:10, stock:60,  img:'blush',      desc:'Iconic peachy-pink blush with golden shimmer for a lit-from-within glow.', gender:'women' },
  { title:'M.A.C Powder Blush',                     brand:'M.A.C',          cat:'Blushes',                        price:2400, disc:10, stock:65,  img:'blush',      desc:'Silky powder blush with buildable colour and lasting wear.', gender:'women' },

  // ── Makeup › Face › Bronzers ────────────────────────────────────────────────
  { title:'Bobbi Brown Bronzing Powder',            brand:'Bobbi Brown',    cat:'Bronzers',                       price:4000, disc:10, stock:40,  img:'blush',      desc:'Natural-looking bronzer that warms skin without looking orange.', gender:'women' },

  // ── Makeup › Face › Highlighters & Illuminators ─────────────────────────────
  { title:'NARS Highlighting Powder',               brand:'NARS',           cat:'Highlighters & Illuminators',    price:3500, disc:10, stock:45,  img:'blush',      desc:'Buildable, strobe-light illuminating powder for a brilliant glow.', gender:'women' },

  // ── Makeup › Face › Setting Sprays ──────────────────────────────────────────
  { title:'Smashbox Always On Setting Spray',       brand:'Smashbox',       cat:'Setting Sprays',                 price:2000, disc:15, stock:55,  img:'skincare',   desc:'Long-wearing setting spray that locks makeup for up to 16 hours.', gender:'women' },

  // ── Makeup › Face › Compacts ────────────────────────────────────────────────
  { title:'M.A.C Studio Fix Powder Plus',           brand:'M.A.C',          cat:'Compacts',                       price:2800, disc:10, stock:60,  img:'foundation', desc:'Full-coverage pressed powder that sets foundation and controls oil.', gender:'women' },
  { title:'Estee Lauder Double Wear Stay-in-Place', brand:'Estee Lauder',   cat:'Compacts',                       price:3600, disc:10, stock:50,  img:'foundation', desc:'Long-wearing powder foundation with a natural matte finish.', gender:'women' },

  // ── Makeup › Eyes › Mascaras ────────────────────────────────────────────────
  { title:'M.A.C Extended Play Gigablack Lash',     brand:'M.A.C',          cat:'Mascaras',                       price:2200, disc:10, stock:80,  img:'mascara',    desc:'Intense, jet-black mascara that lengthens and separates lashes.', gender:'women' },
  { title:'Estee Lauder Sumptuous Extreme Mascara', brand:'Estee Lauder',   cat:'Mascaras',                       price:2800, disc:12, stock:70,  img:'mascara',    desc:'Curved brush mascara that lifts, lengthens and dramatically volumes lashes.', gender:'women' },
  { title:'Clinique High Impact Mascara',           brand:'Clinique',       cat:'Mascaras',                       price:2400, disc:10, stock:75,  img:'mascara',    desc:'Clump-free mascara for defined, full-looking lashes. Ophthalmologist tested.', gender:'women' },

  // ── Makeup › Eyes › Eyeliners ───────────────────────────────────────────────
  { title:'M.A.C Technakohl Liner',                 brand:'M.A.C',          cat:'Eyeliners',                      price:1800, disc:10, stock:90,  img:'kajal',      desc:'Super-smooth liner pencil with smudge-proof colour that lasts.', gender:'women' },
  { title:'NARS Eyeliner Stylo',                    brand:'NARS',           cat:'Eyeliners',                      price:2200, disc:10, stock:65,  img:'kajal',      desc:'Precision felt-tip liquid liner for sharp, graphic eye looks.', gender:'women' },

  // ── Makeup › Eyes › Kajals ──────────────────────────────────────────────────
  { title:'Stop Intense Kajal Black',               brand:'Stop',           cat:'Kajals',                         price:299,  disc:20, stock:150, img:'kajal',      desc:'Long-lasting waterproof kajal pencil for bold, defined eyes.', gender:'women' },
  { title:'Stop Smoky Kajal Duo',                   brand:'Stop',           cat:'Kajals',                         price:399,  disc:15, stock:120, img:'kajal',      desc:'Double-ended kajal with jet black and smudge brush for smoky looks.', gender:'women' },

  // ── Makeup › Eyes › Eyeshadows ──────────────────────────────────────────────
  { title:'M.A.C Eye Shadow Single',               brand:'M.A.C',          cat:'Eyeshadows',                     price:1600, disc:10, stock:85,  img:'eyeshadow',  desc:'Highly pigmented single eyeshadow in matte, satin and shimmer finishes.', gender:'women' },
  { title:'NARS Single Eyeshadow',                  brand:'NARS',           cat:'Eyeshadows',                     price:2000, disc:10, stock:70,  img:'eyeshadow',  desc:'Richly pigmented pressed powder shadow with exceptional blendability.', gender:'women' },

  // ── Makeup › Eyes › Eye Palettes & Sets ─────────────────────────────────────
  { title:'Smashbox Cover Shot Eye Palette',        brand:'Smashbox',       cat:'Eye Palettes & Sets',            price:3800, disc:15, stock:45,  img:'palette',    desc:'9-pan editorial palette with a mix of mattes, shimmers and metallic shades.', gender:'women' },
  { title:'Bobbi Brown Nude On Nude Eye Palette',   brand:'Bobbi Brown',    cat:'Eye Palettes & Sets',            price:5500, disc:10, stock:35,  img:'palette',    desc:'12 wearable nude shades for effortless everyday and evening looks.', gender:'women' },

  // ── Makeup › Lips › Lipsticks ───────────────────────────────────────────────
  { title:'M.A.C Matte Lipstick',                   brand:'M.A.C',          cat:'Lipsticks',                      price:2000, disc:10, stock:100, img:'lipstick',   desc:'Iconic M.A.C matte lipstick — intensely pigmented with 8-hour wear.', gender:'women' },
  { title:'Estee Lauder Pure Color Envy Lipstick',  brand:'Estee Lauder',   cat:'Lipsticks',                      price:3200, disc:12, stock:75,  img:'lipstick',   desc:'High-impact lipstick with sculpting colour and a velvety finish.', gender:'women' },
  { title:'NARS Audacious Lipstick',                brand:'NARS',           cat:'Lipsticks',                      price:3600, disc:10, stock:65,  img:'lipstick',   desc:'Rich, hydrating lipstick with brilliant colour pay-off in 52 shades.', gender:'women' },
  { title:'Bobbi Brown Luxe Lip Color',             brand:'Bobbi Brown',    cat:'Lipsticks',                      price:3800, disc:10, stock:60,  img:'lipstick',   desc:'Silky lipstick infused with nourishing argan and camellia oils.', gender:'women' },

  // ── Makeup › Lips › Lip Glosses ─────────────────────────────────────────────
  { title:'M.A.C Lipglass',                         brand:'M.A.C',          cat:'Lip Glosses',                    price:1800, disc:10, stock:85,  img:'lipstick',   desc:'Superslick, super-shiny lip gloss with moisturising vitamin E.', gender:'women' },
  { title:'Clinique Almost Lipstick',               brand:'Clinique',       cat:'Lip Glosses',                    price:2200, disc:10, stock:70,  img:'lipstick',   desc:'Sheer, buildable lip colour with a glossy finish. Fragrance-free.', gender:'women' },

  // ── Makeup › Lips › Lip Balms & Treatments ──────────────────────────────────
  { title:'Clinique Dramatically Different Lip',    brand:'Clinique',       cat:'Lip Balms & Treatments',         price:1600, disc:10, stock:90,  img:'lipbalm',    desc:'Concentrated moisturising treatment that leaves lips visibly softer.', gender:'women' },
  { title:'Elizabeth Arden 8-Hour Lip Protectant', brand:'Elizabeth Arden', cat:'Lip Balms & Treatments',         price:1800, disc:10, stock:80,  img:'lipbalm',    desc:'Iconic hydrating balm that soothes, softens and protects lips.', gender:'women' },

  // ── Makeup › Nails › Nail Polishes ──────────────────────────────────────────
  { title:'Stop Gel Nail Polish Red',               brand:'Stop',           cat:'Nail Polishes',                  price:299,  disc:20, stock:130, img:'nailpolish', desc:'Long-lasting gel-effect nail polish in classic red. Chip-resistant formula.', gender:'women' },
  { title:'Stop Nail Polish Nude Collection',       brand:'Stop',           cat:'Nail Polishes',                  price:249,  disc:20, stock:140, img:'nailpolish', desc:'Smooth, glossy nail colour in 3 wearable nude shades.', gender:'women' },
  { title:'Stop Glitter Nail Polish',               brand:'Stop',           cat:'Nail Polishes',                  price:349,  disc:15, stock:110, img:'nailpolish', desc:'Party-ready glitter nail polish with fine gold shimmer particles.', gender:'women' },

  // ── Makeup › Nails › Nail Care & Tools ──────────────────────────────────────
  { title:'Stop Nail Care Kit',                     brand:'Stop',           cat:'Nail Care & Tools',              price:599,  disc:20, stock:80,  img:'nailpolish', desc:'Complete nail care set with file, buffer, cuticle pusher and nail oil.', gender:'women' },

  // ── Skin › Cleansers & Exfoliators › Face Washes ────────────────────────────
  { title:'Clinique Liquid Facial Soap',            brand:'Clinique',       cat:'Face Washes',                    price:1800, disc:10, stock:90,  img:'cleanser',   desc:'Allergy-tested, gentle liquid cleanser that removes impurities without stripping.', gender:'women' },
  { title:'Shiseido Perfect Cleansing Oil',         brand:'Shiseido',       cat:'Face Washes',                    price:3200, disc:12, stock:60,  img:'cleanser',   desc:'Melts away makeup and impurities without leaving residue. Skin-softening.', gender:'women' },
  { title:'Clarins Cleansing Milk',                 brand:'Clarins',        cat:'Face Washes',                    price:2800, disc:10, stock:65,  img:'cleanser',   desc:'Gentle plant-powered cleansing milk for sensitive and dry skin types.', gender:'women' },

  // ── Skin › Cleansers & Exfoliators › Scrubs & Exfoliators ───────────────────
  { title:'Clinique 7 Day Scrub Cream Rinse-Off',  brand:'Clinique',       cat:'Scrubs & Exfoliators',           price:2200, disc:10, stock:55,  img:'cleanser',   desc:'Gentle daily exfoliating scrub for baby-smooth skin. Allergy tested.', gender:'women' },
  { title:'Shiseido Waso Pore Mist Softener',       brand:'Shiseido',       cat:'Scrubs & Exfoliators',           price:3000, disc:12, stock:50,  img:'cleanser',   desc:'Gentle exfoliating mist that minimises the look of pores.', gender:'women' },

  // ── Skin › Toners & Mists ────────────────────────────────────────────────────
  { title:'Clinique Clarifying Lotion 2',           brand:'Clinique',       cat:'Toners & Mists',                 price:2400, disc:10, stock:70,  img:'skincare',   desc:'Exfoliating toner that removes dead skin cells and preps skin for moisturiser.', gender:'women' },
  { title:'Shiseido Treatment Softener',            brand:'Shiseido',       cat:'Toners & Mists',                 price:4200, disc:10, stock:50,  img:'skincare',   desc:'Firming treatment toner that boosts skin resilience and hydration.', gender:'women' },

  // ── Skin › Moisturizers › Face Moisturizers & Day Creams ─────────────────────
  { title:'Shiseido Essential Energy Day Cream',   brand:'Shiseido',       cat:'Face Moisturizers & Day Creams', price:5500, disc:10, stock:45,  img:'skincare',   desc:'SPF 20 day cream that revitalizes skin energy and boosts radiance.', gender:'women' },
  { title:'Clarins Multi-Active Day Cream',         brand:'Clarins',        cat:'Face Moisturizers & Day Creams', price:4800, disc:12, stock:50,  img:'skincare',   desc:'Anti-ageing day cream with plant cell extracts for youthful radiance.', gender:'women' },
  { title:'Elizabeth Arden Visible Difference',     brand:'Elizabeth Arden', cat:'Face Moisturizers & Day Creams', price:3800, disc:15, stock:55, img:'skincare',   desc:'Iconic moisturising complex that visibly transforms skin in 24 hours.', gender:'women' },

  // ── Skin › Moisturizers › Night Creams ──────────────────────────────────────
  { title:'Estee Lauder Advanced Night Repair',     brand:'Estee Lauder',   cat:'Night Creams',                   price:6800, disc:10, stock:40,  img:'serum',      desc:'Breakthrough multi-correction cream. Works with skin\'s night repair cycle.', gender:'women' },
  { title:'Clarins Multi-Intensive Night Cream',    brand:'Clarins',        cat:'Night Creams',                   price:5500, disc:10, stock:35,  img:'skincare',   desc:'Intensive night recovery cream with hyaluronic acid and plant extracts.', gender:'women' },

  // ── Skin › Moisturizers › Face Serums ───────────────────────────────────────
  { title:'Estee Lauder Advanced Night Repair Serum', brand:'Estee Lauder', cat:'Face Serums',                    price:8500, disc:10, stock:40,  img:'serum',      desc:'#1 best-selling serum. Reduces the look of lines and boosts radiance overnight.', gender:'women' },
  { title:'Shiseido Ultimune Power Infusing Serum', brand:'Shiseido',       cat:'Face Serums',                    price:9000, disc:10, stock:30,  img:'serum',      desc:'Immunizing serum that strengthens skin\'s barrier and defences against stress.', gender:'women' },
  { title:'Clinique Smart Clinical Repair Serum',   brand:'Clinique',       cat:'Face Serums',                    price:6500, disc:12, stock:35,  img:'serum',      desc:'Retinol + peptide-powered serum for visibly smoother, firmer skin.', gender:'women' },

  // ── Skin › Eye Care ──────────────────────────────────────────────────────────
  { title:'Estee Lauder Advanced Night Repair Eye', brand:'Estee Lauder',   cat:'Eye Care',                       price:5500, disc:10, stock:40,  img:'serum',      desc:'Eye-synchronised recovery complex. Reduces look of dark circles and puffiness.', gender:'women' },
  { title:'Shiseido Benefiance Wrinkle Resist Eye', brand:'Shiseido',       cat:'Eye Care',                       price:6000, disc:10, stock:35,  img:'skincare',   desc:'Firming eye cream that targets crows feet and under-eye puffiness.', gender:'women' },

  // ── Skin › Masks & Treatments ────────────────────────────────────────────────
  { title:'Clarins Instant Smooth Perfecting Touch', brand:'Clarins',       cat:'Masks & Treatments',             price:3800, disc:10, stock:50,  img:'skincare',   desc:'Velvet-smooth primer-mask that blurs pores and perfects skin texture.', gender:'women' },
  { title:'Clinique Turnaround Overnight Radiance', brand:'Clinique',       cat:'Masks & Treatments',             price:4200, disc:10, stock:40,  img:'skincare',   desc:'Overnight sleeping mask with retinol and vitamin C for visible radiance.', gender:'women' },

  // ── Skin › Sun Care ──────────────────────────────────────────────────────────
  { title:'Shiseido Urban Environment UV Protection', brand:'Shiseido',     cat:'Sun Care',                       price:4500, disc:10, stock:55,  img:'sunscreen',  desc:'SPF 50 daily sunscreen with antioxidant-rich formula. Water-resistant.', gender:'women' },
  { title:'Clinique Broad Spectrum SPF 45',          brand:'Clinique',      cat:'Sun Care',                       price:3500, disc:12, stock:60,  img:'sunscreen',  desc:'Sheer sunscreen fluid with SPF 45 UVA/UVB protection. Fragrance-free.', gender:'women' },

  // ── Skin › Beauty & Hair Accessories › Makeup Tools ─────────────────────────
  { title:'M.A.C 187 Duo Fibre Face Brush',         brand:'M.A.C',          cat:'Makeup Tools',                   price:3200, disc:10, stock:50,  img:'skincare',   desc:'Duo-fibre brush for seamless blending of powder, blush and bronzer.', gender:'women' },
  { title:'Bobbi Brown Full Coverage Face Brush',   brand:'Bobbi Brown',    cat:'Makeup Tools',                   price:2800, disc:10, stock:45,  img:'skincare',   desc:'Densely packed brush for full-coverage powder foundation application.', gender:'women' },

  // ── Hair › Shampoo & Conditioners ────────────────────────────────────────────
  { title:'Stop Repair & Nourish Shampoo',          brand:'Stop',           cat:'Shampoo & Conditioners',         price:499,  disc:15, stock:120, img:'haircare',   desc:'Protein-enriched shampoo for dry, damaged hair. Restores strength and shine.', gender:null },
  { title:'Stop Volume Boost Shampoo',              brand:'Stop',           cat:'Shampoo & Conditioners',         price:449,  disc:15, stock:110, img:'haircare',   desc:'Lightweight volumising shampoo that adds body and lift to fine hair.', gender:null },
  { title:'Stop Anti-Dandruff Shampoo',             brand:'Stop',           cat:'Shampoo & Conditioners',         price:399,  disc:20, stock:130, img:'haircare',   desc:'Clinically proven anti-dandruff formula with zinc pyrithione.', gender:null },

  // ── Hair › Hair Treatments › Hair Masks ──────────────────────────────────────
  { title:'Stop Deep Repair Hair Mask',             brand:'Stop',           cat:'Hair Masks',                     price:599,  disc:20, stock:90,  img:'haircare',   desc:'Intensive keratin-infused mask that repairs breakage and tames frizz.', gender:null },
  { title:'Stop Colour Protect Hair Mask',          brand:'Stop',           cat:'Hair Masks',                     price:649,  disc:15, stock:80,  img:'haircare',   desc:'Colour-care mask with UV filters to preserve vibrancy in colour-treated hair.', gender:null },

  // ── Hair › Hair Treatments › Hair Oils ───────────────────────────────────────
  { title:'Stop Argan & Keratin Serum Oil',         brand:'Stop',           cat:'Hair Oils',                      price:499,  disc:20, stock:100, img:'serum',      desc:'Lightweight non-greasy oil blend that tames frizz and adds instant shine.', gender:null },
  { title:'Stop Coconut Hair Nourishing Oil',       brand:'Stop',           cat:'Hair Oils',                      price:399,  disc:15, stock:110, img:'haircare',   desc:'Virgin coconut-enriched hair oil for deep nourishment and scalp health.', gender:null },

  // ── Hair › Hair Treatments › Hair Serums ────────────────────────────────────
  { title:'Stop Smooth & Shine Hair Serum',         brand:'Stop',           cat:'Hair Serums',                    price:449,  disc:20, stock:95,  img:'serum',      desc:'Anti-humidity serum that locks out frizz and delivers mirror-like shine.', gender:null },

  // ── Hair › Tools & Accessories › Hair Dryers ────────────────────────────────
  { title:'Dyson Supersonic Hair Dryer',            brand:'Dyson',          cat:'Hair Dryers',                    price:32900,disc:10, stock:20,  img:'hairdryer',  desc:'Supersonic motor technology for fast drying with no extreme heat damage.', gender:null },
  { title:'Dyson Supersonic R Hair Dryer',          brand:'Dyson',          cat:'Hair Dryers',                    price:38000,disc:5,  stock:15,  img:'hairdryer',  desc:'Remastered Supersonic with intelligent heat control and 5 attachments.', gender:null },

  // ── Hair › Tools & Accessories › Straighteners & Flat Irons ─────────────────
  { title:'Dyson Corrale Straightener',             brand:'Dyson',          cat:'Straighteners & Flat Irons',     price:34900,disc:8,  stock:18,  img:'hairdryer',  desc:'Flexing plate technology for frizz-free straightening with less heat damage.', gender:null },

  // ── Hair › Tools & Accessories › Multi Stylers ───────────────────────────────
  { title:'Dyson Airwrap Multi-Styler',             brand:'Dyson',          cat:'Multi Stylers',                  price:44900,disc:5,  stock:12,  img:'hairdryer',  desc:'One tool, multiple styles. Curl, wave, smooth and volumise using air.', gender:null },

  // ── Hair › Tools & Accessories › Hair Accessories ────────────────────────────
  { title:'Stop Satin Scrunchie Set',               brand:'Stop',           cat:'Hair Accessories',               price:299,  disc:20, stock:150, img:'haircare',   desc:'Pack of 5 satin-finish scrunchies that are gentle on all hair types.', gender:'women' },
  { title:'Stop Hair Clip & Pins Set',              brand:'Stop',           cat:'Hair Accessories',               price:199,  disc:20, stock:160, img:'haircare',   desc:'Assorted pack of claw clips, bobby pins and kirby grips.', gender:'women' },

  // ── Personal Care › Bath & Shower › Body Washes & Shower Gels ───────────────
  { title:'Stop Moisturising Body Wash',            brand:'Stop',           cat:'Body Washes & Shower Gels',      price:399,  disc:20, stock:140, img:'bodywash',   desc:'Creamy, fragrant body wash with shea butter for soft, nourished skin.', gender:'women' },
  { title:'Stop Refreshing Citrus Shower Gel',      brand:'Stop',           cat:'Body Washes & Shower Gels',      price:349,  disc:20, stock:150, img:'bodywash',   desc:'Light, invigorating shower gel with energising citrus and mint blend.', gender:null },
  { title:'Clinique Happy Body Wash',               brand:'Clinique',       cat:'Body Washes & Shower Gels',      price:2800, disc:10, stock:55,  img:'bodywash',   desc:'Happiness-infused skin-softening body wash with Happy fragrance.', gender:'women' },

  // ── Personal Care › Bath & Shower › Soaps ────────────────────────────────────
  { title:'Stop Luxury Bathing Soap Set',           brand:'Stop',           cat:'Soaps',                          price:499,  disc:20, stock:120, img:'bodywash',   desc:'Set of 4 moisturising soaps with shea butter, aloe, rose and sandalwood.', gender:null },
  { title:'Stop Charcoal Detox Bar Soap',           brand:'Stop',           cat:'Soaps',                          price:299,  disc:20, stock:130, img:'bodywash',   desc:'Activated charcoal soap that deep cleanses and removes toxins from skin.', gender:null },

  // ── Personal Care › Body Care › Body Moisturizers ────────────────────────────
  { title:'Stop Shea & Cocoa Body Butter',          brand:'Stop',           cat:'Body Moisturizers',              price:599,  disc:20, stock:100, img:'bodycare',   desc:'Rich, indulgent body butter with shea and cocoa for intensely dry skin.', gender:'women' },
  { title:'Clinique Sparkle Skin Body Exfoliator',  brand:'Clinique',       cat:'Body Moisturizers',              price:2600, disc:10, stock:45,  img:'bodycare',   desc:'Creamy exfoliating body moisturiser that smooths and softens rough patches.', gender:'women' },

  // ── Personal Care › Body Care › Body Lotions & Body Oils ─────────────────────
  { title:'Stop Vitamin C Brightening Body Lotion', brand:'Stop',           cat:'Body Lotions & Body Oils',       price:449,  disc:20, stock:120, img:'bodycare',   desc:'Daily brightening lotion with vitamin C and niacinamide for even skin tone.', gender:'women' },
  { title:'Stop Almond & Honey Body Oil',           brand:'Stop',           cat:'Body Lotions & Body Oils',       price:549,  disc:20, stock:100, img:'bodycare',   desc:'Lightweight dry body oil that absorbs quickly, leaving skin silky smooth.', gender:'women' },

  // ── Personal Care › Hands & Feet › Hand Creams ───────────────────────────────
  { title:'Clinique Hand Cream',                    brand:'Clinique',       cat:'Hand Creams',                    price:1800, disc:10, stock:70,  img:'bodycare',   desc:'Rich, fast-absorbing hand cream that repairs dry, cracked hands overnight.', gender:'women' },
  { title:'Elizabeth Arden Visible Difference Hand', brand:'Elizabeth Arden', cat:'Hand Creams',                  price:2200, disc:10, stock:60,  img:'bodycare',   desc:'Retinol-infused hand cream that visibly reduces age spots and roughness.', gender:'women' },

  // ── Personal Care › Hands & Feet › Handwashes ────────────────────────────────
  { title:'Stop Rose & Jasmine Hand Wash',          brand:'Stop',           cat:'Handwashes',                     price:299,  disc:20, stock:160, img:'bodywash',   desc:'Moisturising hand wash with rose and jasmine extracts. pH balanced.', gender:null },
  { title:'Stop Antibacterial Hand Wash',           brand:'Stop',           cat:'Handwashes',                     price:249,  disc:20, stock:170, img:'bodywash',   desc:'Kills 99.9% of germs with neem and tea tree extract. Dermatologist tested.', gender:null },

  // ── Personal Care › Hands & Feet › Foot Creams ───────────────────────────────
  { title:'Stop Cracked Heel Repair Cream',         brand:'Stop',           cat:'Foot Creams',                    price:399,  disc:20, stock:110, img:'bodycare',   desc:'Intensive urea-based cream for severely cracked heels. Visible results in 3 days.', gender:'women' },

  // ── Makeup › Eyes › Eye Brow Enhancers ─────────────────────────────────────
  { title:'M.A.C Eye Brow Styler Pencil',            brand:'M.A.C',          cat:'Eye Brow Enhancers',             price:2200, disc:10, stock:70,  img:'kajal',      desc:'Creamy brow pencil with micro-precision tip for hair-like strokes.', gender:'women' },
  { title:'Bobbi Brown Perfectly Defined Brow Pencil',brand:'Bobbi Brown',    cat:'Eye Brow Enhancers',             price:2800, disc:10, stock:55,  img:'kajal',      desc:'Ultra-thin pencil for natural-looking defined brows. Long-wearing.', gender:'women' },
  { title:'Stop Brow Duo Pencil & Gel',               brand:'Stop',           cat:'Eye Brow Enhancers',             price:499,  disc:20, stock:110, img:'kajal',      desc:'Double-ended brow pencil and clear gel for sculpted, shaped brows.', gender:'women' },

  // ── Makeup › Eyes › False Eyelashes ────────────────────────────────────────
  { title:'Stop Natural False Lashes Kit',             brand:'Stop',           cat:'False Eyelashes',                price:299,  disc:20, stock:130, img:'kajal',      desc:'Lightweight, natural-look false lashes with adhesive. Reusable up to 10 times.', gender:'women' },
  { title:'Stop Drama Volume False Lashes',            brand:'Stop',           cat:'False Eyelashes',                price:349,  disc:15, stock:110, img:'kajal',      desc:'Full-volume statement lashes with flexible band for comfortable wear.', gender:'women' },

  // ── Makeup › Eyes › Eye Makeup Removers ────────────────────────────────────
  { title:'Clinique Take The Day Off Eye Remover',     brand:'Clinique',       cat:'Eye Makeup Removers',            price:1800, disc:10, stock:80,  img:'cleanser',   desc:'Lightweight eye makeup remover that dissolves waterproof mascara and liner.', gender:'women' },
  { title:'Shiseido Instant Eye & Lip Makeup Remover', brand:'Shiseido',       cat:'Eye Makeup Removers',            price:2400, disc:10, stock:60,  img:'cleanser',   desc:'Bi-phase formula that gently removes even the most stubborn eye makeup.', gender:'women' },

  // ── Makeup › Beauty & Hair Accessories › Brushes ───────────────────────────
  { title:'M.A.C Basic Brush Set',                    brand:'M.A.C',          cat:'Brushes',                        price:4500, disc:10, stock:40,  img:'skincare',   desc:'Essential 6-piece brush set covering face, eye and lip application.', gender:'women' },
  { title:'Bobbi Brown Deluxe Brush Set',             brand:'Bobbi Brown',    cat:'Brushes',                        price:6500, disc:10, stock:30,  img:'skincare',   desc:'Professional-grade 8-piece brush collection with travel pouch.', gender:'women' },
  { title:'Stop Beginners Makeup Brush Kit',          brand:'Stop',           cat:'Brushes',                        price:699,  disc:20, stock:90,  img:'skincare',   desc:'12-piece starter brush set with synthetic fibres for all skin types.', gender:'women' },

  // ── Makeup › Beauty & Hair Accessories › Manicure And Pedicure ─────────────
  { title:'Stop Complete Manicure & Pedicure Kit',     brand:'Stop',           cat:'Manicure And Pedicure',          price:799,  disc:20, stock:85,  img:'nailpolish', desc:'15-piece manicure & pedicure set with nail file, cuticle tools, toe separator.', gender:'women' },
  { title:'Stop Foot Care Scrub & Cream Duo',          brand:'Stop',           cat:'Manicure And Pedicure',          price:499,  disc:20, stock:100, img:'bodycare',   desc:'Pumice scrub and intensive heel cream duo for baby-soft feet.', gender:'women' },

  // ── Hair › Mens Grooming › Shaving › Shaving Gels ──────────────────────────
  { title:'Stop Cooling Shave Gel',                    brand:'Stop',           cat:'Shaving Gels',                   price:299,  disc:20, stock:140, img:'shaving',    desc:'Menthol-infused transparent shave gel for close, comfortable shaving.', gender:'men' },
  { title:'Stop Sensitive Shave Gel',                  brand:'Stop',           cat:'Shaving Gels',                   price:349,  disc:20, stock:120, img:'shaving',    desc:'Aloe & chamomile gel formula designed for sensitive and reactive skin.', gender:'men' },

  // ── Hair › Mens Grooming › Shaving › Pre & Post Shaves ─────────────────────
  { title:'Stop Pre-Shave Oil',                        brand:'Stop',           cat:'Pre & Post Shaves',              price:399,  disc:20, stock:100, img:'shaving',    desc:'Lightweight pre-shave oil that softens stubble and primes skin for a smooth glide.', gender:'men' },
  { title:'Stop Aftershave Balm Soothing',             brand:'Stop',           cat:'Pre & Post Shaves',              price:349,  disc:20, stock:110, img:'shaving',    desc:'Post-shave balm with aloe vera that soothes irritation and razor burn.', gender:'men' },

  // ── Hair › Mens Grooming › Shaving › Aftershave Lotions ────────────────────
  { title:'Giorgio Armani Acqua di Giò Aftershave',   brand:'Giorgio Armani', cat:'Aftershave Lotions',             price:4800, disc:10, stock:30,  img:'perfume',    desc:'Refreshing aquatic aftershave lotion with bergamot and neroli notes.', gender:'men' },
  { title:'Stop Classic Aftershave Lotion',            brand:'Stop',           cat:'Aftershave Lotions',             price:299,  disc:20, stock:130, img:'shaving',    desc:'Alcohol-based aftershave with menthol for an invigorating post-shave finish.', gender:'men' },

  // ── Hair › Mens Grooming › Beard Care ──────────────────────────────────────
  { title:'Stop Argan Beard Oil',                      brand:'Stop',           cat:'Beard Oils',                     price:499,  disc:20, stock:100, img:'serum',      desc:'Lightweight argan and jojoba beard oil that softens and conditions beard hair.', gender:'men' },
  { title:'Stop Beard & Moustache Balm',               brand:'Stop',           cat:'Beard Balms',                    price:449,  disc:20, stock:90,  img:'bodycare',   desc:'Shea butter beard balm for styling, taming and moisturising beard hair.', gender:'men' },
  { title:'Stop Deep Cleanse Beard Wash',              brand:'Stop',           cat:'Beard Wash',                     price:349,  disc:20, stock:110, img:'bodywash',   desc:'SLS-free beard wash with activated charcoal for deep-cleansing beard and skin.', gender:'men' },

  // ── Hair › Mens Grooming › Skin Care ───────────────────────────────────────
  { title:'Stop Men\'s Anti-Ageing Face Cream',       brand:'Stop',           cat:'mens-skin-care',                 price:599,  disc:20, stock:90,  img:'skincare',   desc:'SPF 15 daily moisturiser that targets fine lines and dark spots for men.', gender:'men' },
  { title:'Stop Men\'s Oil Control Face Wash',        brand:'Stop',           cat:'mens-skin-care',                 price:349,  disc:20, stock:120, img:'cleanser',   desc:'Salicylic acid face wash for men that controls sebum and prevents breakouts.', gender:'men' },

  // ── Hair › Mens Grooming › Hair Care ───────────────────────────────────────
  { title:'Stop Men\'s Anti-Dandruff Shampoo',        brand:'Stop',           cat:'mens-hair-care',                 price:399,  disc:20, stock:120, img:'haircare',   desc:'Zinc pyrithione shampoo formulated for men\'s scalp. Controls dandruff effectively.', gender:'men' },
  { title:'Stop Men\'s Hair Cream',                   brand:'Stop',           cat:'mens-hair-care',                 price:299,  disc:20, stock:100, img:'haircare',   desc:'Lightweight hair cream for men that provides hold, shine and frizz control.', gender:'men' },

  // ── Hair › Mens Grooming › Fragrances ──────────────────────────────────────
  { title:'Giorgio Armani Acqua di Giò EDP',          brand:'Giorgio Armani', cat:'Fragrances',                     price:9500, disc:10, stock:30,  img:'perfume',    desc:'Fresh aquatic fragrance with top notes of bergamot, neroli and green tangerine.', gender:'men' },
  { title:'Versace Eros EDT',                         brand:'Versace',        cat:'Fragrances',                     price:6500, disc:12, stock:35,  img:'perfume',    desc:'Powerful masculine fragrance with mint, green apple and vanilla heart.', gender:'men' },
  { title:'Burberry Hero EDT',                        brand:'Burberry',       cat:'Fragrances',                     price:6800, disc:10, stock:22,  img:'perfume',    desc:'Bold men\'s fragrance with fresh cedar and black pepper for the modern man.', gender:'men' },
  { title:'Yves Saint Laurent Y EDP',                 brand:'Yves Saint Laurent', cat:'Fragrances',                price:8500, disc:10, stock:22,  img:'perfume',    desc:'Modern men\'s fragrance with apple, sage and amber wood.', gender:'men' },

  // ── Fragrances ───────────────────────────────────────────────────────────────
  { title:'Giorgio Armani Si Passione EDP',         brand:'Giorgio Armani', cat:'Fragrances',                     price:8800, disc:10, stock:25,  img:'perfume',    desc:'Floral oriental for women with blackcurrant, rose and vanilla base.', gender:'women' },
  { title:'Versace Bright Crystal EDT',             brand:'Versace',        cat:'Fragrances',                     price:6200, disc:12, stock:30,  img:'perfume',    desc:'Vibrant, fresh women\'s fragrance with pomegranate, peony and magnolia.', gender:'women' },
  { title:'Burberry Her EDP',                       brand:'Burberry',       cat:'Fragrances',                     price:7200, disc:10, stock:25,  img:'perfume',    desc:'A sparkling gourmand fragrance for modern women with berry and jasmine notes.', gender:'women' },
  { title:'Yves Saint Laurent Libre EDP',           brand:'Yves Saint Laurent', cat:'Fragrances',                price:9200, disc:10, stock:20,  img:'perfume',    desc:'A floral fougère for women celebrating freedom. Lavender and musk essence.', gender:'women' },
];

const SIZES_NONE = ['One Size'];
const SHADES_MAKEUP = ['Ivory', 'Beige', 'Honey', 'Caramel'];
const SHADES_LIP = ['Red', 'Nude', 'Pink', 'Berry'];
const SHADES_NAIL = ['Red', 'Nude', 'Pink', 'Coral'];

function getVariants(p) {
  if (['Foundations', 'Compacts', 'BB & CC Creams', 'Tinted Moisturizers'].includes(p.cat)) {
    return SHADES_MAKEUP.map(s => ({ size: s, color: null }));
  }
  if (['Lipsticks', 'Lip Glosses'].includes(p.cat)) {
    return SHADES_LIP.map(s => ({ size: s, color: null }));
  }
  if (['Nail Polishes'].includes(p.cat)) {
    return SHADES_NAIL.map(s => ({ size: s, color: null }));
  }
  return SIZES_NONE.map(s => ({ size: s, color: null }));
}

try {
  await client.query('BEGIN');
  let count = 0;

  for (const p of PRODUCTS) {
    const catId   = cat(p.cat);
    const brandId = brand(p.brand);
    const sl      = slugify(p.title, `b${count}`);

    const { rows: [product] } = await client.query(
      `INSERT INTO products (title, slug, brand_id, category_id, description, gender, base_price, discount_pct, stock, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active')
       ON CONFLICT (slug) DO UPDATE SET category_id=$4, gender=$6, base_price=$7, discount_pct=$8
       RETURNING id`,
      [p.title, sl, brandId, catId, p.desc, p.gender || null, p.price, p.disc, p.stock]
    );

    const primaryImg = IMG[p.img] || IMG.skincare;
    const altKeys = Object.keys(IMG).filter(k => k !== p.img);
    const altImg = IMG[altKeys[count % altKeys.length]];
    for (const [j, url] of [primaryImg, altImg].entries()) {
      await client.query(
        `INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [product.id, url, j === 0, j]
      );
    }

    const variants = getVariants(p);
    const stockPerVariant = Math.ceil(p.stock / variants.length);
    for (const v of variants) {
      await client.query(
        `INSERT INTO product_variants (product_id, size, color, sku, stock, extra_price) VALUES ($1,$2,$3,$4,$5,0) ON CONFLICT (sku) DO NOTHING`,
        [product.id, v.size, v.color, `${sl}-${v.size}`.slice(0, 50), stockPerVariant]
      );
    }

    count++;
    process.stdout.write(`✓ [${count}] ${p.title}\n`);
  }

  await client.query('COMMIT');
  console.log(`\n✅ ${count} beauty products seeded across all subcategories.`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌ Failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
