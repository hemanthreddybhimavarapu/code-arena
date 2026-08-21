import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, RefreshCw, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction,
  className = '',
}) => {
  const { t } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col items-center justify-center p-10 text-center rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl relative overflow-hidden ${className}`}
    >
      <div className="p-4 bg-gradient-to-tr from-primaryBlue/20 to-indigo-500/10 border border-primaryBlue/30 text-primaryBlue rounded-2xl mb-4 shadow-xl shadow-primaryBlue/10">
        <Icon className="w-10 h-10 animate-pulse" />
      </div>

      <h3 className="text-xl font-extrabold text-white mb-1.5 tracking-tight flex items-center gap-1.5">
        {t(title)}
      </h3>
      <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
        {t(description)}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-gradient-to-r from-primaryBlue to-indigo-600 hover:from-primaryBlue/90 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-primaryBlue/25 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 btn-glow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t(actionLabel)}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
