import { useState } from 'react';
import { PincodeChecker } from './PincodeChecker';
import { StorePicker }    from './StorePicker';

const METHODS = [
  {
    value: 'express_delivery',
    title: 'Express Delivery',
    desc:  'Delivered to your address within 24 hrs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    value: 'store_pickup',
    title: 'Express Store Pickup',
    desc:  'Pick up from your nearest store in 24–48 hrs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

export function DeliveryMethodStep({ onNext }) {
  const [method,        setMethod]      = useState('express_delivery');
  const [pincode,       setPincode]     = useState('');
  const [pincodeOk,     setPincodeOk]   = useState(false);
  const [selectedStore, setStore]       = useState(null);
  const [storePin,      setStorePin]    = useState('');

  const canContinue =
    (method === 'express_delivery' && pincodeOk) ||
    (method === 'store_pickup'     && !!selectedStore);

  return (
    <div>
      <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5">
        Choose Delivery Method
      </h2>

      {/* Method cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {METHODS.map(opt => (
          <div
            key={opt.value}
            onClick={() => { setMethod(opt.value); setPincodeOk(false); setStore(null); }}
            className={`relative border p-4 cursor-pointer transition-all ${
              method === opt.value ? 'border-gray-900 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
              method === opt.value ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-400'
            }`}>
              {opt.icon}
            </div>
            <p className={`text-[13px] font-semibold mb-1 ${
              method === opt.value ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {opt.title}
            </p>
            <p className="text-[11px] text-gray-400">{opt.desc}</p>
            <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-1.5 py-0.5 bg-green-50 text-green-700">
              FREE
            </span>
            <div className={`absolute bottom-2.5 right-2.5 w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center ${
              method === opt.value ? 'border-gray-900' : 'border-gray-300'
            }`}>
              {method === opt.value && <div className="w-[7px] h-[7px] rounded-full bg-gray-900" />}
            </div>
          </div>
        ))}
      </div>

      {/* Express Delivery — pincode check */}
      {method === 'express_delivery' && (
        <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
          <p className="text-[13px] font-semibold text-gray-800 mb-0.5">Check delivery availability</p>
          <p className="text-[11px] text-gray-400 mb-1">Enter your delivery pincode to confirm express delivery is available</p>
          <PincodeChecker
            onResult={result => {
              setPincodeOk(result.available);
              if (result.available) setPincode(result.pincode || '');
            }}
          />
        </div>
      )}

      {/* Store Pickup — store finder */}
      {method === 'store_pickup' && (
        <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
          <p className="text-[13px] font-semibold text-gray-800 mb-1">Find stores near you</p>
          <input
            type="text"
            maxLength={6}
            placeholder="Enter pincode to find stores"
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '');
              if (v.length === 6) setStorePin(v);
              else setStorePin('');
              setStore(null);
            }}
            className="w-full border border-gray-300 px-3 py-2 text-[13px] focus:outline-none focus:border-gray-800"
          />
          {storePin && (
            <StorePicker pincode={storePin} onSelect={store => setStore(store)} />
          )}
        </div>
      )}

      {/* Store pickup info */}
      {method === 'store_pickup' && (
        <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
          Bring a valid photo ID when collecting. Order held for 7 days. Only prepaid orders eligible.
        </p>
      )}

      <button
        onClick={() => onNext({ deliveryMethod: method, pincode, store: selectedStore })}
        disabled={!canContinue}
        className={`w-full py-3.5 font-bold text-[13px] uppercase tracking-wider transition-colors ${
          canContinue
            ? 'bg-[#8B1A2F] text-white hover:bg-[#6d1424] cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue →
      </button>
    </div>
  );
}
