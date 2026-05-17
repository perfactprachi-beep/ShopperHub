import { useState, useEffect, useRef } from 'react';
import { authApi } from '../../api/authApi.js';
import { useAuthStore } from '../../store/authStore.js';

const FASHION_IMAGES = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=85&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&q=85&fit=crop',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=700&q=85&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&q=85&fit=crop',
];

// ── "Looks like you're new here" registration popup ──────────────────────────
function NewUserPopup({ phone, onBack, onClose, onSuccess }) {
  const login = useAuthStore(s => s.login);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = firstName.trim() && email.trim() && gender;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.registerMobile({
        phone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        gender,
      });
      login(data.user, data.accessToken);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      <div
        className="relative bg-white w-full max-w-[520px] shadow-2xl rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-[17px] font-semibold text-gray-900 flex-1">Looks like you&apos;re new here</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          {/* Name row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Enter your First Name"
                autoFocus
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm outline-none focus:border-gray-500 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Middle &amp; Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Enter your Last Name"
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm outline-none focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Email ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your Email ID"
              className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm outline-none focus:border-gray-500 transition-colors"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              {['Male', 'Female', 'Others'].map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    className="w-4 h-4 accent-gray-700"
                  />
                  <span className="text-sm text-gray-700">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full mt-2 py-3 bg-[#1a1f36] text-white rounded text-sm font-semibold hover:bg-[#8B1A2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── OTP popup ─────────────────────────────────────────────────────────────────
function OtpPopup({ phone, onBack, onClose, onSuccess, onNewUser, devOtp }) {
  const login = useAuthStore(s => s.login);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const otpValue = otp.join('');

  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setError('');
    if (digit && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otpValue.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phone, otpValue);
      if (data.exists) {
        // Existing user — login directly
        login(data.user, data.accessToken);
        onSuccess?.();
        onClose();
      } else {
        // New user — show registration popup
        onNewUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const [localDevOtp, setLocalDevOtp] = useState(devOtp);

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const { data } = await authApi.checkMobile(phone);
      if (data.devOtp) setLocalDevOtp(data.devOtp);
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const displayPhone = phone.startsWith('+91') ? phone.slice(3) : phone;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      <div
        className="relative bg-white w-full max-w-[400px] shadow-2xl rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
          <button type="button" onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-[16px] font-semibold text-gray-900">Verify OTP</h2>
            <p className="text-[12px] text-gray-500">Sent to +91 {displayPhone}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleVerify} className="px-6 py-6">
          <p className="text-[13px] text-gray-500 mb-4">
            Enter the 6-digit OTP sent to your mobile number.
          </p>

          {localDevOtp && (
            <div className="mb-4 px-3 py-2.5 rounded bg-amber-50 border border-amber-200 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="text-[12px] text-amber-700 font-medium">Dev mode — OTP: <span className="font-bold tracking-widest">{localDevOtp}</span></span>
            </div>
          )}

          {error && (
            <div className="mb-4 px-3 py-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          {/* 6 OTP digit boxes */}
          <div className="flex gap-2.5 mb-5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputsRef.current[idx] = el; }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                autoFocus={idx === 0}
                className="w-10 h-12 text-center text-lg font-bold border border-gray-300 rounded outline-none focus:border-gray-700 transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={otpValue.length < 6 || loading}
            className="w-full py-3 bg-[#1a1f36] text-white rounded text-sm font-semibold hover:bg-[#8B1A2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying…' : 'Submit'}
          </button>

          <div className="mt-4 text-center text-sm text-gray-500">
            {timer > 0 ? (
              <span>Resend OTP in <span className="font-semibold text-gray-700">{timer}s</span></span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-[#8B1A2F] font-medium hover:underline disabled:opacity-60"
              >
                {resending ? 'Sending…' : 'Resend OTP'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main LoginModal ───────────────────────────────────────────────────────────
export default function LoginModal({ onClose, onSuccess }) {
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp' | 'register'
  const [phone, setPhone] = useState('');
  const [devOtp, setDevOtp] = useState('');
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const formattedPhone = `+91${phone.replace(/\D/g, '')}`;

  const handleContinue = async (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.checkMobile(formattedPhone);
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'register') {
    return (
      <NewUserPopup
        phone={formattedPhone}
        onBack={() => setStep('otp')}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  if (step === 'otp') {
    return (
      <OtpPopup
        phone={formattedPhone}
        onBack={() => { setStep('mobile'); setDevOtp(''); }}
        onClose={onClose}
        onSuccess={onSuccess}
        onNewUser={() => setStep('register')}
        devOtp={devOtp}
      />
    );
  }

  // step === 'mobile'
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
                disabled={loading}
                className="w-full mt-5 py-3.5 bg-[#1a1f36] text-white rounded text-sm font-semibold hover:bg-[#8B1A2F] transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending OTP…' : 'Continue'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              New or existing — just enter your mobile number
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
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
