import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { useAuthStore } from '../../store/authStore.js';

const FASHION_IMAGES = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=85&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&q=85&fit=crop',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=700&q=85&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&q=85&fit=crop',
];

export default function LoginModal({ onClose, onSuccess }) {
  const login = useAuthStore(s => s.login);
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setImgIdx(i => (i + 1) % FASHION_IMAGES.length);
        setVisible(true);
      }, 600);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleContinue = (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login({ phone: `+91${phone.replace(/\D/g, '')}`, password });
      login(data.user, data.accessToken);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55" />

      <div
        className="relative bg-white rounded-2xl w-full max-w-[800px] shadow-2xl overflow-hidden flex"
        style={{ minHeight: 480 }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left: Form ── */}
        <div className="flex-1 px-10 py-10 flex flex-col justify-between min-w-0">
          <div>
            <h1
              className="text-[30px] font-bold text-gray-900 mb-1"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontVariant: 'small-caps', letterSpacing: '0.08em' }}
            >
              ShoppersHub
            </h1>
            <p className="text-[15px] text-gray-700 mb-8">Log In Or Sign Up</p>

            {error && (
              <div className="mb-4 px-3 py-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            {step === 1 ? (
              <form onSubmit={handleContinue}>
                <label className="block text-sm text-gray-600 mb-2">Mobile Number</label>
                <div className="flex border border-gray-300 rounded focus-within:border-gray-600 transition-colors">
                  <span className="flex items-center px-4 text-sm text-gray-700 border-r border-gray-300 select-none font-medium bg-white">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                    placeholder="Enter your Mobile Number"
                    autoFocus
                    className="flex-1 px-4 py-3.5 text-sm outline-none bg-white rounded-r"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-5 py-3.5 bg-[#1a1f36] text-white rounded text-sm font-semibold hover:bg-[#8B1A2F] transition-colors"
                >
                  Continue
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  +91 {phone}
                </button>
                <label className="block text-sm text-gray-600 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your Password"
                  autoFocus
                  required
                  className="w-full px-4 py-3.5 border border-gray-300 rounded text-sm outline-none focus:border-gray-600 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-5 py-3.5 bg-[#1a1f36] text-white rounded text-sm font-semibold hover:bg-[#8B1A2F] transition-colors disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Continue'}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              Having trouble logging in?{' '}
              <Link to="/register" onClick={onClose} className="text-[#8B1A2F] font-medium hover:underline">
                Get Help
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
            By continuing, I agree to{' '}
            <span className="text-blue-500 cursor-pointer hover:underline">Terms &amp; Conditions</span>
            {' '}and{' '}
            <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>

        {/* ── Right: Animated Image ── */}
        <div className="relative w-[340px] flex-shrink-0 overflow-hidden hidden sm:block">
          <img
            key={imgIdx}
            src={FASHION_IMAGES[imgIdx]}
            alt="fashion"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(1.04)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {FASHION_IMAGES.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === imgIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-gray-200 text-gray-600 hover:bg-white shadow-sm transition-colors z-20"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
