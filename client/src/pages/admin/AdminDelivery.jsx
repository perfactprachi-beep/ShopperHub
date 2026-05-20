import { useEffect, useState } from 'react';
import {
  getDeliveryPincodes, addDeliveryPincode, updateDeliveryPincode, deleteDeliveryPincode,
  getAdminStores, addAdminStore, updateAdminStore, deleteAdminStore,
} from '../../api/adminApi.js';
import { useToastStore } from '../../store/toastStore.js';
import DeleteModal from '../../components/admin/DeleteModal.jsx';

function Toggle({ on, onToggle, title }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={title}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${on ? 'bg-[#8B1A2F]' : 'bg-gray-300'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ── Tab 1: Express Delivery (pincode management) ──────────────────────────────

const EMPTY_PIN = { pincode: '', city: '', is_express: true, delivery_hrs: 24 };

function ExpressDeliveryTab() {
  const [pincodes, setPincodes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form,     setForm]     = useState(EMPTY_PIN);
  const [formErr,  setFormErr]  = useState('');
  const [search,   setSearch]   = useState('');
  const [confirm,  setConfirm]  = useState(null);
  const { addToast } = useToastStore();

  const load = async () => {
    setLoading(true);
    try { setPincodes(await getDeliveryPincodes()); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = pincodes.filter(p =>
    p.pincode.includes(search) || p.city.toLowerCase().includes(search.toLowerCase())
  );
  const cities = [...new Set(filtered.map(p => p.city))].sort();

  async function handleAdd(e) {
    e.preventDefault();
    setFormErr('');
    if (!/^\d{6}$/.test(form.pincode)) { setFormErr('Pincode must be exactly 6 digits'); return; }
    if (!form.city.trim())             { setFormErr('City is required'); return; }
    if (pincodes.some(p => p.pincode === form.pincode)) {
      setFormErr(`Pincode ${form.pincode} already exists. Edit it from the table instead.`);
      return;
    }
    setSaving(true);
    try {
      await addDeliveryPincode({ ...form, city: form.city.trim(), delivery_hrs: Number(form.delivery_hrs) });
      setForm(EMPTY_PIN);
      await load();
      addToast(`Pincode ${form.pincode} added successfully`, 'success');
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Failed to add pincode');
    } finally { setSaving(false); }
  }

  async function handleToggle(pincode, is_express) {
    try {
      await updateDeliveryPincode(pincode, { is_express: !is_express });
      setPincodes(prev => prev.map(p => p.pincode === pincode ? { ...p, is_express: !is_express } : p));
      addToast(`Express delivery ${!is_express ? 'enabled' : 'disabled'} for ${pincode}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  }

  async function handleUpdateHrs(pincode, delivery_hrs) {
    try {
      await updateDeliveryPincode(pincode, { delivery_hrs: Number(delivery_hrs) });
      setPincodes(prev => prev.map(p => p.pincode === pincode ? { ...p, delivery_hrs } : p));
      addToast(`Delivery hours updated for ${pincode}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  }

  function handleDelete(pincode) {
    setConfirm({
      title:       'Delete Pincode',
      description: `Are you sure you want to delete pincode ${pincode}? This will disable express delivery for this area.`,
      onConfirm: async () => {
        setConfirm(null);
        setDeleting(pincode);
        try {
          await deleteDeliveryPincode(pincode);
          setPincodes(prev => prev.filter(p => p.pincode !== pincode));
          addToast(`Pincode ${pincode} deleted`, 'success');
        } finally { setDeleting(null); }
      },
    });
  }

  const expressCount  = pincodes.filter(p => p.is_express).length;
  const disabledCount = pincodes.length - expressCount;

  return (
    <div className="space-y-5">
      <DeleteModal
        open={!!confirm}
        title={confirm?.title}
        description={confirm?.description}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Pincodes" value={pincodes.length} color="text-gray-900" />
        <StatCard label="Express Active"  value={expressCount}    color="text-blue-700" />
        <StatCard label="Disabled"         value={disabledCount}   color="text-red-600"  />
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Add form */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Add Pincode</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pincode *</label>
              <input type="text" maxLength={6} placeholder="e.g. 400001"
                value={form.pincode}
                onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
              <input type="text" placeholder="e.g. Mumbai"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                maxLength={100}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Hours</label>
              <select value={form.delivery_hrs}
                onChange={e => setForm(f => ({ ...f, delivery_hrs: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
              >
                <option value={24}>24 hrs (Express)</option>
                <option value={48}>48 hrs (Delayed)</option>
                <option value={72}>72 hrs</option>
              </select>
            </div>
            <div className="flex items-center gap-2.5">
              <Toggle on={form.is_express} onToggle={() => setForm(f => ({ ...f, is_express: !f.is_express }))} />
              <span className="text-xs text-gray-600">Express delivery enabled</span>
            </div>
            {formErr && <p className="text-xs text-red-600">{formErr}</p>}
            <button type="submit" disabled={saving}
              className="w-full py-2.5 bg-[#8B1A2F] text-white text-sm font-bold rounded-lg hover:bg-[#6d1424] transition-colors disabled:opacity-50"
            >
              {saving ? 'Adding…' : '+ Add Pincode'}
            </button>
          </form>
        </div>

        {/* Pincode table */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <input type="text" placeholder="Search by pincode or city…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pincode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery Hrs</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Express On</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>{[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No pincodes found</td></tr>
                ) : cities.map(city => (
                  <>
                    <tr key={`g-${city}`} className="bg-gray-50/60">
                      <td colSpan={5} className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{city}</td>
                    </tr>
                    {filtered.filter(p => p.city === city).map(p => (
                      <tr key={p.pincode} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-gray-800">{p.pincode}</td>
                        <td className="px-4 py-3 text-gray-600">{p.city}</td>
                        <td className="px-4 py-3 text-center">
                          <select value={p.delivery_hrs} onChange={e => handleUpdateHrs(p.pincode, e.target.value)}
                            className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#8B1A2F]"
                          >
                            <option value={24}>24 hrs</option>
                            <option value={48}>48 hrs</option>
                            <option value={72}>72 hrs</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Toggle on={p.is_express} onToggle={() => handleToggle(p.pincode, p.is_express)}
                            title={p.is_express ? 'Click to disable' : 'Click to enable'} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(p.pincode)} disabled={deleting === p.pincode}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition-colors ml-auto"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            {deleting === p.pincode ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {pincodes.length} pincodes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Store Pickup (store management) ────────────────────────────────────

const EMPTY_STORE = { name: '', city: '', state: '', address: '', pincode: '', phone: '', timing: '10:00 AM – 10:00 PM' };

function StorePickupTab() {
  const [stores,   setStores]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form,     setForm]     = useState(EMPTY_STORE);
  const [formErr,  setFormErr]  = useState('');
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState('');
  const [confirm,  setConfirm]  = useState(null);
  const { addToast } = useToastStore();

  const load = async () => {
    setLoading(true);
    try { setStores(await getAdminStores()); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleAdd(e) {
    e.preventDefault();
    setFormErr('');
    const required = ['name', 'city', 'state', 'address', 'pincode'];
    const missing  = required.find(k => !form[k]?.trim());
    if (missing) { setFormErr(`${missing.charAt(0).toUpperCase() + missing.slice(1)} is required`); return; }
    if (!/^\d{6}$/.test(form.pincode)) { setFormErr('Pincode must be exactly 6 digits'); return; }
    if (form.phone && !/^[+\d][\d\s\-().]{6,14}$/.test(form.phone)) { setFormErr('Enter a valid phone number'); return; }
    setSaving(true);
    try {
      await addAdminStore(form);
      setForm(EMPTY_STORE);
      setShowForm(false);
      await load();
      addToast(`Store "${form.name}" added successfully`, 'success');
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Failed to add store');
    } finally { setSaving(false); }
  }

  async function handleToggleActive(id, is_active) {
    try {
      await updateAdminStore(id, { is_active: !is_active });
      setStores(prev => prev.map(s => s.id === id ? { ...s, is_active: !is_active } : s));
      addToast(`Store ${!is_active ? 'activated' : 'deactivated'}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  }

  function handleDelete(id, name) {
    setConfirm({
      title:       'Delete Store',
      description: `Are you sure you want to delete "${name}"? This store will no longer be available for pickup.`,
      onConfirm: async () => {
        setConfirm(null);
        setDeleting(id);
        try {
          await deleteAdminStore(id);
          setStores(prev => prev.filter(s => s.id !== id));
          addToast(`Store "${name}" deleted`, 'success');
        } finally { setDeleting(null); }
      },
    });
  }

  const activeCount = stores.filter(s => s.is_active).length;

  return (
    <div className="space-y-5">
      <DeleteModal
        open={!!confirm}
        title={confirm?.title}
        description={confirm?.description}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Stores"  value={stores.length} color="text-gray-900" />
        <StatCard label="Active Stores" value={activeCount}   color="text-purple-700" />
        <StatCard label="Inactive"      value={stores.length - activeCount} color="text-red-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <input type="text" placeholder="Search by store name or city…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
          />
          <button onClick={() => { setShowForm(v => !v); setFormErr(''); }}
            className="px-4 py-2 bg-[#8B1A2F] text-white text-xs font-bold rounded-lg hover:bg-[#6d1424] transition-colors whitespace-nowrap"
          >
            {showForm ? 'Cancel' : '+ Add Store'}
          </button>
        </div>

        {/* Add store form */}
        {showForm && (
          <form onSubmit={handleAdd} className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Store</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { key: 'name',    label: 'Store Name *',  placeholder: 'ShoppersHub – Phoenix Mall', maxLen: 200 },
                { key: 'city',    label: 'City *',         placeholder: 'Mumbai',                   maxLen: 100 },
                { key: 'state',   label: 'State *',        placeholder: 'Maharashtra',               maxLen: 100 },
                { key: 'address', label: 'Address *',      placeholder: 'Lower Parel, Mumbai',      maxLen: 300 },
                { key: 'pincode', label: 'Pincode *',      placeholder: '400013',                   maxLen: 6   },
                { key: 'phone',   label: 'Phone',          placeholder: '+91 9999999999',            maxLen: 20  },
              ].map(({ key, label, placeholder, maxLen }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type="text" placeholder={placeholder} value={form[key]}
                    onChange={e => setField(key, e.target.value)}
                    maxLength={maxLen}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
                  />
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Store Timing</label>
              <input type="text" value={form.timing} onChange={e => setField('timing', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
              />
            </div>
            {formErr && <p className="text-xs text-red-600 mb-2">{formErr}</p>}
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#8B1A2F] text-white text-sm font-bold rounded-lg hover:bg-[#6d1424] transition-colors disabled:opacity-50"
            >
              {saving ? 'Adding…' : 'Add Store'}
            </button>
          </form>
        )}

        {/* Stores table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Store</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Timing</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Active</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No stores found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className={`hover:bg-gray-50/40 transition-colors ${!s.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 text-[13px]">{s.name}</p>
                    {s.phone && <p className="text-xs text-gray-400 mt-0.5">{s.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] text-gray-700">{s.city}, {s.state}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.address} — {s.pincode}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.timing}</td>
                  <td className="px-4 py-3 text-center">
                    <Toggle on={s.is_active} onToggle={() => handleToggleActive(s.id, s.is_active)}
                      title={s.is_active ? 'Deactivate store' : 'Activate store'} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(s.id, s.name)} disabled={deleting === s.id}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition-colors ml-auto"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      {deleting === s.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            {filtered.length} of {stores.length} stores
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 3: Standard Delivery (info + pricing rules) ───────────────────────────

function StandardDeliveryTab() {
  const rules = [
    { condition: 'Order subtotal ≥ ₹999', charge: 'FREE', color: 'text-green-700', bg: 'bg-green-50' },
    { condition: 'Order subtotal < ₹999', charge: '₹99',  color: 'text-gray-800',  bg: 'bg-gray-50'  },
  ];

  return (
    <div className="space-y-5">
      {/* Status card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="1"/>
              <path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900">Standard Delivery</h3>
            <p className="text-xs text-gray-500 mt-0.5">Available for all orders — 5–7 business days</p>
          </div>
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">Always Active</span>
        </div>

        <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Shipping Charges</p>
        <div className="space-y-2">
          {rules.map(r => (
            <div key={r.condition} className={`flex items-center justify-between px-4 py-3 rounded-lg ${r.bg}`}>
              <span className="text-sm text-gray-700">{r.condition}</span>
              <span className={`text-sm font-bold ${r.color}`}>{r.charge}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-xs font-semibold text-amber-700 mb-1">Coverage</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Standard delivery is available pan-India — no pincode restrictions.
            Delivered via courier partner to the customer's saved address.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  {
    id:    'express',
    label: 'Express Delivery',
    icon:  (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    color: 'blue',
  },
  {
    id:    'pickup',
    label: 'Store Pickup',
    icon:  (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    color: 'purple',
  },
  {
    id:    'standard',
    label: 'Standard Delivery',
    icon:  (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    color: 'gray',
  },
];

const ACTIVE_COLORS = {
  blue:   'bg-blue-600 text-white',
  purple: 'bg-purple-600 text-white',
  gray:   'bg-gray-700 text-white',
};

export default function AdminDelivery() {
  const [activeTab, setActiveTab] = useState('express');
  const tab = TABS.find(t => t.id === activeTab);

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-2 bg-white border border-gray-100 rounded-xl shadow-sm p-1.5 w-fit">
        {TABS.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive ? ACTIVE_COLORS[t.color] : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'express'  && <ExpressDeliveryTab />}
      {activeTab === 'pickup'   && <StorePickupTab />}
      {activeTab === 'standard' && <StandardDeliveryTab />}
    </div>
  );
}
