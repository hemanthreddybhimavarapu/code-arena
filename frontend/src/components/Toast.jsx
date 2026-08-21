import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Toast = () => {
  const { toasts, t } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-950/80 border-red-500/30 text-red-200'
                : 'bg-green-950/80 border-green-500/30 text-green-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium text-sm leading-snug">{t(toast.message)}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
