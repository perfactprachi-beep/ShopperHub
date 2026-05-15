import { useState } from 'react';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra & Nagar Haveli and Daman & Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const LABELS = ['Home', 'Work', 'Other'];

const EMPTY = { label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

export default function AddressForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});

  function change(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => { const n = { ...e }; delete n[name]; return n; });
  }

  function normalizePhone(raw) {
    return raw.trim().replace(/^\+91/, '').replace(/\s/g, '');
  }

  function validate() {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Required';
    if (!/^\d{10}$/.test(normalizePhone(form.phone))) errs.phone = 'Enter valid 10-digit phone (with or without +91)';
    if (!form.line1.trim())  errs.line1  = 'Required';
    if (!form.city.trim())   errs.city   = 'Required';
    if (!form.state)         errs.state  = 'Required';
    if (!/^\d{6}$/.test(form.pincode))   errs.pincode = 'Enter valid 6-digit pincode';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, phone: normalizePhone(form.phone) });
  }

  const field = (name, label, opts = {}) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}{!opts.optional && <span className="text-red-500 ml-0.5">*</span>}</label>
      {opts.type === 'select' ? (
        <select name={name} value={form[name]} onChange={change}
          className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${errors[name] ? 'border-red-400' : 'border-gray-300'}`}>
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : (
        <input name={name} value={form[name]} onChange={change} placeholder={opts.placeholder || ''}
          inputMode={opts.inputMode}
          className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${errors[name] ? 'border-red-400' : 'border-gray-300'}`} />
      )}
      {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Label toggle */}
      <div className="flex gap-2">
        {LABELS.map((l) => (
          <button type="button" key={l}
            onClick={() => setForm((f) => ({ ...f, label: l }))}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${form.label === l ? 'bg-red-700 text-white border-red-700' : 'border-gray-300 text-gray-600 hover:border-red-400'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('full_name', 'Full Name', { placeholder: 'Recipient name' })}
        {field('phone', 'Phone', { placeholder: '10-digit mobile number', inputMode: 'numeric' })}
        {field('line1', 'Address Line 1', { placeholder: 'House / Flat / Block' })}
        {field('line2', 'Address Line 2', { placeholder: 'Street, Landmark (optional)', optional: true })}
        {field('city', 'City', { placeholder: 'City' })}
        {field('state', 'State', { type: 'select' })}
        {field('pincode', 'Pincode', { placeholder: '6-digit pincode', inputMode: 'numeric' })}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-5 py-2 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading}
          className="px-6 py-2 text-sm rounded-md bg-red-700 text-white font-medium hover:bg-red-800 transition-colors disabled:opacity-60">
          {loading ? 'Saving…' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}
