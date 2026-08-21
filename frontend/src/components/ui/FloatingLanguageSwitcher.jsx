import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const FloatingLanguageSwitcher = () => {
  const { uiLanguage, changeUiLanguage, t } = useApp();
  const [open, setOpen] = useState(false);

  const languages = [
    { id: 'en', label: 'English', native: 'English' },
    { id: 'hi', label: 'Hindi', native: 'हिंदी' },
    { id: 'te', label: 'Telugu', native: 'తెలుగు' },
    { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
  ];

  const currentLang = languages.find((l) => l.id.toLowerCase() === (uiLanguage || 'en').toLowerCase()) || languages[0];

  return (
    <div className="fixed bottom-6 left-6 z-[9999] font-sans">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="mb-3 w-60 rounded-2xl border border-emerald-400/50 bg-slate-950/95 backdrop-blur-2xl p-3 shadow-2xl text-white ring-4 ring-emerald-500/20"
          >
            <div className="px-3 py-1.5 text-[11px] font-black text-emerald-400 uppercase tracking-wider border-b border-white/10 flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                {t('Select UI Language')}
              </span>
            </div>

            <div className="space-y-1.5">
              {languages.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    changeUiLanguage(l.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all ${(uiLanguage || '').toLowerCase() === l.id
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/60 shadow-lg shadow-emerald-500/20 font-extrabold'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-extrabold text-sm">{l.native}</span>
                    <span className="text-[10px] text-gray-400 font-normal">({l.label})</span>
                  </div>
                  {(uiLanguage || '').toLowerCase() === l.id && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 border-emerald-400 bg-emerald-950/90 text-emerald-200 hover:bg-emerald-900 shadow-2xl backdrop-blur-2xl font-black text-xs transition-all ring-4 ring-emerald-500/30 hover:ring-emerald-400/60"
      >
        <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="tracking-wide flex items-center gap-1">
          <span>Language:</span>
          <strong className="text-white underline decoration-emerald-400 underline-offset-2 text-sm font-extrabold">{currentLang.native}</strong>
        </span>
        <ChevronUp className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </motion.button>
    </div>
  );
};

export default FloatingLanguageSwitcher;
