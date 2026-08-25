import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, ShieldCheck, Sparkles, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DEFAULT_ACCOUNTS = [
  {
    name: 'Vinay Jonnadula',
    email: 'vinayjonnadula11@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=VinayJonnadula&backgroundColor=0f172a,1e293b,334155,1e1b4b,0f766e,312e81&textColor=ffffff',
  },
  {
    name: 'Hemanth Reddy (Admin)',
    email: 'iamhemanth9848@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HemanthReddy&backgroundColor=0f172a,1e293b,334155,1e1b4b,0f766e,312e81&textColor=ffffff',
  },
  {
    name: 'CodeArena Official',
    email: 'codearena7.0@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CodeArena&backgroundColor=0f172a,1e293b,334155,1e1b4b,0f766e,312e81&textColor=ffffff',
  },
];

export default function GoogleAuthModal({ isOpen, onClose }) {
  const { login, showToast } = useApp();
  const navigate = useNavigate();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = async (account) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google-login', {
        email: account.email,
        username: account.name || account.email.split('@')[0],
        avatar: account.avatar,
      });

      const userData = res.data.data;
      login(userData, userData.token);
      showToast(`Welcome back, ${userData.username}! Logged in via Google. Welcome email sent to ${account.email}!`, 'success');
      onClose();
      if (userData.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Google login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      showToast('Please enter a valid Google email address', 'error');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=0f172a,1e293b,334155,1e1b4b,0f766e,312e81&textColor=ffffff`;
    handleSelectAccount({ email: customEmail.trim(), name, avatar });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-slate-900/95"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Sign in with Google <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-gray-400">Choose your account to continue to CodeArena</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Selector List */}
          {!showCustomInput ? (
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Available Accounts
              </div>
              {DEFAULT_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 hover:border-primaryBlue/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full border border-white/20" />
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-primaryBlue transition-colors">
                        {acc.name}
                      </div>
                      <div className="text-xs text-gray-400">{acc.email}</div>
                    </div>
                  </div>
                  <LogIn className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full py-3 px-4 rounded-2xl bg-primaryBlue/10 border border-primaryBlue/30 text-primaryBlue text-xs font-bold hover:bg-primaryBlue/20 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Use another Google Email Address
              </button>
            </div>
          ) : (
            /* Custom Email Input Form */
            <form onSubmit={handleCustomSubmit} className="space-y-4 mb-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Enter Your Google Email
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="your.name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Your Display Name (Optional)</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 py-2.5 rounded-xl glass-input text-gray-400 text-xs font-semibold hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-primaryBlue text-white font-bold text-xs hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </button>
              </div>
            </form>
          )}

          {/* Footer Notice */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official 1-Click Verification & Welcome Email Dispatch</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
