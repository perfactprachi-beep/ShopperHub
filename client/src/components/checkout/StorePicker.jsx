import { useState, useEffect } from 'react';
import { getStoresNear, checkStoreAvail } from '../../api/storesApi';
import { useCartStore } from '../../store/cartStore';

export function StorePicker({ pincode, onSelect }) {
  const [stores,   setStores]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [avail,    setAvail]    = useState({});
  const [loading,  setLoading]  = useState(false);
  const cartItems = useCartStore(s => s.items);

  useEffect(() => {
    if (!pincode) return;
    setLoading(true);
    setStores([]);
    setSelected(null);
    setAvail({});
    getStoresNear(pincode)
      .then(res => setStores(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pincode]);

  const handleSelectStore = async (store) => {
    setSelected(store.id);
    const variantIds = cartItems.map(i => i.variantId).filter(Boolean);
    if (!variantIds.length) { onSelect(store); return; }
    try {
      const res = await checkStoreAvail(store.id, variantIds);
      setAvail(prev => ({ ...prev, [store.id]: res.data.data }));
      onSelect({ ...store, availability: res.data.data });
    } catch {
      onSelect(store);
    }
  };

  if (loading) {
    return <p className="text-[13px] text-gray-400 mt-3">Finding stores near you…</p>;
  }
  if (!stores.length) {
    return <p className="text-[13px] text-gray-400 mt-3">No stores found near this pincode.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5 mt-3">
      {stores.map(store => {
        const storeAvail = avail[store.id];
        const isSelected = selected === store.id;
        return (
          <div
            key={store.id}
            onClick={() => handleSelectStore(store)}
            className={`border p-3.5 cursor-pointer transition-all ${
              isSelected ? 'border-gray-900 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-800">{store.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{store.address}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{store.timing}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-gray-900' : 'border-gray-400'
                }`}>
                  {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-gray-900" />}
                </div>
                {isSelected && storeAvail && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 ${
                    storeAvail.allAvailable
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {storeAvail.allAvailable ? 'All in stock' : 'Partial stock'}
                  </span>
                )}
              </div>
            </div>

            {isSelected && storeAvail && !storeAvail.allAvailable && (
              <p className="mt-2 text-[11px] text-red-600 bg-red-50 px-2.5 py-1.5">
                Some items unavailable — they will move to your wishlist
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
