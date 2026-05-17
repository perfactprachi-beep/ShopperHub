import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAllStores } from '../api/storesApi';

const SERVICES = ['Personal Shopping', 'Home Delivery', 'Gift Wrapping', 'Alterations'];

function StoreCard({ store }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`;

  return (
    <div className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="text-[14px] font-bold text-gray-900 leading-snug mb-0.5">{store.name}</h3>
          <p className="text-[12px] text-gray-500">{store.city}, {store.state}</p>
        </div>
        <span className="shrink-0 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 border border-green-200 uppercase tracking-wide">
          Open
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2">
          <svg className="w-3.5 h-3.5 text-[#8B1A2F] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p className="text-[12px] text-gray-600 leading-relaxed">{store.address} – {store.pincode}</p>
        </div>

        {store.phone && (
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#8B1A2F] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <p className="text-[12px] text-gray-600">{store.phone}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#8B1A2F] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-[12px] text-gray-600">{store.timing}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Services</p>
        <div className="flex flex-wrap gap-1">
          {SERVICES.map(s => (
            <span key={s} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5">{s}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#8B1A2F] text-white text-[12px] font-bold py-2 px-3 text-center hover:bg-[#6B1223] transition-colors uppercase tracking-wide"
        >
          Get Directions
        </a>
        {store.phone && (
          <a
            href={`tel:${store.phone}`}
            className="flex-1 border border-[#8B1A2F] text-[#8B1A2F] text-[12px] font-bold py-2 px-3 text-center hover:bg-[#8B1A2F] hover:text-white transition-colors uppercase tracking-wide"
          >
            Call Store
          </a>
        )}
      </div>
    </div>
  );
}

export default function StoreLocatorPage() {
  const [stores,        setStores]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedCity,  setSelectedCity]  = useState('');
  const [searchTerm,    setSearchTerm]    = useState('');

  useEffect(() => {
    getAllStores()
      .then(res => setStores(res.data.data))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  const cities = [...new Set(stores.map(s => s.city))].sort();

  const filtered = stores.filter(s => {
    const matchCity   = !selectedCity || s.city === selectedCity;
    const term        = searchTerm.toLowerCase();
    const matchSearch = !term ||
      s.name.toLowerCase().includes(term) ||
      s.address.toLowerCase().includes(term) ||
      s.city.toLowerCase().includes(term);
    return matchCity && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Stores & Events — Find ShoppersHub Stores Near You</title>
        <meta name="description" content="Find your nearest ShoppersHub store. Get store locations, contact details, timings and directions." />
      </Helmet>

      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h1 className="text-[32px] font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Stores & Events
          </h1>
          <p className="text-[14px] text-gray-500 max-w-xl mx-auto">
            Find your nearest ShoppersHub store. Experience premium shopping with personalised services across India.
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by store name, area or city…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 text-[13px] focus:outline-none focus:border-[#8B1A2F]"
            />
          </div>
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="sm:w-48 py-2.5 px-3 border border-gray-300 text-[13px] focus:outline-none focus:border-[#8B1A2F]"
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-gray-800 uppercase tracking-wider">
            {selectedCity ? `Stores in ${selectedCity}` : 'All Stores'}
          </h2>
          <p className="text-[13px] text-gray-500">
            {loading ? 'Loading…' : `${filtered.length} store${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 p-5 animate-pulse h-64" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-14 h-14 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p className="text-[14px] font-semibold text-gray-700 mb-1">No stores found</p>
            <p className="text-[13px] text-gray-400">Try a different city or clear the search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        )}
      </div>

      {/* In-store services */}
      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-[22px] font-bold text-gray-900 text-center mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            In-Store Services
          </h2>
          <p className="text-[13px] text-gray-500 text-center mb-8">Premium services available at every ShoppersHub store</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Personal Shopping', desc: 'Personalised styling advice from our fashion experts', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { label: 'Home Delivery',     desc: 'Shop in-store and get purchases delivered home', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4' },
              { label: 'Gift Wrapping',     desc: 'Complimentary gift wrapping for all purchases', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
              { label: 'Alterations',       desc: 'Professional alterations for the perfect fit', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z' },
            ].map(({ label, desc, icon }) => (
              <div key={label} className="text-center">
                <div className="w-14 h-14 bg-[#8B1A2F]/8 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-[#8B1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={icon}/>
                  </svg>
                </div>
                <p className="text-[13px] font-bold text-gray-800 mb-1">{label}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
