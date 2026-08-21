import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Home, LayoutDashboard, Trophy, AlertTriangle, ArrowLeft } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <PageTransition className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full text-center space-y-6">
        {/* Animated Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl"
        >
          <AlertTriangle className="h-12 w-12 animate-pulse" />
        </motion.div>

        <div>
          <h1 className="text-6xl font-black tracking-tight text-white mb-2">
            4<span className="text-primaryBlue">0</span>4
          </h1>
          <h2 className="text-xl font-bold text-gray-200">
            Page Not Found in CodeArena
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
            The page or problem route you requested does not exist or has been moved. Let's get you back to writing code!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primaryBlue to-indigo-600 hover:from-primaryBlue/90 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-primaryBlue/25 transition-all transform hover:scale-105 active:scale-95"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </button>

          <button
            onClick={() => navigate('/problems')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all"
          >
            <Code className="h-4 w-4 text-emerald-400" />
            Explore Problems
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all"
          >
            <LayoutDashboard className="h-4 w-4 text-purple-400" />
            Dashboard
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
