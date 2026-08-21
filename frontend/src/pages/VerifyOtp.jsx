import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

const VerifyOtp = () => {
  const { showToast, t } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      showToast(t('Please specify email and code'), 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      showToast(t('Account verified successfully! Please log in.'), 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message || t('OTP verification failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] w-full flex items-center justify-center bg-darkBg text-white px-6 overflow-hidden">
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primaryBlue/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">{t('Verify Account')}</h2>
          <p className="text-gray-400 text-sm mt-1 text-center">
            {t('Enter the 6-digit OTP verification code sent to')} <strong className="text-gray-200">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 font-sans">{t('profile_email')}</label>
            <input
              type="email"
              placeholder="name@domain.com"
              className="w-full glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 font-sans">{t('Verification Code')} (6 {t('Digits')})</label>
            <input
              type="text"
              placeholder="123456"
              className="w-full glass-input text-center tracking-[10px] text-lg font-bold"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primaryBlue hover:bg-blue-600 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-colors mt-6 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? t('btn_loading') : t('Verify OTP')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
