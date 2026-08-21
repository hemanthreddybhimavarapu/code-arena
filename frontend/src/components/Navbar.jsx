import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, LogOut, ShieldAlert, Award, Code2, User, Camera, KeyRound, Flame, Palette, Check, Search, Command, Type, Menu, X, BookOpen, BarChart3, LayoutDashboard, Globe, Server } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import GooeyNav from './ui/GooeyNav';
import NotificationCenter from './ui/NotificationCenter';
import CommandPalette from './ui/CommandPalette';
import ProfileModal from './ui/ProfileModal';
import TypographyModal from './ui/TypographyModal';
import { BackendConfigModal } from './ui/BackendConfigModal';
import { isAdminUser } from '../utils/admin';

const Navbar = () => {
  const { user, token, theme, toggleTheme, changeTheme, logout, showToast, updateAvatar, getAvatarUrl, uiLanguage, changeUiLanguage, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [typographyOpen, setTypographyOpen] = useState(false);
  const [backendModalOpen, setBackendModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [newAvatar, setNewAvatar] = useState('');
  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const dropdownHoverTimeout = useRef(null);
  const isAdmin = isAdminUser(user);

  useEffect(() => {
    if (user && token) {
      // Fetch streak info if user is logged in
      api.get('/dashboard')
        .then(res => {
          if (res.data?.data?.currentStreak !== undefined) {
            setUserStreak(res.data.data.currentStreak);
          }
        })
        .catch(() => {});
    }
  }, [user, token]);

  useEffect(() => {
    if (modalOpen && user) {
      setName(user.name || '');
      setNewAvatar(user.avatar || '');
    }
  }, [modalOpen, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMouseEnterUser = () => {
    if (window.innerWidth >= 768) {
      if (dropdownHoverTimeout.current) clearTimeout(dropdownHoverTimeout.current);
      setDropdownOpen(true);
    }
  };

  const handleMouseLeaveUser = () => {
    if (window.innerWidth >= 768) {
      dropdownHoverTimeout.current = setTimeout(() => {
        setDropdownOpen(false);
      }, 200);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', {
        name: name || undefined,
        avatar: newAvatar || undefined,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined
      });
      updateAvatar(newAvatar, name);
      showToast('Profile updated successfully!', 'success');
      setModalOpen(false);
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const isActive = (path) => location.pathname === path;
  const isPublicAuthPage = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isAuthenticated = Boolean(token && token !== 'null' && token !== 'undefined' && user && user.id) && !isPublicAuthPage;

  const themesList = [
    { id: 'dark', name: 'Dark Mode', color: '#0F172A' },
    { id: 'light', name: 'Light Mode', color: '#F8FAFC' },
    { id: 'sapphire', name: 'Sapphire Midnight', color: '#0B132B' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', color: '#051923' },
    { id: 'amethyst', name: 'Royale Amethyst', color: '#0F0C1B' },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between"
      >
        <Link to="/" className="flex items-center gap-2 font-black text-xl text-white shrink-0">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-1.5 sm:p-2 bg-gradient-to-br from-primaryBlue to-purple-600 rounded-lg text-white"
          >
            <Code2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
          <span className="font-extrabold text-lg sm:text-2xl tracking-wide text-slate-900 dark:text-white flex items-center">
            <span className="text-slate-900 dark:text-white">Code</span>
            <span className="text-yellowAccent ml-0.5">Arena</span>
          </span>
        </Link>

        {/* Links with Gooey / Sliding Pill Indicator - Logged-in Users Only */}
        {isAuthenticated && (
          <GooeyNav 
            links={
              isAdmin
                ? [
                    { path: '/admin', label: t('Admin') },
                    { path: '/leaderboard', label: t('Leaderboard') },
                  ]
                : [
                    { path: '/problems', label: t('Problems') },
                    { path: '/leaderboard', label: t('Leaderboard') },
                    { path: '/dashboard', label: t('Dashboard') },
                  ]
            }
            className="hidden md:flex"
          />
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Search & Notifications - Logged-in Users Only */}
          {isAuthenticated && (
            <>
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
                title="Open Command Palette (Ctrl + K)"
              >
                <Search className="w-3.5 h-3.5 text-primaryBlue" />
                <span>{t('Search')}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 border border-white/10 rounded font-mono text-gray-300">
                  ⌘K
                </kbd>
              </button>

              <NotificationCenter />
            </>
          )}

          {/* User Streak Badge outside Dashboard */}
          {isAuthenticated && !isAdmin && (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-[11px] sm:text-xs font-extrabold shadow-sm"
              title="Current Weekly Streak"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>{userStreak}d <span className="hidden sm:inline">Streak</span></span>
            </motion.div>
          )}

          {/* Typography Settings Trigger Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTypographyOpen(true)}
            className="hidden sm:flex p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors items-center gap-1.5 text-xs font-bold"
            title="Typography & Appearance Settings"
          >
            <Type className="w-4 h-4 text-purple-400" />
          </motion.button>

          {/* Backend Server Connection Setting */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setBackendModalOpen(true)}
            className="hidden sm:flex p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors items-center gap-1.5 text-xs font-bold"
            title="Backend Server Connection Settings"
          >
            <Server className="w-4 h-4 text-cyan-400" />
          </motion.button>

          {/* Theme Palette Switcher Dropdown */}
          <div className="relative hidden sm:block">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title={t('Switch Platform Theme')}
            >
              <Palette className="w-4 h-4 text-primaryBlue" />
            </motion.button>

            <AnimatePresence>
              {themeMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-52 rounded-xl border border-white/10 bg-darkCard p-2 shadow-2xl z-50 text-white"
                >
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-white/5 mb-1">
                    {t('SELECT THEME')}
                  </div>
                  {themesList.map((tItem) => (
                    <button
                      key={tItem.id}
                      onClick={() => { changeTheme(tItem.id); setThemeMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        theme === tItem.id ? 'bg-primaryBlue/20 text-primaryBlue font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: tItem.color }} />
                        <span>{t(tItem.name)}</span>
                      </div>
                      {theme === tItem.id && <Check className="w-3.5 h-3.5 text-primaryBlue" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Globe Symbol Language Switcher Dropdown */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border-2 border-emerald-400 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 transition-all flex items-center gap-1.5 text-xs font-extrabold shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30"
              title="Select UI Language (English, Hindi, Telugu, Tamil)"
            >
              <Globe className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <span className="flex items-center gap-1">
                <span className="text-gray-300 font-semibold hidden sm:inline">Lang:</span>
                <strong className="text-white font-black">
                  {{
                    en: 'English',
                    hi: 'हिंदी',
                    te: 'తెలుగు',
                    ta: 'தமிழ்',
                  }[(uiLanguage || 'en').toLowerCase()] || 'English'}
                </strong>
              </span>
            </motion.button>

            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-48 rounded-xl border border-white/10 bg-darkCard p-2 shadow-2xl z-50 text-white"
                >
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-white/5 mb-1">
                    {t('Language')}
                  </div>
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'hi', label: 'हिंदी (Hindi)' },
                    { id: 'te', label: 'తెలుగు (Telugu)' },
                    { id: 'ta', label: 'தமிழ் (Tamil)' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => { changeUiLanguage(l.id); setLangMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        (uiLanguage || '').toLowerCase() === l.id ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{l.label}</span>
                      {(uiLanguage || '').toLowerCase() === l.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isAuthenticated ? (
            <div 
              className="relative"
              onMouseEnter={handleMouseEnterUser}
              onMouseLeave={handleMouseLeaveUser}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none py-1"
              >
                <img 
                  src={getAvatarUrl(user?.avatar)} 
                  alt="avatar" 
                  className="w-10 h-10 rounded-full border border-primaryBlue/40 bg-darkCard/80 object-cover"
                />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-white/5 bg-darkCard p-2 shadow-2xl z-50 text-white"
                  >
                    <div className="px-3 py-2 border-b border-white/5">
                      <div className="font-semibold text-sm text-gray-100 truncate">{user?.username}</div>
                      <div className="font-normal text-xs text-gray-400 truncate">{user?.email}</div>
                    </div>
                    
                    {!isAdmin && (
                      <button
                        onClick={() => { setDropdownOpen(false); setModalOpen(true); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors mt-1"
                      >
                        <User className="w-4 h-4" /> Update Profile
                      </button>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-yellowAccent hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin Console
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-300 hover:text-white font-semibold text-sm">
                {t('Login')}
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-primaryBlue hover:bg-blue-600 rounded-lg text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20"
              >
                {t('Sign Up')}
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Drawer Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-primaryBlue" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Navigation Slide-Out Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Slide Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-4/5 max-w-xs h-full bg-slate-950/95 dark:bg-gray-950/95 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto text-white"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-tr from-primaryBlue to-indigo-600 rounded-lg text-white">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-lg">Code<span className="text-yellowAccent">Arena</span></span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Profile summary if logged in */}
                {isAuthenticated && (
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                    <img
                      src={getAvatarUrl(user?.avatar)}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border border-primaryBlue/50 object-cover"
                    />
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs truncate">{user?.username}</div>
                      <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-2">
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Navigation</div>
                  {isAuthenticated ? (
                    isAdmin ? (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-yellowAccent/10 text-yellowAccent font-bold text-xs border border-yellowAccent/20"
                        >
                          <ShieldAlert className="w-4 h-4" /> {t('nav_admin')}
                        </Link>
                        <Link
                          to="/leaderboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 font-semibold text-xs text-gray-200"
                        >
                          <BarChart3 className="w-4 h-4 text-primaryBlue" /> {t('nav_leaderboard')}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/problems"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 font-semibold text-xs text-gray-200"
                        >
                          <BookOpen className="w-4 h-4 text-primaryBlue" /> {t('nav_problems')}
                        </Link>
                        <Link
                          to="/leaderboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 font-semibold text-xs text-gray-200"
                        >
                          <BarChart3 className="w-4 h-4 text-primaryBlue" /> {t('nav_leaderboard')}
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 font-semibold text-xs text-gray-200"
                        >
                          <LayoutDashboard className="w-4 h-4 text-primaryBlue" /> {t('nav_dashboard')}
                        </Link>
                      </>
                    )
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-2.5 px-4 text-center font-bold text-xs rounded-xl bg-white/5 border border-white/10 text-white"
                      >
                        {t('nav_login')}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-2.5 px-4 text-center font-bold text-xs rounded-xl bg-primaryBlue text-white shadow-lg shadow-blue-500/20"
                      >
                        {t('nav_signup')}
                      </Link>
                    </>
                  )}
                </div>

                {/* Quick Preferences */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{t('nav_language')}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'en', label: 'English' },
                      { id: 'hi', label: 'हिंदी' },
                      { id: 'te', label: 'తెలుగు' },
                      { id: 'ta', label: 'தமிழ்' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => changeUiLanguage(l.id)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          (uiLanguage || '').toLowerCase() === l.id
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => { setMobileMenuOpen(false); setTypographyOpen(true); }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 text-xs font-semibold text-gray-200 mt-2"
                  >
                    <span className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-400" /> {t('nav_typography')}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-mono">{theme}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              {isAuthenticated && (
                <div className="border-t border-white/10 pt-4 mt-6 space-y-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); setModalOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 text-xs font-bold text-gray-200 border border-white/10"
                  >
                    <User className="w-4 h-4" /> Account Settings
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <ProfileModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Typography & Appearance Settings Modal */}
      <TypographyModal isOpen={typographyOpen} onClose={() => setTypographyOpen(false)} />

      {/* Backend Server Config Modal */}
      <BackendConfigModal isOpen={backendModalOpen} onClose={() => setBackendModalOpen(false)} showToast={showToast} />

      {/* Command Palette Modal */}
      <CommandPalette isOpen={commandPaletteOpen} setIsOpen={setCommandPaletteOpen} />
    </>
  );
};

export default Navbar;
