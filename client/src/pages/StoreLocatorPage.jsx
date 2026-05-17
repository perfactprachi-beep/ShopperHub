import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
  'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur', 'Amritsar', 'Raipur', 'Allahabad',
  'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Madurai', 'Guwahati', 'Chandigarh',
  'Hubli-Dharwad', 'Amroha', 'Moradabad', 'Gurgaon', 'Aligarh', 'Solapur', 'Ranchi'
];

const SAMPLE_STORES = [
  {
    id: 1,
    name: 'ShoppersHub Phoenix MarketCity',
    address: 'Phoenix MarketCity, LBS Marg, Kurla West, Mumbai - 400070',
    phone: '+91 22 6671 8888',
    hours: '11:00 AM - 10:00 PM',
    city: 'Mumbai',
    area: 'Kurla',
    services: ['Personal Shopping', 'Home Delivery', 'Gift Wrapping', 'Alterations']
  },
  {
    id: 2,
    name: 'ShoppersHub Select City Walk',
    address: 'Select City Walk, A-3, District Centre, Saket, New Delhi - 110017',
    phone: '+91 11 4055 9999',
    hours: '11:00 AM - 10:00 PM',
    city: 'Delhi',
    area: 'Saket',
    services: ['Personal Shopping', 'Home Delivery', 'Gift Wrapping', 'Beauty Services']
  },
  {
    id: 3,
    name: 'ShoppersHub Forum Mall',
    address: '21, Hosur Road, Koramangala, Bangalore - 560029',
    phone: '+91 80 4112 7777',
    hours: '11:00 AM - 10:00 PM',
    city: 'Bangalore',
    area: 'Koramangala',
    services: ['Personal Shopping', 'Home Delivery', 'Gift Wrapping', 'Styling Services']
  },
  {
    id: 4,
    name: 'ShoppersHub Express Avenue',
    address: 'Express Avenue Mall, Royapettah, Chennai - 600014',
    phone: '+91 44 4224 5555',
    hours: '11:00 AM - 10:00 PM',
    city: 'Chennai',
    area: 'Royapettah',
    services: ['Personal Shopping', 'Home Delivery', 'Gift Wrapping']
  },
  {
    id: 5,
    name: 'ShoppersHub South City Mall',
    address: 'South City Mall, Prince Anwar Shah Road, Kolkata - 700068',
    phone: '+91 33 4008 3333',
    hours: '11:00 AM - 10:00 PM',
    city: 'Kolkata',
    area: 'Jadavpur',
    services: ['Personal Shopping', 'Home Delivery', 'Gift Wrapping', 'Alterations']
  },
  {
    id: 6,
    name: 'ShoppersHub Inorbit Mall',
    address: 'Inorbit Mall, Mindspace, HITEC City, Hyderabad - 500081',
    phone: '+91 40 4433 2222',
    hours: '11:00 AM - 10:00 PM',
    city: 'Hyderabad',
    area: 'HITEC City',
    services: ['Personal Shopping', 'Home Delivery', 'Gift Wrapping', 'Beauty Services']
  }
];

function StoreCard({ store }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{store.name}</h3>
          <p className="text-sm text-gray-600">{store.area}, {store.city}</p>
        </div>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
          Open
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p className="text-sm text-gray-600">{store.address}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          <p className="text-sm text-gray-600">{store.phone}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-gray-600">{store.hours}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-2">Services Available:</p>
        <div className="flex flex-wrap gap-1">
          {store.services.map((service, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {service}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-[#8B1A2F] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#6B1223] transition-colors">
          Get Directions
        </button>
        <button className="flex-1 border border-[#8B1A2F] text-[#8B1A2F] text-sm font-medium py-2 px-4 rounded hover:bg-[#8B1A2F] hover:text-white transition-colors">
          Call Store
        </button>
      </div>
    </div>
  );
}

export default function StoreLocatorPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStores, setFilteredStores] = useState(SAMPLE_STORES);

  useEffect(() => {
    let filtered = SAMPLE_STORES;
    
    if (selectedCity) {
      filtered = filtered.filter(store => store.city === selectedCity);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredStores(filtered);
  }, [selectedCity, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Store Locator - Find ShoppersHub Stores Near You</title>
        <meta name="description" content="Find ShoppersHub stores near you. Get store locations, contact details, timings and directions to your nearest ShoppersHub store." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Store Locator</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your nearest ShoppersHub store and discover the latest fashion trends. 
              Experience premium shopping with personalized services at our stores across India.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by store name, area or landmark..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/10"
                />
              </div>
            </div>
            
            {/* City Filter */}
            <div className="md:w-64">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/10"
              >
                <option value="">All Cities</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCity ? `Stores in ${selectedCity}` : 'All Stores'}
          </h2>
          <p className="text-gray-600">
            {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or select a different city.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>

      {/* Services Section */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Store Services</h2>
            <p className="text-lg text-gray-600">Experience premium shopping with our exclusive in-store services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#8B1A2F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#8B1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Shopping</h3>
              <p className="text-gray-600 text-sm">Get personalized styling advice from our fashion experts</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#8B1A2F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#8B1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Home Delivery</h3>
              <p className="text-gray-600 text-sm">Shop in-store and get your purchases delivered to your doorstep</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#8B1A2F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#8B1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gift Wrapping</h3>
              <p className="text-gray-600 text-sm">Complimentary gift wrapping service for all your purchases</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#8B1A2F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#8B1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Alterations</h3>
              <p className="text-gray-600 text-sm">Professional alteration services for the perfect fit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}