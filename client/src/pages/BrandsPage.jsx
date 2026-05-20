import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuthStore } from '../store/authStore.js';
import LoginModal from '../components/ui/LoginModal.jsx';

/* ── Icons ────────────────────────────────────────────────────────────────── */
function IconSearch({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconCheck({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconPlus({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function IconChevronRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function IconHeart({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

/* ── Brand initial avatar colour pool ────────────────────────────────────── */
const AVATAR_COLORS = [
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#FEE2E2', text: '#991B1B' },
  { bg: '#E0F2FE', text: '#0C4A6E' },
  { bg: '#FDF4FF', text: '#7E22CE' },
];
function brandColor(name) {
  const code = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[code];
}

/* ── Brand Card ───────────────────────────────────────────────────────────── */
function BrandCard({ brand, isFollowing, onToggle }) {
  const navigate = useNavigate();
  const col = brandColor(brand.name);
  const initial = brand.name.charAt(0).toUpperCase();

  return (
    <div
      onClick={() => navigate(`/brand/${brand.slug}`)}
      className="group relative bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer hover:border-[#8B1A2F]/40 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse at top, ${col.bg}55, transparent 70%)` }}
      />

      {/* Avatar */}
      <div
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm group-hover:scale-110 transition-transform duration-200"
        style={{ background: col.bg, color: col.text }}
      >
        {brand.logo_url ? (
          <img
            src={brand.logo_url}
            alt={brand.name}
            className="w-full h-full object-contain rounded-2xl p-1"
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <span className={brand.logo_url ? 'hidden' : 'flex'}>{initial}</span>
      </div>

      {/* Name */}
      <p className="relative text-[13px] font-bold text-gray-800 uppercase tracking-wide text-center group-hover:text-[#8B1A2F] transition-colors leading-snug line-clamp-2">
        {brand.name}
      </p>

      {/* Arrow hint */}
      <span className="relative text-gray-300 group-hover:text-[#8B1A2F] transition-colors">
        <IconChevronRight size={14} />
      </span>

      {/* Follow button — top-right */}
      <button
        onClick={e => { e.stopPropagation(); onToggle(brand.id); }}
        title={isFollowing ? 'Unfollow' : 'Follow'}
        className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          isFollowing
            ? 'bg-[#8B1A2F] text-white shadow-sm'
            : 'bg-gray-100 text-gray-400 hover:bg-[#8B1A2F]/10 hover:text-[#8B1A2F]'
        }`}
      >
        {isFollowing ? <IconCheck size={13} /> : <IconPlus size={13} />}
      </button>
    </div>
  );
}

/* ── Empty states ─────────────────────────────────────────────────────────── */
function EmptyFollowing({ onExplore }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-[#8B1A2F]/8 flex items-center justify-center mb-5">
        <IconHeart size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">No followed brands yet</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-7 leading-relaxed">
        Tap the <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 mx-1"><IconPlus size={10} /></span> on any brand card to follow it and see it here.
      </p>
      <button
        onClick={onExplore}
        className="px-7 py-2.5 bg-[#8B1A2F] text-white text-[12px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#6d1424] transition-colors"
      >
        Explore Brands
      </button>
    </div>
  );
}

function EmptySearch() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <IconSearch size={36} />
      <p className="mt-3 text-sm font-medium">No brands found</p>
    </div>
  );
}

/* ── Skeleton loader ──────────────────────────────────────────────────────── */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-3 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gray-100" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-3 w-10 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function BrandsPage() {
  const { data, loading } = useFetch(() => productsApi.brands(), []);
  const brands = data?.data ?? [];
  const { user } = useAuthStore();

  const [tab, setTab] = useState('popular');
  const [search, setSearch] = useState('');
  const [sideSearch, setSideSearch] = useState('');
  const [following, setFollowing] = useState(new Set());
  const [showLogin, setShowLogin] = useState(false);
  const [pendingFollow, setPendingFollow] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const searchRef = useRef(null);

  /* ── Follow logic ── */
  const toggleFollow = (id) => {
    if (!user) { setPendingFollow(id); setShowLogin(true); return; }
    setFollowing(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (pendingFollow !== null) {
      setFollowing(prev => { const n = new Set(prev); n.add(pendingFollow); return n; });
      setPendingFollow(null);
    }
  };

  /* ── Alphabet index ── */
  const alphabet = useMemo(() => {
    const letters = new Set(brands.map(b => b.name.charAt(0).toUpperCase()));
    return ['ALL', ...Array.from(letters).sort()];
  }, [brands]);

  /* ── Filtered lists ── */
  const filteredPopular = useMemo(() => brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesLetter = selectedLetter === 'ALL' || b.name.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesLetter;
  }), [brands, search, selectedLetter]);

  const filteredFollowing = useMemo(() => brands.filter(b =>
    following.has(b.id) && b.name.toLowerCase().includes(search.toLowerCase())
  ), [brands, following, search]);

  const filteredSidebar = useMemo(() => brands.filter(b =>
    b.name.toLowerCase().includes(sideSearch.toLowerCase())
  ), [brands, sideSearch]);

  const displayedBrands = tab === 'following' ? filteredFollowing : filteredPopular;

  return (
    <>
      <Helmet>
        <title>Brands – ShoppersHub</title>
        <meta name="description" content="Explore all fashion brands at ShoppersHub. Follow your favourites and shop their latest collections." />
      </Helmet>

      {showLogin && (
        <LoginModal
          onClose={() => { setShowLogin(false); setPendingFollow(null); }}
          onSuccess={handleLoginSuccess}
        />
      )}

      <div className="bg-gray-50 min-h-screen">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
                All Brands
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading ? '…' : `${brands.length} brands available`}
              </p>
            </div>

            {/* Global search */}
            <div ref={searchRef} className="relative w-full sm:w-80">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <IconSearch size={15} />
              </span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedLetter('ALL'); }}
                placeholder="Search brands…"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/10 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
                >✕</button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

          {/* ── Left Sidebar ──────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 gap-4">

            {/* Filter card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gray-50">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">Filter</span>
              </div>

              {/* Sidebar brand search */}
              <div className="px-3 pt-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <IconSearch size={13} />
                  </span>
                  <input
                    value={sideSearch}
                    onChange={e => setSideSearch(e.target.value)}
                    placeholder="Find brand…"
                    className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#8B1A2F]/60 focus:ring-1 focus:ring-[#8B1A2F]/10"
                  />
                </div>
              </div>

              {/* Brands list */}
              <div className="px-2 py-2">
                <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Brands</p>
                <div className="overflow-y-auto max-h-[56vh] space-y-0.5">
                  {loading ? (
                    Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-8 mx-2 bg-gray-100 rounded animate-pulse mb-1" />
                    ))
                  ) : filteredSidebar.map(brand => (
                    <div
                      key={brand.id}
                      className="flex items-center gap-2 px-2 py-2 rounded-xl group hover:bg-gray-50 transition-colors"
                    >
                      {/* Mini avatar */}
                      <div
                        className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] font-black"
                        style={{ background: brandColor(brand.name).bg, color: brandColor(brand.name).text }}
                      >
                        {brand.name.charAt(0).toUpperCase()}
                      </div>

                      <Link
                        to={`/brand/${brand.slug}`}
                        className="flex-1 text-[12px] font-medium text-gray-700 group-hover:text-[#8B1A2F] transition-colors truncate"
                      >
                        {brand.name}
                      </Link>

                      <button
                        onClick={e => { e.stopPropagation(); toggleFollow(brand.id); }}
                        title={following.has(brand.id) ? 'Unfollow' : 'Follow'}
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          following.has(brand.id)
                            ? 'bg-[#8B1A2F] text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-[#8B1A2F]/15 hover:text-[#8B1A2F]'
                        }`}
                      >
                        {following.has(brand.id) ? <IconCheck size={10} /> : <IconPlus size={10} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Following summary card */}
            {following.size > 0 && (
              <div
                onClick={() => setTab('following')}
                className="bg-[#8B1A2F] rounded-2xl p-4 cursor-pointer hover:bg-[#6d1424] transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <IconHeart size={16} />
                  <span className="text-white text-[11px] font-bold uppercase tracking-widest">Following</span>
                </div>
                <p className="text-white text-2xl font-black">{following.size}</p>
                <p className="text-white/70 text-[11px] mt-0.5">brand{following.size !== 1 ? 's' : ''}</p>
              </div>
            )}
          </aside>

          {/* ── Right Panel ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Tabs row */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-hidden">
              <div className="flex items-center px-4 border-b border-gray-100">
                {[
                  { key: 'popular',   label: 'Popular Brands', count: null },
                  { key: 'following', label: 'Following',       count: following.size || null },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-2 py-4 px-1 mr-6 text-[13px] font-semibold border-b-2 transition-colors ${
                      tab === t.key
                        ? 'border-[#8B1A2F] text-[#8B1A2F]'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {t.label}
                    {t.count !== null && t.count > 0 && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        tab === t.key ? 'bg-[#8B1A2F] text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Alphabet strip — only on Popular tab */}
              {tab === 'popular' && !search && (
                <div className="flex items-center gap-1 px-4 py-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  {alphabet.map(letter => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(letter)}
                      className={`shrink-0 min-w-[32px] h-7 px-1 text-[11px] font-bold rounded-lg transition-colors ${
                        selectedLetter === letter
                          ? 'bg-[#8B1A2F] text-white'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid / empty states */}
            {loading ? (
              <SkeletonGrid />
            ) : tab === 'following' && following.size === 0 ? (
              <EmptyFollowing onExplore={() => setTab('popular')} />
            ) : displayedBrands.length === 0 ? (
              <EmptySearch />
            ) : (
              <>
                {/* Result count */}
                <p className="text-[11px] text-gray-400 font-medium mb-4">
                  {displayedBrands.length} brand{displayedBrands.length !== 1 ? 's' : ''}
                  {selectedLetter !== 'ALL' && tab === 'popular' ? ` starting with "${selectedLetter}"` : ''}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {displayedBrands.map(brand => (
                    <BrandCard
                      key={brand.id}
                      brand={brand}
                      isFollowing={following.has(brand.id)}
                      onToggle={toggleFollow}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
