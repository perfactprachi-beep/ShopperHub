import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Google favicon service — verified working for each domain
const GF = (domain) =>
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`;

const BRANDS = [
  // ── Existing brands ───────────────────────────────────────────────────────
  { name: 'Allen Solly',        logo: GF('allensolly.com'),         desc: 'Premium smart-casual fashion for men and women.' },
  { name: 'AND',                logo: GF('andindia.com'),            desc: 'Contemporary women\'s fashion brand.' },
  { name: 'Stop',               logo: null,                          desc: 'ShoppersHub private label.' },

  // ── Popular Brands ────────────────────────────────────────────────────────
  { name: 'Casio',              logo: GF('casio.com'),               desc: 'Japanese electronics brand known for watches and calculators.' },
  { name: 'Titan',              logo: GF('titan.co.in'),             desc: 'India\'s leading watch and accessories brand.' },
  { name: 'Fossil',             logo: GF('fossil.com'),              desc: 'American fashion designer and manufacturer of watches and accessories.' },
  { name: 'Michael Kors',       logo: GF('michaelkors.com'),         desc: 'American luxury fashion brand.' },
  { name: 'Jockey',             logo: GF('jockey.com'),              desc: 'Global innerwear and activewear brand.' },
  { name: 'Jack & Jones',       logo: GF('jackjones.com'),           desc: 'Danish menswear brand with a modern casual style.' },
  { name: 'Fratini',            logo: null,                          desc: 'ShoppersHub\'s premium women\'s fashion label.' },
  { name: 'Life',               logo: null,                          desc: 'ShoppersHub\'s casual lifestyle brand.' },
  { name: 'Skechers',           logo: GF('skechers.com'),            desc: 'American footwear brand known for comfort and style.' },
  { name: 'Adidas',             logo: GF('adidas.com'),              desc: 'German multinational sportswear brand.' },
  { name: 'Puma',               logo: GF('puma.com'),                desc: 'German multinational corporation for athletic and casual footwear.' },
  { name: 'Reebok',             logo: GF('reebok.com'),              desc: 'Global athletic footwear and apparel brand.' },
  { name: 'Yves Saint Laurent', logo: GF('ysl.com'),                 desc: 'French luxury fashion house founded in 1961.' },
  { name: 'Dyson',              logo: GF('dyson.com'),               desc: 'British technology company known for innovative home appliances.' },
  { name: 'M.A.C',              logo: GF('maccosmetics.com'),        desc: 'Professional makeup brand loved by makeup artists worldwide.' },
  { name: 'Nike',               logo: GF('nike.com'),                desc: 'World\'s leading athletic footwear and apparel brand.' },
  { name: "Levi's",             logo: GF('levi.com'),                desc: 'Iconic American denim brand since 1853.' },
  { name: 'Tommy Hilfiger',     logo: GF('tommy.com'),               desc: 'American premium lifestyle brand.' },
  { name: 'Calvin Klein',       logo: GF('calvinklein.com'),         desc: 'American fashion brand known for minimalist aesthetic.' },
  { name: 'Louis Philippe',     logo: GF('louisphilippe.com'),       desc: 'Premium menswear brand offering formal and casual wear.' },
  { name: 'Van Heusen',         logo: GF('vanheusen.com'),           desc: 'American clothing brand known for dress shirts and formal wear.' },
  { name: 'Peter England',      logo: GF('peterengland.com'),        desc: 'Smart casual fashion brand for young men.' },
  { name: 'U.S. Polo Assn.',    logo: GF('uspoloassn.com'),          desc: 'Official brand of the United States Polo Association.' },
  { name: 'Wrangler',           logo: GF('wrangler.com'),            desc: 'American denim brand with a rugged heritage.' },
  { name: 'Raymond',            logo: null,                          desc: 'India\'s leading textile and apparel brand.' },

  // ── Luxe: Watches ─────────────────────────────────────────────────────────
  { name: 'Tissot',             logo: GF('tissotwatches.com'),       desc: 'Swiss watchmaker offering precision timepieces since 1853.' },
  { name: 'Coach',              logo: GF('coach.com'),               desc: 'American luxury fashion brand known for leather goods and accessories.' },
  { name: 'Emporio Armani',     logo: GF('emporioarmani.com'),       desc: 'Contemporary luxury line from the iconic Giorgio Armani house.' },
  { name: 'GUESS',              logo: GF('guess.com'),               desc: 'American lifestyle brand with a bold, glamorous aesthetic.' },

  // ── Luxe: Sunglasses ──────────────────────────────────────────────────────
  { name: 'Tom Ford',           logo: GF('tomford.com'),             desc: 'American luxury fashion and cosmetics brand.' },
  { name: 'Rayban',             logo: GF('ray-ban.com'),             desc: 'Iconic eyewear brand renowned for its sunglasses and frames.' },
  { name: 'Carrera',            logo: GF('carrera.com'),             desc: 'Premium eyewear brand with a motorsport-inspired heritage.' },

  // ── Luxe: Handbags ────────────────────────────────────────────────────────
  { name: 'ALDO',               logo: GF('aldoshoes.com'),           desc: 'Global fashion footwear and accessories brand.' },
  { name: 'Steve Madden',       logo: GF('stevemadden.com'),         desc: 'American designer and retailer of fashion footwear and accessories.' },
  { name: 'Hidesign',           logo: GF('hidesign.com'),            desc: 'Indian luxury leather goods brand known for handcrafted bags.' },

  // ── Luxe: Jewellery ───────────────────────────────────────────────────────
  { name: 'Swarovski',          logo: GF('swarovski.com'),           desc: 'Austrian producer of luxury cut glass, jewellery and accessories.' },

  // ── Luxe: Fragrances ─────────────────────────────────────────────────────
  { name: 'Giorgio Armani',     logo: GF('giorgioarmani.com'),       desc: 'Italian luxury fashion house known for elegant fragrances and apparel.' },
  { name: 'Versace',            logo: GF('versace.com'),             desc: 'Italian luxury fashion company founded by Gianni Versace.' },
  { name: 'Burberry',           logo: GF('burberry.com'),            desc: 'British luxury fashion house known for its iconic trench coats and fragrances.' },

  // ── Luxe: Skin Care ───────────────────────────────────────────────────────
  { name: 'Shiseido',           logo: GF('shiseido.com'),            desc: 'Japanese multinational personal care company founded in 1872.' },
  { name: 'Clarins',            logo: GF('clarins.com'),             desc: 'French luxury skincare brand combining plant-based ingredients and science.' },
  { name: 'Elizabeth Arden',    logo: GF('elizabetharden.com'),      desc: 'American prestige beauty brand with a heritage since 1910.' },

  // ── Luxe: Makeup ─────────────────────────────────────────────────────────
  { name: 'Estee Lauder',       logo: GF('esteelauder.com'),         desc: 'American multinational prestige cosmetics company.' },
  { name: 'Bobbi Brown',        logo: GF('bobbibrowncosmetics.com'), desc: 'Professional makeup brand focusing on natural beauty.' },
  { name: 'Smashbox',           logo: GF('smashbox.com'),            desc: 'Prestige cosmetics brand born in a Hollywood photo studio.' },
  { name: 'NARS',               logo: GF('narscosmetics.com'),       desc: 'Luxury cosmetics brand known for bold pigments and innovation.' },
  { name: 'Clinique',           logo: GF('clinique.com'),            desc: 'Allergy-tested, fragrance-free luxury skincare and makeup.' },

  // ── Luxe: Premium Fashion ─────────────────────────────────────────────────
  { name: 'Valentino',          logo: GF('valentino.com'),           desc: 'Italian luxury fashion house known for haute couture and elegance.' },
  { name: 'Mugler',             logo: GF('mugler.com'),              desc: 'French luxury fashion house founded by Thierry Mugler.' },
  { name: 'Maison Margiela',    logo: GF('maisonmargiela.com'),      desc: 'French luxury fashion house known for its deconstructionist aesthetic.' },
  { name: 'Roberto Cavalli',    logo: GF('robertocavalli.com'),      desc: 'Italian luxury fashion brand known for bold prints and glamour.' },
  { name: 'Gucci',              logo: GF('gucci.com'),               desc: 'Italian luxury fashion house founded in Florence in 1921.' },
  { name: 'Tory Burch',         logo: GF('toryburch.com'),           desc: 'American fashion label inspired by eclectic bohemian style.' },
];

const client = await pool.connect();
try {
  await client.query('BEGIN');

  let inserted = 0;
  let updated  = 0;

  for (const b of BRANDS) {
    const s = slug(b.name);
    const { rows } = await client.query(
      `INSERT INTO brands (name, slug, logo_url, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE
         SET logo_url = EXCLUDED.logo_url,
             description = EXCLUDED.description
       RETURNING (xmax = 0) AS is_insert`,
      [b.name, s, b.logo, b.desc]
    );
    if (rows[0].is_insert) { inserted++; console.log(`  + ${b.name}`); }
    else                   { updated++;  console.log(`  ~ ${b.name} (updated)`); }
  }

  await client.query('COMMIT');
  console.log(`\n✓ Done — ${inserted} added, ${updated} updated.`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
