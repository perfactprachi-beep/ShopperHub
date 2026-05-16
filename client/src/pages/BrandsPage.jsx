import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuthStore } from '../store/authStore.js';
import LoginModal from '../components/ui/LoginModal.jsx';

function PlusCircleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function CheckCircleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}

export default function BrandsPage() {
  const { data, loading } = useFetch(() => productsApi.brands(), []);
  const brands = data?.data ?? [];
  const { user } = useAuthStore();

  const [brandsOpen, setBrandsOpen] = useState(true);
  const [tab, setTab] = useState('popular');
  const [tabSearch, setTabSearch] = useState('');
  const [following, setFollowing] = useState(new Set());
  const [showLogin, setShowLogin] = useState(false);
  const [pendingFollow, setPendingFollow] = useState(null);

  const toggleFollow = (id) => {
    if (!user) {
      setPendingFollow(id);
      setShowLogin(true);
      return;
    }
    setFollowing(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (pendingFollow !== null) {
      setFollowing(prev => {
        const next = new Set(prev);
        next.add(pendingFollow);
        return next;
      });
      setPendingFollow(null);
    }
  };

  const popularBrands = brands.filter(b =>
    b.name.toLowerCase().includes(tabSearch.toLowerCase())
  );

  const followingBrands = brands.filter(b =>
    following.has(b.id) && b.name.toLowerCase().includes(tabSearch.toLowerCase())
  );

  return (
    <>
    {showLogin && (
      <LoginModal
        onClose={() => { setShowLogin(false); setPendingFollow(null); }}
        onSuccess={handleLoginSuccess}
      />
    )}
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-0 min-h-[80vh]">

      {/* ── Left Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-[240px] flex-shrink-0 border-r border-gray-200 pr-4">

        {/* Filter header */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-0">
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900">Filter</h2>
        </div>

        {/* Brands accordion */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setBrandsOpen(v => !v)}
            className="w-full flex items-center justify-between py-4"
          >
            <span className="text-[13px] font-semibold uppercase tracking-wide text-gray-800">Brands</span>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              className={`text-gray-500 transition-transform duration-200 ${brandsOpen ? 'rotate-45' : ''}`}
            >
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          {brandsOpen && (
            <div className="pb-4 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : brands.map(brand => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 group"
                >
                  <Link
                    to={`/brand/${brand.slug}`}
                    className="text-[13px] text-gray-600 group-hover:text-[#8B1A2F] transition-colors flex-1"
                  >
                    {brand.name}
                  </Link>
                  <button
                    onClick={() => toggleFollow(brand.id)}
                    className={`flex-shrink-0 transition-colors ${
                      following.has(brand.id) ? 'text-[#8B1A2F]' : 'text-gray-300 hover:text-[#8B1A2F]'
                    }`}
                    title={following.has(brand.id) ? 'Unfollow' : 'Follow'}
                  >
                    {following.has(brand.id) ? <CheckCircleIcon size={16} /> : <PlusCircleIcon size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Right Panel ───────────────────────────────────────────────── */}
      <div className="flex-1 pl-8">
        {/* Tabs + Search row */}
        <div className="flex items-center justify-between border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setTab('following')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                tab === 'following' ? 'border-[#8B1A2F] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Following Brands
              {following.size > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-[#8B1A2F] text-white text-[10px] rounded-full">{following.size}</span>
              )}
            </button>
            <button
              onClick={() => setTab('popular')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                tab === 'popular' ? 'border-[#8B1A2F] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Popular Brands
            </button>
          </div>

          <div className="relative mb-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={tabSearch}
              onChange={e => setTabSearch(e.target.value)}
              placeholder={`Search in ${tab === 'following' ? 'Following' : 'Popular'} Brands`}
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full outline-none focus:border-[#8B1A2F]/40 focus:ring-2 focus:ring-[#8B1A2F]/10 transition-colors w-64"
            />
          </div>
        </div>

        {/* Tab content */}
        {tab === 'following' ? (
          following.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-[#8B1A2F]/8 flex items-center justify-center mb-5">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">You are not following brands yet</h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                Start following your favorites. Just tap the <span className="inline-flex items-center justify-center"><PlusCircleIcon size={14} /></span> on any brand you love!
              </p>
              <button
                onClick={() => setTab('popular')}
                className="px-6 py-2.5 border border-gray-800 text-gray-800 text-sm font-semibold rounded hover:bg-gray-800 hover:text-white transition-colors"
              >
                Explore Brands
              </button>
            </div>
          ) : (
            <BrandGrid brands={followingBrands} following={following} onToggle={toggleFollow} />
          )
        ) : (
          loading ? (
            <div className="grid grid-cols-3 gap-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded animate-pulse m-1" />
              ))}
            </div>
          ) : (
            <BrandGrid brands={popularBrands} following={following} onToggle={toggleFollow} />
          )
        )}
      </div>
    </div>
    </>
  );
}

function BrandGrid({ brands, following, onToggle }) {
  if (!brands.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p className="mt-3 text-sm">No brands found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 border-t border-l border-gray-100">
      {brands.map(brand => (
        <div
          key={brand.id}
          className="flex items-center border-b border-r border-gray-100 px-5 py-4 group hover:bg-gray-50/60 transition-colors"
        >
          {/* Brand name */}
          <Link
            to={`/brand/${brand.slug}`}
            className={`flex-1 text-sm font-semibold tracking-wide uppercase transition-colors group-hover:text-[#8B1A2F] ${
              following.has(brand.id) ? 'text-[#8B1A2F]' : 'text-gray-800'
            }`}
          >
            {brand.name}
          </Link>

          {/* Right ⊕ / ✓ follow button */}
          <button
            onClick={() => onToggle(brand.id)}
            title={following.has(brand.id) ? 'Unfollow' : 'Follow brand'}
            className={`flex-shrink-0 transition-colors ${
              following.has(brand.id) ? 'text-[#8B1A2F]' : 'text-gray-400 hover:text-[#8B1A2F]'
            }`}
          >
            {following.has(brand.id) ? <CheckCircleIcon size={20} /> : <PlusCircleIcon size={20} />}
          </button>
        </div>
      ))}
    </div>
  );
}
