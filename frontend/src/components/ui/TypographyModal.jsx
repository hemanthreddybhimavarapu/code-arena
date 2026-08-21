import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Sliders, RotateCcw, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TypographyModal = ({ isOpen, onClose }) => {
  const { typography, updateTypography, resetTypography, t } = useApp();

  if (!isOpen) return null;

  const fontOptions = [
    { name: 'Inter', desc: t('Clean, modern UI standard'), sample: 'Aa Bb Cc 123' },
    { name: 'Poppins', desc: t('Geometric & bold readability'), sample: 'Aa Bb Cc 123' },
    { name: 'Manrope', desc: t('Sleek, tech-forward sans'), sample: 'Aa Bb Cc 123' },
    { name: 'Outfit', desc: t('Premium, elegant curves'), sample: 'Aa Bb Cc 123' },
    { name: 'JetBrains Mono', desc: t('Developer code monospace'), sample: 'Aa Bb Cc 123' },
  ];

  const fontSizeOptions = [
    { id: 'compact', label: t('Compact'), size: '14px', desc: t('Dense data density') },
    { id: 'comfortable', label: t('Comfortable'), size: '16px', desc: t('Standard UI scale') },
    { id: 'large', label: t('Large'), size: '18px', desc: t('Enhanced legibility') },
  ];

  const densityOptions = [
    { id: 'compact', label: t('Compact'), desc: t('Tighter margins & paddings') },
    { id: 'comfortable', label: t('Comfortable'), desc: t('Balanced spacing') },
    { id: 'spacious', label: t('Spacious'), desc: t('Generous breathing room') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8 text-gray-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <div className="flex items-center gap-2.5 font-extrabold text-base">
            <Type className="w-5 h-5 text-primaryBlue" />
            <span>{t('Typography & Interface Density')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl border border-primaryBlue/30 bg-primaryBlue/5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-primaryBlue uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> {t('LIVE PREVIEW')}</span>
              <span className="text-[11px] font-mono text-gray-400">{typography.fontStyle} • {typography.fontSize} • {typography.density}</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed">
              {t('Quick brown fox jumps over the lazy dog. CodeArena 7.0 Multi-Lang Engine.')}
            </p>
          </div>

          {/* 1. Font Style */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">{t('FONT FAMILY')}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fontOptions.map((font) => {
                const isSelected = typography.fontStyle === font.name;
                return (
                  <button
                    key={font.name}
                    onClick={() => updateTypography({ fontStyle: font.name })}
                    className={`flex items-start justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-primaryBlue bg-primaryBlue/10 shadow-md ring-1 ring-primaryBlue'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        <span style={{ fontFamily: font.name }}>{font.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{font.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primaryBlue shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Font Size */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">{t('FONT SIZE')}</div>
            <div className="grid grid-cols-3 gap-2.5">
              {fontSizeOptions.map((opt) => {
                const isSelected = typography.fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateTypography({ fontSize: opt.id })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-primaryBlue bg-primaryBlue/10 shadow-md ring-1 ring-primaryBlue'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{opt.size}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Interface Density */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">{t('INTERFACE DENSITY')}</div>
            <div className="grid grid-cols-3 gap-2.5">
              {densityOptions.map((opt) => {
                const isSelected = typography.density === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateTypography({ density: opt.id })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-primaryBlue bg-primaryBlue/10 shadow-md ring-1 ring-primaryBlue'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <button
            onClick={resetTypography}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('Reset to Default')}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-primaryBlue hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
          >
            {t('Apply & Close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TypographyModal;
