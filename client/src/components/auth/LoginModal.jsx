import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setMobile('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = (e) => {
    e.preventDefault();
    onClose();
    navigate('/login');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[720px] bg-white shadow-2xl overflow-hidden flex"
        style={{ minHeight: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left: Form panel ── */}
        <div className="flex-1 px-10 py-10 flex flex-col justify-center">

          {/* Logo */}
          <h2
            className="text-[22px] font-bold text-gray-900 mb-1 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.04em' }}
          >
            ShoppersHub
          </h2>
          <p className="text-[13px] text-gray-500 mb-8">Log In Or Sign Up</p>

          <form onSubmit={handleContinue} className="space-y-5">
            {/* Mobile Number */}
            <div>
              <p className="text-[13px] text-gray-700 mb-2 font-medium">Mobile Number</p>
              <div className="flex border border-gray-300 focus-within:border-gray-700 transition-colors">
                {/* Country code */}
                <div className="flex items-center justify-center px-3 border-r border-gray-300 bg-white shrink-0">
                  <span className="text-[13px] text-gray-700 font-medium">+91</span>
                </div>
                {/* Input */}
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter your Mobile Number"
                  className="flex-1 px-3 py-3 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none bg-white"
                />
              </div>
            </div>

            {/* Continue button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#1C1C1C] text-white font-semibold text-[13px] tracking-wider hover:bg-black transition-colors"
            >
              Continue
            </button>
          </form>

          {/* Help */}
          <p className="text-[12px] text-gray-500 mt-5 text-center">
            Having trouble logging in?{' '}
            <button
              onClick={() => { onClose(); navigate('/login'); }}
              className="text-[#8B1A2F] font-semibold hover:underline"
            >
              Get Help
            </button>
          </p>

          {/* T&C */}
          <p className="text-[11px] text-gray-400 mt-6 text-center leading-relaxed">
            By continuing, I agree to{' '}
            <span className="text-[#8B1A2F] cursor-pointer hover:underline">Terms &amp; Conditions</span>
            {' '}and{' '}
            <span className="text-[#8B1A2F] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>

        {/* ── Right: Fashion photo panel ── */}
        <div className="hidden md:block w-[42%] shrink-0 relative overflow-hidden bg-[#f5c842]">
          {/* Full-cover fashion image */}
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?fit=crop&w=600&q=85"
            alt="Fashion"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Dot indicators at bottom — same as SS */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
            <span className="w-2 h-2 rounded-full bg-white/50" />
            <span className="w-5 h-2 rounded-full bg-white" />
            <span className="w-2 h-2 rounded-full bg-white/50" />
            <span className="w-2 h-2 rounded-full bg-white/50" />
          </div>
        </div>

        {/* Close ✕ */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors z-20"
          aria-label="Close"
        >
          <IconX />
        </button>
      </div>
    </div>
  );
}
