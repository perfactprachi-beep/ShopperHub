import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DEFAULT_PAGES = [
  {
    title: 'About Us',
    slug: 'about-us',
    excerpt: "India's leading omnichannel fashion retailer, committed to making fashion accessible to all.",
    content: `<h2>Our Story</h2><p>Founded in 1991, ShoppersHub has grown from a single store to India's leading omnichannel fashion destination. We bring together the finest national and international brands under one roof, offering an unparalleled shopping experience both in-store and online.</p><h2>Our Mission</h2><p>To be India's most inspiring fashion retailer by offering an edited assortment of brands that help our customers look and feel their best.</p><h2>Our Values</h2><ul><li><strong>Customer First:</strong> Every decision we make puts our customers at the heart of it.</li><li><strong>Excellence:</strong> We strive for excellence in everything we do.</li><li><strong>Innovation:</strong> We constantly evolve to meet changing customer needs.</li><li><strong>Integrity:</strong> We act with honesty and transparency.</li></ul><h2>Our Reach</h2><p>With over 85 stores across 45 cities and a growing online presence, ShoppersHub serves millions of fashion-forward Indians every year.</p>`,
    meta_title: 'About Us | ShoppersHub',
    meta_description: "Learn about ShoppersHub — India's leading omnichannel fashion retailer since 1991.",
  },
  {
    title: 'Careers',
    slug: 'careers',
    excerpt: "Join a team that's redefining fashion retail in India.",
    content: `<h2>Build Your Career With Us</h2><p>At ShoppersHub, we believe our people are our greatest asset. We are always looking for passionate, creative, and driven individuals who want to make a difference in the world of fashion retail.</p><h2>Why Work With Us</h2><ul><li><strong>Growth:</strong> Clear career paths and learning opportunities at every level.</li><li><strong>Culture:</strong> An inclusive, diverse, and collaborative work environment.</li><li><strong>Benefits:</strong> Competitive salaries, employee discounts, health benefits, and more.</li><li><strong>Innovation:</strong> Work on challenging problems that impact millions of customers.</li></ul><h2>Current Openings</h2><p>We have exciting opportunities across Technology, Marketing, Merchandising, Store Operations, Finance, and more. Visit our careers portal to browse current openings and apply.</p><h2>Get In Touch</h2><p>Can't find the right role? Send your resume to <strong>careers@shoppershub.in</strong> and we'll keep it on file for future openings.</p>`,
    meta_title: 'Careers | ShoppersHub',
    meta_description: "Explore career opportunities at ShoppersHub — India's leading fashion retailer.",
  },
  {
    title: 'Press & Media',
    slug: 'press',
    excerpt: 'Media inquiries, press releases, and brand assets for journalists and media partners.',
    content: `<h2>Media Enquiries</h2><p>For all media-related queries, press releases, and interview requests, please reach out to our Communications team at <strong>press@shoppershub.in</strong>. We typically respond within 24–48 hours.</p><h2>Recent Press Releases</h2><ul><li>ShoppersHub launches new Luxe Collection in partnership with global luxury brands</li><li>ShoppersHub crosses 10 million registered customers milestone</li><li>ShoppersHub expands to 5 new cities with flagship store launches</li></ul><h2>Brand Assets</h2><p>High-resolution logos, brand guidelines, and other press materials are available for verified media partners. Please contact us to request access.</p><h2>Awards &amp; Recognition</h2><ul><li>Best Omnichannel Retailer 2024 — Retail Asia</li><li>Top 50 Most Trusted Brands in India 2023 — Economic Times</li><li>Best Customer Experience in Fashion Retail 2023</li></ul>`,
    meta_title: 'Press & Media | ShoppersHub',
    meta_description: 'Media enquiries, press releases and brand assets from ShoppersHub.',
  },
  {
    title: 'Investor Relations',
    slug: 'investor-relations',
    excerpt: 'Financial information, reports, and updates for our investor community.',
    content: `<h2>Investor Overview</h2><p>ShoppersHub is listed on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE). We are committed to creating long-term value for our shareholders through disciplined growth, operational excellence, and responsible business practices.</p><h2>Financial Highlights</h2><ul><li>Revenue growth of 24% YoY in FY24</li><li>EBITDA margins expanding consistently</li><li>Strong free cash flow generation</li><li>Debt-free balance sheet</li></ul><h2>Corporate Governance</h2><p>We adhere to the highest standards of corporate governance. Our Board comprises independent directors with diverse expertise across retail, finance, and technology.</p><h2>Contact IR Team</h2><p>For investor queries, please contact our Investor Relations team at <strong>investor.relations@shoppershub.in</strong></p>`,
    meta_title: 'Investor Relations | ShoppersHub',
    meta_description: 'Financial information and investor updates from ShoppersHub.',
  },
  {
    title: 'Corporate Social Responsibility',
    slug: 'csr',
    excerpt: 'Our commitment to creating a positive impact on society and the environment.',
    content: `<h2>Our CSR Philosophy</h2><p>At ShoppersHub, we believe business success and social responsibility go hand in hand. Our CSR initiatives focus on Education, Environment, and Employee Welfare.</p><h2>Education</h2><p>Through our <strong>Stitch for Success</strong> programme, we have trained over 10,000 women in garment manufacturing skills, providing them with sustainable livelihoods. We also support scholarships for students from underprivileged backgrounds pursuing careers in fashion design.</p><h2>Environment</h2><p>We are committed to reducing our carbon footprint through energy-efficient stores, responsible sourcing, and waste reduction initiatives. Our goal is to achieve carbon neutrality by 2035.</p><h2>Community</h2><p>Our stores serve as community hubs — hosting design workshops, fashion shows for local artisans, and fundraising events for local NGOs.</p><h2>Employee Welfare</h2><p>We run comprehensive programmes for employee health, mental well-being, and professional development, ensuring every team member can thrive.</p>`,
    meta_title: 'Corporate Social Responsibility | ShoppersHub',
    meta_description: "ShoppersHub's CSR initiatives in education, environment, and community.",
  },
  {
    title: 'Sustainability',
    slug: 'sustainability',
    excerpt: 'Our journey towards a more sustainable and responsible fashion future.',
    content: `<h2>Our Commitment to Sustainability</h2><p>Fashion has a significant environmental impact. At ShoppersHub, we are taking concrete steps to make our operations more sustainable and to encourage responsible consumption among our customers.</p><h2>Sustainable Sourcing</h2><p>We are working with our brand partners to increase the share of sustainably sourced materials — organic cotton, recycled polyester, and responsibly dyed fabrics — in our product assortment.</p><h2>Circular Fashion</h2><p>Our <strong>Give Back</strong> programme allows customers to return used clothing for recycling or donation, diverting textile waste from landfills.</p><h2>Green Stores</h2><ul><li>100% LED lighting across all stores</li><li>Solar energy at select store locations</li><li>Water recycling systems in new stores</li><li>Paperless billing option for all purchases</li></ul><h2>Packaging</h2><p>We have eliminated single-use plastic bags from all stores and shifted to 100% recyclable or reusable packaging.</p>`,
    meta_title: 'Sustainability | ShoppersHub',
    meta_description: "ShoppersHub's sustainability initiatives for a greener fashion future.",
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    excerpt: 'How we collect, use, and protect your personal information.',
    content: `<h2>Privacy Policy</h2><p><em>Last updated: January 2025</em></p><h2>Information We Collect</h2><p>We collect information you provide directly to us, including name, email, phone number, shipping address, and payment information. We also collect usage data, device identifiers, and browsing behaviour on our platform.</p><h2>How We Use Your Information</h2><ul><li>To process and fulfil your orders</li><li>To send order updates, promotions, and account notifications</li><li>To personalise your shopping experience</li><li>To improve our products, services, and website</li><li>To comply with legal obligations</li></ul><h2>Data Sharing</h2><p>We do not sell your personal data. We may share your information with trusted service providers (payment gateways, logistics partners) only as necessary to fulfil your orders and operate our services.</p><h2>Your Rights</h2><p>You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time. Contact us at <strong>privacy@shoppershub.in</strong> for any data-related requests.</p><h2>Cookies</h2><p>We use cookies to enhance your browsing experience, analyse site traffic, and personalise content. You can control cookie preferences through your browser settings.</p>`,
    meta_title: 'Privacy Policy | ShoppersHub',
    meta_description: "ShoppersHub's privacy policy — how we collect, use, and protect your data.",
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms-conditions',
    excerpt: "The terms governing your use of ShoppersHub's website and services.",
    content: `<h2>Terms &amp; Conditions</h2><p><em>Last updated: January 2025</em></p><h2>Acceptance of Terms</h2><p>By accessing or using ShoppersHub's website or mobile app, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please discontinue use of our platform.</p><h2>User Accounts</h2><p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account.</p><h2>Orders &amp; Payments</h2><p>All orders are subject to product availability and payment verification. We reserve the right to cancel orders that cannot be fulfilled. Prices are inclusive of applicable taxes unless stated otherwise.</p><h2>Returns &amp; Refunds</h2><p>Products may be returned within 30 days of delivery in their original condition with tags intact. Refunds are processed within 7–10 business days of receiving the returned item.</p><h2>Intellectual Property</h2><p>All content on ShoppersHub — including logos, product images, and text — is the property of ShoppersHub or its brand partners and is protected by copyright law.</p><h2>Governing Law</h2><p>These terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>`,
    meta_title: 'Terms & Conditions | ShoppersHub',
    meta_description: "Read ShoppersHub's terms and conditions for using our platform.",
  },
  {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    excerpt: 'Delivery timelines, charges, and what to expect when you shop with us.',
    content: `<h2>Shipping Policy</h2><h2>Delivery Timelines</h2><ul><li><strong>Standard Delivery:</strong> 3–7 business days depending on your location</li><li><strong>Express Delivery:</strong> Next-day delivery available for select pin codes</li><li><strong>Store Pickup:</strong> Ready in 2–4 hours at your nearest ShoppersHub store</li></ul><h2>Shipping Charges</h2><ul><li>Free delivery on orders above ₹499</li><li>₹49 shipping fee on orders below ₹499</li><li>Express delivery: ₹99 flat fee</li></ul><h2>Order Tracking</h2><p>Once your order is dispatched, you will receive an SMS and email with tracking details. You can also track your order in real-time from the "My Orders" section of your account.</p><h2>International Shipping</h2><p>We currently ship only within India. International shipping is not available at this time.</p><h2>Undeliverable Packages</h2><p>If a package cannot be delivered due to an incorrect address or repeated failed delivery attempts, it will be returned to our warehouse. We will contact you to arrange re-delivery.</p>`,
    meta_title: 'Shipping Policy | ShoppersHub',
    meta_description: 'ShoppersHub shipping policy — delivery timelines, charges, and tracking information.',
  },
];

