import { useState, useEffect } from 'react';
import { getProfile, updateProfile, getFirstCitizen, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api/accountApi.js';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import Spinner from '../components/ui/Spinner.jsx';
import Modal from '../components/ui/Modal.jsx';
import AddressForm from '../components/address/AddressForm.jsx';

const TABS = ['Profile', 'Addresses', 'First Citizen'];

/* ── Profile Tab ─────────────────────────────────────────────────── */
function ProfileTab() {
  const setToken    = useAuthStore((s) => s.setToken);
  const storeLogin  = useAuthStore((s) => s.login);
  const storeUser   = useAuthStore((s) => s.user);
  const addToast    = useToastStore((s) => s.addToast);

  const [form, setForm]     = useState({ full_name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getProfile().then(({ data }) => {
      if (data.success) setForm({ full_name: data.data.full_name ?? '', phone: data.data.phone ?? '' });
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile(form);
      if (data.success) {
        storeLogin(data.data, useAuthStore.getState().accessToken);
        addToast({ type: 'success', message: 'Profile updated' });
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to update profile' });
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <form onSubmit={handleSave} className="max-w-md flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Email</label>
        <input
          readOnly
          value={storeUser?.email ?? ''}
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-bg)] text-[var(--color-muted)] cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Full Name</label>
        <input
          value={form.full_name}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)]"
          placeholder="Your full name"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Phone</label>
        <input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)]"
          placeholder="10-digit mobile number"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="self-start px-6 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-[var(--radius-sm)] hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

/* ── Addresses Tab ───────────────────────────────────────────────── */
function AddressesTab() {
  const addToast = useToastStore((s) => s.addToast);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);

  const load = () =>
    getAddresses()
      .then(({ data }) => { if (data.success) setAddresses(data.data); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  async function handleSubmit(vals) {
    try {
      if (editing) {
        await updateAddress(editing.id, vals);
        addToast({ type: 'success', message: 'Address updated' });
      } else {
        await addAddress(vals);
        addToast({ type: 'success', message: 'Address added' });
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch {
      addToast({ type: 'error', message: 'Failed to save address' });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      addToast({ type: 'success', message: 'Address deleted' });
      load();
    } catch {
      addToast({ type: 'error', message: 'Failed to delete address' });
    }
  }

  async function handleDefault(id) {
    try {
      await setDefaultAddress(id);
      load();
    } catch {
      addToast({ type: 'error', message: 'Failed to set default' });
    }
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <>
      <div className="flex flex-col gap-3 mb-4">
        {addresses.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No saved addresses.</p>
        )}
        {addresses.map((addr) => (
          <div key={addr.id} className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {addr.label && (
                  <span className="text-[10px] border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[var(--color-muted)] capitalize">{addr.label}</span>
                )}
                {addr.is_default && (
                  <span className="text-[10px] bg-[var(--color-primary)] text-white rounded px-1.5 py-0.5">Default</span>
                )}
              </div>
              <p className="text-sm font-medium text-[var(--color-text)]">{addr.full_name}</p>
              <p className="text-sm text-[var(--color-muted)]">
                {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
              </p>
              {addr.phone && <p className="text-xs text-[var(--color-muted)] mt-0.5">{addr.phone}</p>}
            </div>
            <div className="flex flex-col gap-1.5 shrink-0 text-right">
              <button
                onClick={() => { setEditing(addr); setModalOpen(true); }}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >Edit</button>
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-xs text-[var(--color-error)] hover:underline"
              >Delete</button>
              {!addr.is_default && (
                <button
                  onClick={() => handleDefault(addr.id)}
                  className="text-xs text-[var(--color-muted)] hover:underline"
                >Set Default</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setEditing(null); setModalOpen(true); }}
        className="px-5 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium rounded-[var(--radius-sm)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
      >
        + Add Address
      </button>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Address' : 'Add Address'}>
        <AddressForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>
    </>
  );
}

/* ── First Citizen Tab ───────────────────────────────────────────── */
function FirstCitizenTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFirstCitizen()
      .then(({ data: res }) => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="max-w-lg">
      {/* Gold card */}
      <div className="rounded-[var(--radius-md)] p-6 mb-6 text-white"
        style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)' }}>
        <p className="text-xs uppercase tracking-widest opacity-80 mb-1">First Citizen Points</p>
        <p className="text-4xl font-bold">{(data?.points ?? 0).toLocaleString('en-IN')}</p>
        <p className="text-xs mt-2 opacity-70">1 point = ₹1 value on your next order</p>
      </div>

      {/* Earn history */}
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Earn History</h3>
      {data?.history?.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No points earned yet.</p>
      ) : (
        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg)]">
              <tr>
                <th className="text-left px-4 py-2 text-xs text-[var(--color-muted)] font-medium">Order</th>
                <th className="text-right px-4 py-2 text-xs text-[var(--color-muted)] font-medium">Points</th>
                <th className="text-right px-4 py-2 text-xs text-[var(--color-muted)] font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((row) => (
                <tr key={row.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-2 text-[var(--color-text)]">ORD-{row.id}</td>
                  <td className="px-4 py-2 text-right text-amber-600 font-semibold">+{row.points}</td>
                  <td className="px-4 py-2 text-right text-[var(--color-muted)]">
                    {new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Redeem info */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-sm)] text-xs text-amber-800">
        Points are automatically applied at checkout (up to 10% of order value).
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function AccountPage() {
  const [tab, setTab] = useState(0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        My Account
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)] mb-6">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === i
                ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <ProfileTab />}
      {tab === 1 && <AddressesTab />}
      {tab === 2 && <FirstCitizenTab />}
    </div>
  );
}
