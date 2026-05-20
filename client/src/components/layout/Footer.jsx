import { Link } from 'react-router-dom';

/* ── Social icons ────────────────────────────────────────────────────────── */
function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
function IconTwitter() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l16 16M4 20L20 4"/>
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IconPinterest() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.641 1.267 1.408 0 .858-.546 2.141-.828 3.329-.236.995.499 1.806 1.476 1.806 1.771 0 3.132-1.866 3.132-4.563 0-2.386-1.716-4.054-4.165-4.054-2.837 0-4.5 2.128-4.5 4.327 0 .857.33 1.775.742 2.277a.3.3 0 0 1 .069.285c-.076.313-.244.995-.277 1.134-.044.183-.146.222-.336.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.522 0 10-4.477 10-10S17.522 2 12 2z"/>
    </svg>
  );
}

/* ── Payment icon (card shape) ───────────────────────────────────────────── */
function PayCard({ children, bg = 'bg-white' }) {
  return (
    <span className={`inline-flex items-center justify-center h-7 px-2.5 rounded border border-white/10 ${bg} text-[10px] font-bold`}>
      {children}
    </span>
  );
}

/* ── Link columns data ───────────────────────────────────────────────────── */
const COLUMNS = [
  {
    heading: 'Shoppers Hub',
    links: [
      { label: 'About Us',                       to: '/pages/about-us' },
      { label: 'Careers',                        to: '/pages/careers' },
      { label: 'Press',                          to: '/pages/press' },
      { label: 'Investor Relations',             to: '/pages/investor-relations' },
      { label: 'Corporate Social Responsibility',to: '/pages/csr' },
      { label: 'Sustainability',                 to: '/pages/sustainability' },
    ],
  },
  {
    heading: 'Customer Support',
    links: [
      { label: 'FAQs',                to: '/faqs' },
      { label: 'Track My Order',      to: '/orders' },
      { label: 'Returns & Exchange',  to: '/returns' },
      { label: 'Contact Us',          to: '/contact' },
      { label: 'Store Locator',       to: '/stores' },
      { label: 'Shipping Policy',     to: '/pages/shipping-policy' },
    ],
  },
  {
    heading: 'More From Us',
    links: [
      { label: 'First Citizen',   to: '/register' },
      { label: 'Luxe Collection', to: '/luxe' },
      { label: 'Gifts & Gift Cards', to: '/gifts' },
      { label: 'All Brands',      to: '/brands' },
      { label: 'Offers & Deals',  to: '/offers' },
      { label: 'Mobile App',      to: '/' },
    ],
  },
  {
    heading: 'Shop By Category',
    links: [
      { label: 'Men',      to: '/category/men' },
      { label: 'Women',    to: '/category/women' },
      { label: 'Kids',     to: '/category/kids' },
      { label: 'Beauty',   to: '/category/beauty' },
      { label: 'Watches',  to: '/category/watches' },
      { label: 'Home',     to: '/category/home' },
      { label: 'Gifts',    to: '/gifts' },
    ],
  },
  {
    heading: 'Top Brands',
    links: [
      { label: 'Allen Solly',    to: '/brand/allen-solly' },
      { label: 'Louis Philippe', to: '/brand/louis-philippe' },
      { label: 'Van Heusen',     to: '/brand/van-heusen' },
      { label: 'AND',            to: '/brand/and' },
      { label: 'Adidas',         to: '/brand/adidas' },
      { label: 'Nike',           to: '/brand/nike' },
    ],
  },
];

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com',  Icon: IconInstagram },
  { label: 'Facebook',  href: 'https://facebook.com',   Icon: IconFacebook  },
  { label: 'Twitter',   href: 'https://twitter.com',    Icon: IconTwitter   },
  { label: 'YouTube',   href: 'https://youtube.com',    Icon: IconYoutube   },
  { label: 'Pinterest', href: 'https://pinterest.com',  Icon: IconPinterest },
];

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

/* ── Styled brand strip (same as Luxe page) ──────────────────────────────── */
const FOOTER_BRANDS = [
  { name: 'VALENTINO',       style: 'font-serif tracking-[0.18em] font-light text-[15px]' },
  { name: 'MUGLER',          style: 'font-sans tracking-[0.22em] font-bold text-[14px]' },
  { name: 'COACH',           style: 'font-sans tracking-[0.15em] font-bold text-[13px]', boxed: true },
  { name: 'SWAROVSKI',       style: 'font-sans tracking-[0.2em] font-light text-[13px]' },
  { name: 'Maison Margiela', style: 'font-sans tracking-[0.05em] font-normal text-[13px]', sub: 'Paris' },
  { name: 'roberto cavalli', style: 'font-serif tracking-[0.04em] italic font-normal text-[15px]' },
  { name: 'GUCCI',           style: 'font-sans tracking-[0.35em] font-bold text-[14px]' },
  { name: 'VERSACE',         style: 'font-sans tracking-[0.25em] font-bold text-[13px]' },
  { name: 'TORY BURCH',      style: 'font-sans tracking-[0.18em] font-semibold text-[12px]' },
  { name: 'BURBERRY',        style: 'font-sans tracking-[0.15em] font-light text-[14px]' },
  { name: 'TOM FORD',        style: 'font-sans tracking-[0.22em] font-bold text-[13px]' },
  { name: 'EMPORIO ARMANI',  style: 'font-sans tracking-[0.1em] font-light text-[12px]' },
];

