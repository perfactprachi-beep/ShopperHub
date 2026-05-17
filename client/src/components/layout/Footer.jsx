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
  { label: 'FAQs',        to: '/account/help' },
  { label: 'Track Order', to: '/orders' },
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
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-3 gap-10">
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
