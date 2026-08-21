import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Flame, Award, ShieldAlert, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Welcome to CodeArena 7.0! 🚀',
    message: 'Your account is ready. Explore our sandboxed multi-lang compiler & global leaderboard.',
    timestamp: 'Just now',
    type: 'system',
    read: false,
  },
  {
    id: 2,
    title: 'Daily Coding Streak Active 🔥',
    message: 'Solve 1 problem today to maintain your current streak and unlock badge rewards!',
    timestamp: '2 hours ago',
    type: 'streak',
    read: false,
  },
  {
    id: 3,
    title: 'New Weekly Challenge Released',
    message: 'Two Sum & Graph Traversal problems are featured on the homepage.',
    timestamp: '1 day ago',
    type: 'challenge',
    read: true,
  },
];

export const NotificationCenter = () => {
  const { user, showToast, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  const storageKey = user ? `codearena_notifications_${user.email || user.username}` : 'codearena_notifications_guest';

  const [notifications, setNotifications] = useState(() => {
    if (!user) return [];
    const saved = localStorage.getItem(storageKey) || localStorage.getItem('codearena_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const menuRef = useRef(null);

  const syncNotifications = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const userSaved = localStorage.getItem(`codearena_notifications_${user.email || user.username}`);
    const globalSaved = localStorage.getItem('codearena_notifications');
    if (userSaved) {
      setNotifications(JSON.parse(userSaved));
    } else if (globalSaved) {
      setNotifications(JSON.parse(globalSaved));
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
    }
  };

  useEffect(() => {
    syncNotifications();
  }, [user?.email, user?.username]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`codearena_notifications_${user.email || user.username}`, JSON.stringify(notifications));
      localStorage.setItem('codearena_notifications', JSON.stringify(notifications));
    }
  }, [notifications, user]);

  useEffect(() => {
    const handleUpdate = () => {
      syncNotifications();
    };
    window.addEventListener('codearena_notification_update', handleUpdate);
    return () => window.removeEventListener('codearena_notification_update', handleUpdate);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = user ? notifications.filter((n) => !n.read).length : 0;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast(t('All notifications marked as read'), 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast(t('Notifications cleared'), 'info');
  };

  const markSingleAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.read : true
  );

  const getIcon = (type) => {
    switch (type) {
      case 'streak':
        return <Flame className="h-4 w-4 text-amber-400" />;
      case 'challenge':
        return <Award className="h-4 w-4 text-emerald-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-primaryBlue" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none"
        title={t('notifications_header')}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-md border border-gray-950">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-white/10 dark:border-white/15 bg-gray-900/95 dark:bg-gray-950/95 text-white shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primaryBlue" />
                <span className="font-bold text-sm">{t('notifications_header')}</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-primaryBlue/20 text-primaryBlue border border-primaryBlue/30 rounded-full">
                    {unreadCount} {t('new')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                    title={t('mark_all_read')}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="p-1 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-red-400 transition-colors"
                    title={t('clear_all')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-white/10 px-4 py-1.5 gap-2 bg-black/20 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('status_all')} ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('Unread')} ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {filteredNotifications.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <Info className="h-8 w-8 text-gray-500 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-gray-400">{t('no_notifications')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('all_caught_up')}</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markSingleAsRead(notification.id)}
                    className={`p-3.5 flex gap-3 transition-colors cursor-pointer ${
                      notification.read
                        ? 'hover:bg-white/5 opacity-75'
                        : 'bg-primaryBlue/5 hover:bg-primaryBlue/10 border-l-2 border-primaryBlue'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 h-fit shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {t(notification.title)}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                          {t(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {t(notification.message)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
