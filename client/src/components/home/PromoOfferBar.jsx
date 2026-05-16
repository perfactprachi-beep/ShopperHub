import { Link } from 'react-router-dom';

const OFFERS = [
  {
    code: 'NEW10',
    title: '10% Off',
    desc: 'For first-time users on orders above ₹3,000',
    link: '/register',
    color: '#8B1A2F',
  },
  {
    code: 'STYLE26',
    title: 'Flat ₹450 – ₹1000 Off',
    desc: 'On orders above ₹5,000 | ₹1,000 off on ₹10,000+',
    link: '/offers',
    color: '#1A1A2E',
  },
  {
    code: 'LUXE',
    title: 'Flat ₹2,500 Off',
    desc: 'On luxury purchases above ₹20,000',
    link: '/category/luxe',
    color: '#C9A84C',
  },
];

export default function PromoOfferBar() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {OFFERS.map((o) => (
          <Link
            key={o.code}
            to={o.link}
            className="flex items-center gap-4 border border-gray-200 rounded-lg px-5 py-4 hover:shadow-md transition-shadow bg-white group"
          >
            <div
              className="shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-sm tracking-widest"
              style={{ backgroundColor: o.color }}
            >
              {o.code}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 group-hover:text-[#8B1A2F] transition-colors">
                {o.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{o.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