const client = await pool.connect();
try {
  await client.query('BEGIN');

  await client.query(`
    CREATE TABLE IF NOT EXISTS cms_pages (
      id               SERIAL PRIMARY KEY,
      title            TEXT NOT NULL,
      slug             TEXT UNIQUE NOT NULL,
      excerpt          TEXT DEFAULT '',
      content          TEXT DEFAULT '',
      meta_title       TEXT,
      meta_description TEXT,
      status           TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  let inserted = 0, updated = 0;
  for (const p of DEFAULT_PAGES) {
    const { rows } = await client.query(
      `INSERT INTO cms_pages (title, slug, excerpt, content, meta_title, meta_description, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'published')
       ON CONFLICT (slug) DO UPDATE
         SET title=$1, excerpt=$3, meta_title=$5, meta_description=$6, updated_at=NOW()
       RETURNING (xmax = 0) AS is_insert`,
      [p.title, p.slug, p.excerpt, p.content, p.meta_title, p.meta_description]
    );
    if (rows[0].is_insert) { inserted++; console.log(`  + ${p.title}`); }
    else                   { updated++;  console.log(`  ~ ${p.title} (updated)`); }
  }

  await client.query('COMMIT');
  console.log(`\n✓ cms_pages table ready — ${inserted} added, ${updated} updated.`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
