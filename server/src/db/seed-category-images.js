import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Unsplash curated photo IDs per category keyword
// Format: [photoId, description]
const IMAGE_MAP = {
  // ── Top-level ──────────────────────────────────────────────────────────────
  'men':     'photo-1617137968427-85924c800a22',
  'women':   'photo-1487412720507-e7ab37603c6f',
  'kids':    'photo-1622290291468-a28f7a7dc6a8',
  'beauty':  'photo-1596462502278-27bfdc403348',

  // ── Men subcategories ──────────────────────────────────────────────────────
  'casual wear':                  'photo-1593030761757-71fae45fa0e7',
  't-shirts':                     'photo-1521572163474-6864f9cf17ab',
  'polos':                        'photo-1586363104862-3a5e2ab60d99',
  'shirts':                       'photo-1596755094514-f87e34085b2c',
  'sweatshirts & pullovers':      'photo-1578587018452-892bacefd3f2',
  'jackets':                      'photo-1591047139829-d91aecb6caea',
  'jeans':                        'photo-1542272604-787c3835535d',
  'casual trousers & chinos':     'photo-1473966968600-fa801b869a1a',
  'shorts':                       'photo-1565084888279-aca607ecce0c',
  'cargos track pants & joggers': 'photo-1552902865-b72c031ac5ea',
  'co-ords':                      'photo-1515886657613-9f3515b0c78f',
  'formal wear':                  'photo-1507003211169-0a1dd7228f2d',
  'trousers':                     'photo-1473966968600-fa801b869a1a',
  'suit sets':                    'photo-1594938298603-c8148c4b4345',
  'blazers & coats':              'photo-1617127365659-c47fa864d8bc',
  'athleisure':                   'photo-1571019614242-c5c5dee9f50b',
  'active t-shirts':              'photo-1576566588028-4147f3842f27',
  'jackets & sweatshirts':        'photo-1544966503-7cc5ac882d5e',
  'track pants & joggers':        'photo-1552902865-b72c031ac5ea',
  'cargos':                       'photo-1624378439575-d8705ad7ae80',
  'tracksuits & sets':            'photo-1617127365659-c47fa864d8bc',
  'innerwear & sleepwear':        'photo-1620799140408-edc6dcb6d633',
  'vests':                        'photo-1503342394128-c104d54dba01',
  'loungewear t-shirts':          'photo-1556821840-3a63f15732ce',
  'shorts pyjamas & loose pants': 'photo-1620799140408-edc6dcb6d633',
  'briefs & trunks':              'photo-1620799140408-edc6dcb6d633',
  'indian & festive wear':        'photo-1610030469983-98e550d6193c',
  'kurtas':                       'photo-1610030469983-98e550d6193c',
  'kurta sets':                   'photo-1583391733956-3750e0ff4e8b',
  'nehru jackets':                'photo-1610030469983-98e550d6193c',
  'dhotis & pyjamas':             'photo-1609012000516-c03df1c6c427',
  'winterwear':                   'photo-1574634534894-89d7576c8259',
  'sweaters & cardigans':         'photo-1576871337632-b9aef4c17ab9',
  'jackets & coats':              'photo-1591047139829-d91aecb6caea',
  'thermals':                     'photo-1574634534894-89d7576c8259',
  'footwear':                     'photo-1542291026-7eec264c27ff',
  'casual shoes & loafers':       'photo-1614252234498-d59e46697daa',
  'sports shoes':                 'photo-1542291026-7eec264c27ff',
  'formal shoes':                 'photo-1614252234498-d59e46697daa',
  'sandals & floaters':           'photo-1603487742131-4160ec999306',
  'flip flops & sliders':         'photo-1603487742131-4160ec999306',
  'boots':                        'photo-1542314831-068cd1dbfeeb',
  'socks':                        'photo-1586350977771-b3b0abd50c82',
  'watches':                      'photo-1523275335684-37898b6baf30',
  'smart watches & fitness bands':'photo-1551816230-ef5deaed4a26',
  'analog watches':               'photo-1523275335684-37898b6baf30',
  'chronograph watches':          'photo-1619946794135-5bc917a27793',
  'digital watches':              'photo-1548036328-c9fa89d128fa',
  'accessories':                  'photo-1606760227091-3dd870d97f1d',
  'belts':                        'photo-1624222247344-550fb60583dc',
  'caps & hats':                  'photo-1521369909029-2afed882baee',
  'handkerchiefs':                'photo-1606760227091-3dd870d97f1d',
  'wallets':                      'photo-1627123424574-724758594785',
  'sunglasses':                   'photo-1511499767150-a48a237f0083',
  'ties & pocket squares':        'photo-1507679799987-c73779587ccf',

  // ── Women subcategories ────────────────────────────────────────────────────
  'western wear':                 'photo-1515886657613-9f3515b0c78f',
  'tops & t-shirts':              'photo-1469334031218-e382a71b716b',
  'shirts & blouses':             'photo-1551803091-e20673f15770',
  'sweatshirts & hoodies':        'photo-1578587018452-892bacefd3f2',
  'jeans & trousers':             'photo-1541099649105-f69ad21f3246',
  'trousers & palazzos':          'photo-1591369822096-ffd140ec948f',
  'shorts & skirts':              'photo-1583496661160-fb5218ees9eb',
  'co-ord sets':                  'photo-1515886657613-9f3515b0c78f',
  'ethnic wear':                  'photo-1583391733956-3750e0ff4e8b',
  'kurtas & kurtis':              'photo-1610030469983-98e550d6193c',
  'sarees':                       'photo-1583391733956-3750e0ff4e8b',
  'lehengas':                     'photo-1609012000516-c03df1c6c427',
  'salwar suits':                 'photo-1610030469983-98e550d6193c',
  'dupattas & stoles':            'photo-1583391733956-3750e0ff4e8b',
  'ethnic jackets':               'photo-1610030469983-98e550d6193c',
  'dresses & jumpsuits':          'photo-1496747611176-843222e1e57c',
  'casual dresses':               'photo-1496747611176-843222e1e57c',
  'party dresses':                'photo-1515886657613-9f3515b0c78f',
  'maxi dresses':                 'photo-1496747611176-843222e1e57c',
  'jumpsuits & playsuits':        'photo-1515886657613-9f3515b0c78f',
  'activewear':                   'photo-1518459031867-a89b944bffe4',
  'sports tops':                  'photo-1518459031867-a89b944bffe4',
  'sports bras':                  'photo-1518459031867-a89b944bffe4',
  'yoga pants & leggings':        'photo-1506629082955-511b1aa562c8',
  'bras':                         'photo-1620799140408-edc6dcb6d633',
  'panties':                      'photo-1620799140408-edc6dcb6d633',
  'nightwear & loungewear':       'photo-1620799140408-edc6dcb6d633',
  'shapewear':                    'photo-1620799140408-edc6dcb6d633',
  'shawls & wraps':               'photo-1584670747417-594a9412faba',
  'heels':                        'photo-1543163521-1bf539c55dd2',
  'flats & ballerinas':           'photo-1603487742131-4160ec999306',
  'sneakers':                     'photo-1542291026-7eec264c27ff',
  'sandals':                      'photo-1603487742131-4160ec999306',
  'ethnic footwear':              'photo-1603487742131-4160ec999306',
  'handbags & accessories':       'photo-1548036328-c9fa89d128fa',
  'handbags':                     'photo-1548036328-c9fa89d128fa',
  'clutches':                     'photo-1548036328-c9fa89d128fa',
  'backpacks':                    'photo-1553062407-98eeb64c6a62',
  'scarves & stoles':             'photo-1584670747417-594a9412faba',
  'jewellery':                    'photo-1515562141207-7a88fb7ce338',

  // ── Kids subcategories ─────────────────────────────────────────────────────
  'boys clothing':                'photo-1503454537195-1dcabb73ffb9',
  't-shirts & polos':             'photo-1519238263530-99bdd11df2ea',
  'ethnic wear':                  'photo-1610030469983-98e550d6193c',
  'sportswear':                   'photo-1571019614242-c5c5dee9f50b',
  'innerwear & socks':            'photo-1586350977771-b3b0abd50c82',
  'girls clothing':               'photo-1518831959646-742c3a14ebf7',
  'tops & t-shirts':              'photo-1519238263530-99bdd11df2ea',
  'dresses & frocks':             'photo-1518831959646-742c3a14ebf7',
  'skirts':                       'photo-1518831959646-742c3a14ebf7',
  'kids footwear':                'photo-1542291026-7eec264c27ff',
  'casual shoes':                 'photo-1542291026-7eec264c27ff',
  'school shoes':                 'photo-1542291026-7eec264c27ff',
  'infants & toddlers':           'photo-1622290291468-a28f7a7dc6a8',
  'bodysuits & rompers':          'photo-1622290291468-a28f7a7dc6a8',
  'sleepwear':                    'photo-1620799140408-edc6dcb6d633',
  'sets & combos':                'photo-1622290291468-a28f7a7dc6a8',
  'innerwear':                    'photo-1620799140408-edc6dcb6d633',
  'kids accessories':             'photo-1606760227091-3dd870d97f1d',
  'bags & backpacks':             'photo-1553062407-98eeb64c6a62',

  // ── Beauty ─────────────────────────────────────────────────────────────────
  'skincare':   'photo-1556228578-8c89e6adf883',
  'skin care':  'photo-1556228578-8c89e6adf883',
  'haircare':   'photo-1522337360788-8b13dee7a37e',
  'makeup':     'photo-1596462502278-27bfdc403348',
  'fragrances': 'photo-1541643600914-78b084683702',
  'bath & body':'photo-1571781926291-c477ebfd024b',
  'nail care':  'photo-1604654894610-df63bc536371',
};

const BASE = 'https://images.unsplash.com';
const PARAMS = '?auto=format&w=400&q=80';
const FALLBACK = `${BASE}/photo-1558769132-cb1aea458c5e${PARAMS}`;

function getImageUrl(name) {
  const key = name.toLowerCase().trim();
  const photoId = IMAGE_MAP[key];
  return photoId ? `${BASE}/${photoId}${PARAMS}` : null;
}

async function run() {
  const { rows: categories } = await pool.query('SELECT id, name FROM categories');
  let updated = 0;
  let skipped = 0;

  for (const cat of categories) {
    const url = getImageUrl(cat.name);
    if (url) {
      await pool.query('UPDATE categories SET image_url=$1 WHERE id=$2', [url, cat.id]);
      updated++;
    } else {
      // Use fallback for unmapped categories
      await pool.query('UPDATE categories SET image_url=$1 WHERE id=$2', [FALLBACK, cat.id]);
      skipped++;
      console.log(`  ⚠ fallback used for: ${cat.name}`);
    }
  }

  console.log(`\n✓ Updated ${updated} categories with specific images`);
  console.log(`  ${skipped} used fallback image`);
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
