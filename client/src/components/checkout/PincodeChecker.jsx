import { useState } from 'react';
import { checkPincode } from '../../api/storesApi';

export function PincodeChecker({ onResult }) {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const check = async () => {
    if (!/^\d{6}$/.test(pincode)) return;
    setLoading(true);
    try {
      const res = await checkPincode(pincode);
      const data = { ...res.data.data, pincode };
      setResult(data);
      onResult?.(data);
    } catch {
      const data = { available: false, reason: 'Unable to check pincode' };
      setResult(data);
      onResult?.(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter pincode"
          value={pincode}
          onChange={e => { setPincode(e.target.value.replace(/\D/g, '')); setResult(null); }}
          className="flex-1 border border-gray-300 px-3 py-2 text-[13px] focus:outline-none focus:border-gray-800"
        />
        <button
          onClick={check}
          disabled={loading || pincode.length !== 6}
          className="px-4 py-2 bg-[#8B1A2F] text-white text-[12px] font-bold uppercase tracking-wider disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#6d1424] transition-colors"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>

      {result && (
        <div className={`mt-2 px-3 py-2 text-[12px] ${
          result.available
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {result.available
            ? `Express Delivery available in ${result.city} — estimated ${result.delivery_hrs} hrs`
            : result.reason}
        </div>
      )}
    </div>
  );
}
