import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Code, LayoutDashboard, Trophy, User, Shield, 
  Sun, Moon, Sparkles, Send, BookOpen, Layers, X, Command, ChevronRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isAdminUser } from '../../utils/admin';

export const CommandPalette = ({ isOpen, setIsOpen }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user, theme, toggleTheme, t } = useApp();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    {
      id: 'problems',
      title: t('Practice Problems'),
      description: t('Explore multi-language coding challenges'),
      icon: Code,
      category: t('nav_problems'),
      action: () => navigate('/problems'),
    },
    {
      id: 'dashboard',
      title: t('Developer Dashboard'),
      description: t('View your coding metrics, streak & activity calendar'),
      icon: LayoutDashboard,
      category: t('nav_dashboard'),
      action: () => navigate('/dashboard'),
    },
    {
      id: 'leaderboard',
      title: t('Global Leaderboard'),
      description: t('Check global developer ranks & achievements'),
      icon: Trophy,
      category: t('nav_leaderboard'),
      action: () => navigate('/leaderboard'),
    },
    ...(isAdminUser(user) ? [{
      id: 'admin',
      title: t('Admin Control Center'),
      description: t('Manage problems, users & platform analytics'),
      icon: Shield,
      category: t('nav_admin'),
      action: () => navigate('/admin'),
    }] : []),
    {
      id: 'theme',
      title: t(`Switch Theme (Current: ${theme})`),
      description: t('Toggle light & dark themes'),
      icon: theme === 'dark' ? Sun : Moon,
      category: t('nav_theme'),
      action: () => toggleTheme(),
    },
    {
      id: 'contact',
      title: t('footer_contact_btn'),
      description: t('Send a message directly to the engineering team'),
      icon: Send,
      category: t('footer_support'),
      action: () => {
        const contactBtn = document.getElementById('contact-footer-btn');
        if (contactBtn) {
          contactBtn.click();
        } else {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 dark:border-white/15 bg-gray-900/95 dark:bg-gray-950/95 text-white shadow-2xl backdrop-blur-xl z-10"
          >
            {/* Top Search Input */}
            <div className="flex items-center border-b border-white/10 px-4 py-3.5">
              <Search className="h-5 w-5 text-primaryBlue mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={t('cmd_palette_placeholder')}
                className="w-full bg-transparent text-sm font-medium text-white placeholder-gray-400 focus:outline-none"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 text-[10px] font-semibold text-gray-400 bg-white/5 border border-white/10 rounded-md">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                  No matching actions or pages found for "<span className="text-white font-medium">{query}</span>"
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-gradient-to-r from-primaryBlue/20 via-primaryBlue/10 to-transparent border border-primaryBlue/30 text-white pl-4'
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primaryBlue text-white shadow-md shadow-primaryBlue/30' : 'bg-white/5 text-gray-400'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'translate-x-0.5 text-primaryBlue' : 'text-gray-600'}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-black/20 text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded font-mono text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded font-mono text-[10px]">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded font-mono text-[10px]">↵</kbd>
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 font-medium">
                <Command className="h-3 w-3 text-primaryBlue" /> CodeArena 7.0 Palette
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
