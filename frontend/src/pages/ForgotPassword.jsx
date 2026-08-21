import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

const ForgotPassword = () => {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please specify your email address', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showToast('Password reset code sent to email!', 'success');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      showToast(err.message || 'Failed to request reset', 'error');
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
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mb-3">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <p className="text-gray-400 text-sm mt-1 text-center">
            Specify your registered email and we will send you a code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 font-sans">Email Address</label>
            <input
              type="email"
              placeholder="name@domain.com"
              className="w-full glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primaryBlue hover:bg-blue-600 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-colors mt-6 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Sending Code...' : 'Request Reset OTP'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
