import { Link } from 'react-router-dom';

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconTwitter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 16 2a4.48 4.48 0 0 0-4.47 4.47 4.55 4.55 0 0 0 .11 1.02A12.8 12.8 0 0 1 2.89 3.78a4.48 4.48 0 0 0 1.38 5.97A4.41 4.41 0 0 1 2 9.13v.06a4.48 4.48 0 0 0 3.59 4.39 4.5 4.5 0 0 1-2.02.08 4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 1 19.54a12.73 12.73 0 0 0 6.9 2.02c8.27 0 12.8-6.85 12.8-12.8 0-.19 0-.38-.01-.57A9.15 9.15 0 0 0 23 3z" />
    </svg>
  );
}

const SHOP_LINKS = [
  { label: 'Men',    to: '/category/men' },
  { label: 'Women',  to: '/category/women' },
  { label: 'Kids',   to: '/category/kids' },
  { label: 'Beauty', to: '/category/beauty' },
  { label: 'Home',   to: '/category/home-decor' },
];

const HELP_LINKS = [
  { label: 'FAQs',        to: '/faqs' },
  { label: 'Track Order', to: '/account/orders' },
  { label: 'Returns',     to: '/returns' },
  { label: 'Contact',     to: '/contact' },
];

const SOCIAL = [
  { label: 'Instagram', href: '#', Icon: IconInstagram },
  { label: 'Facebook',  href: '#', Icon: IconFacebook },
  { label: 'Twitter',   href: '#', Icon: IconTwitter },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-text)] text-gray-300 mt-16">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Col 1 — Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/">
            <span
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Shoppers<span className="text-[var(--color-accent)]">Hub</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            India's premium fashion destination. Discover curated styles for every occasion.
          </p>
          <div className="mt-5 flex items-center gap-4">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-gray-400 hover:text-[var(--color-accent)] transition-colors"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Shop */}
        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Shop</h3>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Help */}
        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Help</h3>
          <ul className="space-y-2.5">
            {HELP_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Download App */}
        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Download App</h3>
          <p className="text-sm text-gray-400 mb-4">Get exclusive app-only deals.</p>
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-[var(--radius-md)] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-gray-400 leading-none">Download on the</div>
                <div className="text-sm font-semibold text-white leading-tight">App Store</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-[var(--radius-md)] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                <path d="M3.18 23.76c.31.17.65.24 1 .24.48 0 .96-.14 1.38-.41L17 17.41l-3.45-3.45-10.37 9.8zM.5 2.06C.19 2.5 0 3.06 0 3.73v16.54c0 .67.19 1.23.5 1.67l.08.08 9.27-9.27v-.22L.58 3.98.5 2.06zM20.51 10.27L17.64 8.6l-3.7 3.7 3.7 3.7 2.89-1.67c.82-.48.82-1.58 0-2.06zM4.18.41C3.76.14 3.28 0 2.8 0c-.35 0-.69.07-1 .24l-.08.09 9.27 9.26 3.45-3.45L4.18.41z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-gray-400 leading-none">Get it on</div>
                <div className="text-sm font-semibold text-white leading-tight">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ShoppersHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Secure payments:</span>
            {/* Payment logos (text badges) */}
            {['Razorpay', 'Visa', 'Mastercard', 'UPI'].map((p) => (
              <span key={p} className="px-2 py-0.5 border border-white/20 rounded text-gray-400 text-[10px] font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