function FooterBrandStrip() {
  const items = [...FOOTER_BRANDS, ...FOOTER_BRANDS];
  return (
    <div className="overflow-hidden bg-[#111] border-b border-white/8 py-5">
      <div
        className="flex items-center gap-16 whitespace-nowrap"
        style={{ animation: 'footerBrandScroll 35s linear infinite' }}
      >
        {items.map((b, i) => (
          <div key={i} className="shrink-0 flex flex-col items-center justify-center select-none">
            {b.boxed ? (
              <span className={`border border-white/40 px-3 py-1 text-white/60 ${b.style}`}>{b.name}</span>
            ) : (
              <>
                <span className={`text-white/55 ${b.style}`}>{b.name}</span>
                {b.sub && <span className="text-white/25 text-[8px] tracking-[0.25em] uppercase mt-0.5">{b.sub}</span>}
              </>
            )}
          </div>
        ))}
      </div>
      <style>{`@keyframes footerBrandScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-gray-400">

      {/* ── Luxury brand strip ── */}
      <FooterBrandStrip />

      {/* ── Main link grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-white text-[11px] font-bold uppercase tracking-[0.12em] mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      onClick={scrollTop}
                      className="text-[13px] text-gray-500 hover:text-white transition-colors leading-snug"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Social + App + Payments ── */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

          {/* Brand + Social */}
          <div>
            <Link to="/" onClick={scrollTop} className="inline-block mb-4">
              <span
                className="text-[26px] font-bold text-white"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontVariant: 'small-caps', letterSpacing: '0.05em' }}
              >
                Shoppers<span className="text-[#8B1A2F]">Hub</span>
              </span>
            </Link>
            <p className="text-[12px] text-gray-500 mb-4 max-w-xs leading-relaxed">
              India's premium fashion destination — curated styles for every occasion, delivered to your door.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-gray-500 hover:border-[#8B1A2F] hover:text-white transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* App download */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">Download the App</p>
            <div className="flex gap-3">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-white/5 border border-white/12 px-4 py-2.5 rounded hover:bg-white/10 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-gray-500 text-[9px] uppercase tracking-wide leading-none">Download on the</p>
                  <p className="text-white text-[12px] font-semibold leading-tight">App Store</p>
                </div>
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-white/5 border border-white/12 px-4 py-2.5 rounded hover:bg-white/10 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                  <defs>
                    <linearGradient id="fp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00C4E8"/><stop offset="100%" stopColor="#0085E5"/></linearGradient>
                    <linearGradient id="fp2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFE000"/><stop offset="100%" stopColor="#FFBD00"/></linearGradient>
                    <linearGradient id="fp3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FF3A44"/><stop offset="100%" stopColor="#C31162"/></linearGradient>
                    <linearGradient id="fp4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#32A071"/><stop offset="100%" stopColor="#2DA771"/></linearGradient>
                  </defs>
                  <path d="M3.18 23.76c.38.21.83.23 1.24.06l12.1-6.99-2.59-2.59-10.75 9.52z" fill="url(#fp1)"/>
                  <path d="M21.54 10.27c-.37-.74-1.02-1.27-1.78-1.27H3.73L13.93 19l7.61-7.54c.45-.44.37-1.19 0-1.19z" fill="url(#fp2)"/>
                  <path d="M3.18.24C2.8.45 2.5.87 2.5 1.4v21.2c0 .53.3.95.68 1.16l10.75-9.52-10.75-14z" fill="url(#fp3)"/>
                  <path d="M16.52 9H3.73l-10-9 10 9 12.79-7.39c-.35-.36-.98-.36-1.25-.18-.37.21 0 0-.75.57z" fill="url(#fp4)"/>
                </svg>
                <div>
                  <p className="text-gray-500 text-[9px] uppercase tracking-wide leading-none">Get it on</p>
                  <p className="text-white text-[12px] font-semibold leading-tight">Google Play</p>
                </div>
              </a>
            </div>
          </div>

          {/* Payment methods */}
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-3">We Accept</p>
            <div className="flex flex-wrap gap-2">
              {/* Visa */}
              <PayCard><span className="text-[#1A1F71] font-black italic text-[13px]">VISA</span></PayCard>
              {/* Mastercard */}
              <PayCard>
                <span className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-[#EB001B] inline-block -mr-1.5"/>
                  <span className="w-4 h-4 rounded-full bg-[#F79E1B] inline-block opacity-90"/>
                </span>
              </PayCard>
              {/* Razorpay */}
              <PayCard>
                <svg width="14" height="15" viewBox="0 0 17 18" className="shrink-0">
                  <path fill="#0b72e7" d="M8.87 0 0 11.95h5.01L2.98 18l10.8-12.62H8.5L8.87 0Z"/>
                  <path fill="#072654" d="M10.38 0 9.94 3.84H17L14.23 0h-3.85Z"/>
                </svg>
                <span className="text-[#072654] font-bold text-[10px] ml-1">Razorpay</span>
              </PayCard>
              {/* UPI */}
              <PayCard><span className="text-[#2F80ED] font-black text-[11px]">UPI</span></PayCard>
              {/* Paytm */}
              <PayCard><span className="text-[#00B9F1] font-black text-[11px]">Paytm</span></PayCard>
              {/* EMI */}
              <PayCard><span className="text-gray-700 font-bold text-[10px]">EMI</span></PayCard>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom legal bar ── */}
      <div className="border-t border-white/8 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-600">
          <p>© {new Date().getFullYear()} ShoppersHub Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center">
            <Link to="/pages/privacy-policy"   className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link to="/pages/terms-conditions" className="hover:text-gray-400 transition-colors">Terms & Conditions</Link>
            <Link to="/returns"                className="hover:text-gray-400 transition-colors">Cancellation Policy</Link>
            <Link to="/pages/shipping-policy"  className="hover:text-gray-400 transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
