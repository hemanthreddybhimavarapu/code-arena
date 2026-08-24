import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, Flame, CheckCircle2, Percent, Target, BookOpen, 
  BarChart3, Clock, HelpCircle, Activity, Info
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Lottie from 'lottie-react';
import successTrophyAnimation from '../assets/lottie/success_trophy.json';
import api from '../utils/api';
import { useApp } from '../context/AppContext';
import { TableSkeletonRows } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import AchievementCard from '../components/ui/AchievementCard';
import OnboardingTour from '../components/ui/OnboardingTour';
import PageTransition from '../components/ui/PageTransition';

const CountUp = ({ end, decimals = 0, suffix = '', prefix = '', duration = 1.2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = Number(end) || 0;
    if (target === 0) {
      setCount(0);
      return;
    }
    const steps = 30;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(prev => Math.min(target, prev + increment));
      }
    }, (duration * 1000) / steps);

    return () => clearInterval(timer);
  }, [end, duration]);

  const formatted = count.toFixed(decimals);
  return <>{prefix}{formatted}{suffix}</>;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.max(0, Math.floor((now - date) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

const Dashboard = () => {
  const { user, t, showToast } = useApp();
  const [stats, setStats] = useState({
    solvedCount: 0,
    solvedEasy: 0,
    solvedMedium: 0,
    solvedHard: 0,
    accuracyRate: 0,
    currentStreak: 0,
    globalRank: 0,
    dailyActivity: [],
    recentSubmissions: []
  });
  const [loading, setLoading] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        // Fallback demo stats for seamless offline/standalone demo mode
        setStats({
          solvedCount: 14,
          solvedEasy: 8,
          solvedMedium: 5,
          solvedHard: 1,
          totalEasy: 25,
          totalMedium: 40,
          totalHard: 20,
          totalProblemsCount: 85,
          acceptanceRate: 88.5,
          currentStreak: user?.currentStreak || 7,
          longestStreak: 14,
          userRank: 3,
          totalActiveDays: 19,
          achievements: ['First Blood', '5 Day Streak', 'Problem Solver Level 1', 'Master of Loops'],
          languageStats: { python: 8, java: 4, cpp: 2 },
          submissionsCalendar: {
            '2026-08-24': 4,
            '2026-08-23': 2,
            '2026-08-22': 5,
            '2026-08-21': 3,
            '2026-08-20': 1,
            '2026-08-19': 6,
          },
          recentSubmissions: [
            { id: 101, problemId: 1, problemTitle: 'Two Sum', language: 'python', verdict: 'ACCEPTED', createdAt: new Date().toISOString() },
            { id: 102, problemId: 2, problemTitle: 'Reverse Linked List', language: 'java', verdict: 'ACCEPTED', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
            { id: 103, problemId: 3, problemTitle: 'Longest Substring Without Repeating Characters', language: 'cpp', verdict: 'ACCEPTED', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] w-full bg-darkBg text-white px-6 py-10 flex flex-col items-center">
        <div className="w-full max-w-7xl space-y-6">
          <div className="h-10 bg-white/5 rounded-xl w-1/3 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const currentStats = stats || {
    solvedCount: 0,
    solvedEasy: 0,
    solvedMedium: 0,
    solvedHard: 0,
    accuracyRate: 0,
    currentStreak: 0,
    globalRank: 0,
    totalProblemsCount: 100,
    attemptingCount: 0,
    dailyActivity: [],
    recentSubmissions: [],
    languageStats: {},
    submissionsCalendar: {}
  };

  const totalProblemsCount = currentStats.totalProblemsCount || ((currentStats.totalEasy || 0) + (currentStats.totalMedium || 0) + (currentStats.totalHard || 0)) || 100;
  const attemptingCount = currentStats.attemptingCount || 0;

  // Language stats
  const languageData = Object.entries(currentStats.languageStats || {}).map(([lang, count]) => ({
    name: lang.toUpperCase(),
    Submissions: count,
  }));

  // Calculate 52 weeks (364 days) contribution calendar
  const renderContributionCalendar = () => {
    const calendar = stats.submissionsCalendar || {};
    const days = [];
    const today = new Date();
    
    // Start 364 days ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    // Roll back to previous Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    let totalYearSubmissions = 0;
    const tempDate = new Date(startDate);
    while (tempDate <= today || days.length < 371) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const count = Number(calendar[dateStr] || 0);
      totalYearSubmissions += count;
      days.push({ 
        date: dateStr, 
        count,
        month: tempDate.toLocaleString('default', { month: 'short' }),
        dayOfMonth: tempDate.getDate()
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Group into 53 weeks (columns)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Extract month label positions
    const monthLabels = [];
    let lastMonth = '';
    weeks.forEach((week, wIdx) => {
      const firstDayInWeek = week[0];
      if (firstDayInWeek && firstDayInWeek.month !== lastMonth) {
        monthLabels.push({ name: firstDayInWeek.month, weekIndex: wIdx });
        lastMonth = firstDayInWeek.month;
      }
    });

    return (
      <div className="space-y-3">
        {/* Header Stats Line */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-400 gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-1.5 font-bold text-white text-sm">
            <span>{totalYearSubmissions} {t('submissions in the past one year')}</span>
            <Info className="w-3.5 h-3.5 text-gray-400" title={t('Submissions logged across all languages')} />
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>{t('Total active days:')} <strong className="text-white">{stats.totalActiveDays || Object.keys(calendar).length}</strong></span>
            <span className="text-white/20">|</span>
            <span>{t('Max streak:')} <strong className="text-orange-400">{stats.longestStreak || stats.currentStreak || 0}</strong></span>
          </div>
        </div>

        {/* Heat Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[680px]">
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1 shrink-0">
                  {week.map((day, dIdx) => {
                    let color = 'bg-gray-800/80';
                    if (day.count > 0 && day.count <= 2) color = 'bg-emerald-900';
                    else if (day.count > 2 && day.count <= 5) color = 'bg-emerald-600';
                    else if (day.count > 5) color = 'bg-emerald-400 shadow-sm shadow-emerald-400/50';

                    return (
                      <div
                        key={dIdx}
                        className={`w-3 h-3 rounded-[2px] transition-all hover:scale-125 cursor-pointer ${color}`}
                        title={`${day.count} submission(s) on ${day.date}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Month Labels Aligned Underneath */}
            <div className="flex text-[10px] font-bold text-gray-400 mt-2 relative h-4">
              {monthLabels.map((m, idx) => (
                <div 
                  key={idx} 
                  className="absolute"
                  style={{ left: `${(m.weekIndex / weeks.length) * 100}%` }}
                >
                  {t(m.name)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  // Donut SVG progress calculations
  const totalSolved = currentStats.solvedCount || 0;
  const easyPct = totalProblemsCount > 0 ? ((currentStats.solvedEasy || 0) / totalProblemsCount) * 100 : 0;
  const medPct = totalProblemsCount > 0 ? ((currentStats.solvedMedium || 0) / totalProblemsCount) * 100 : 0;
  const hardPct = totalProblemsCount > 0 ? ((currentStats.solvedHard || 0) / totalProblemsCount) * 100 : 0;

  return (
    <PageTransition className="min-h-[calc(100vh-73px)] w-full bg-darkBg text-white px-4 sm:px-8 xl:px-12 py-8 flex flex-col items-center">
      <OnboardingTour forceOpen={tourOpen} onClose={() => setTourOpen(false)} />
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1720px] 2xl:max-w-[1840px] space-y-8"
      >
        
        {/* Header Title & Actions */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight">{t('Dashboard')}</h1>
              <button
                onClick={() => setTourOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaryBlue/15 border border-primaryBlue/30 text-primaryBlue text-xs font-semibold hover:bg-primaryBlue/25 transition-all"
                title="Launch Product Guided Tour"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {t('Quick Tour')}
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-1">{t('Visualize your submission heatmaps, solved ratios, and streaks')}</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
            <div className="w-12 h-12">
              <Lottie animationData={successTrophyAnimation} loop={true} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('streak_badge')}</div>
              <div className="text-lg font-extrabold text-orange-400">
                <CountUp end={currentStats.currentStreak || 0} duration={1.2} suffix=" Days" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* LeetCode-Inspired Donut Card & Key Metrics Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LeetCode Solved Donut Ring */}
          <div className="glass-panel p-6 rounded-2xl hover-float flex flex-col justify-between">
            <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{t('dash_solved')}</span>
              <span className="text-xs text-primaryBlue font-bold">{totalSolved}/{totalProblemsCount} {t('status_solved')}</span>
            </h3>

            <div className="flex items-center justify-around py-4 gap-4">
              {/* Donut Ring Circle */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Solved Progress Arc */}
                  <path
                    className="text-emerald-500 transition-all duration-1000 stroke-current"
                    strokeDasharray={`${(totalSolved / Math.max(1, totalProblemsCount)) * 100}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-white leading-none">{totalSolved}</span>
                  <span className="text-[10px] font-bold text-emerald-400 mt-0.5">✓ {t('status_solved')}</span>
                  {attemptingCount > 0 && (
                    <span className="text-[10px] font-semibold text-amber-400 mt-0.5">{attemptingCount} {t('Attempted')}</span>
                  )}
                </div>
              </div>

              {/* Difficulty Cards Breakdown */}
              <div className="space-y-3 w-32">
                <div className="bg-white/5 border border-emerald-500/20 p-2 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold">{t('Easy')}</span>
                  <span className="font-extrabold text-white">{currentStats.solvedEasy || 0}/{currentStats.totalEasy || 0}</span>
                </div>
                <div className="bg-white/5 border border-yellow-500/20 p-2 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-yellow-400 font-bold">{t('Medium')}</span>
                  <span className="font-extrabold text-white">{currentStats.solvedMedium || 0}/{currentStats.totalMedium || 0}</span>
                </div>
                <div className="bg-white/5 border border-red-500/20 p-2 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-red-400 font-bold">{t('Hard')}</span>
                  <span className="font-extrabold text-white">{currentStats.solvedHard || 0}/{currentStats.totalHard || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metric Overview Cards */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between hover-float">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Acceptance Rate')}</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                  <CountUp end={currentStats.acceptanceRate || 0} decimals={1} suffix="%" duration={1.5} />
                </div>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                <Percent className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between hover-float">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Longest Streak')}</div>
                <div className="text-3xl font-extrabold text-orange-400 mt-1">
                  <CountUp end={currentStats.longestStreak || 0} suffix={` ${t('Days')}`} duration={1.5} />
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl">
                <Flame className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between hover-float">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Global Rank')}</div>
                <div className="text-3xl font-extrabold text-yellow-400 mt-1">
                  <CountUp prefix="#" end={currentStats.userRank || 1} duration={1.5} />
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex items-center justify-between hover-float">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Active Days')}</div>
                <div className="text-3xl font-extrabold text-primaryBlue mt-1">
                  <CountUp end={currentStats.totalActiveDays || Object.keys(currentStats.submissionsCalendar || {}).length} duration={1.5} />
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 text-primaryBlue border border-blue-500/20 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* LeetCode Contribution Calendar */}
        <div className="glass-panel p-6 rounded-2xl hover-float">
          {renderContributionCalendar()}
        </div>

        {/* Languages Analytics */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col hover-float">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> {t('Solved Submissions Analytics by Language')}
          </h3>
          <div className="h-48 flex items-center justify-center">
            {languageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={languageData}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Bar dataKey="Submissions" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-500">{t('No language submission data found.')}</div>
            )}
          </div>
        </div>

        {/* Achievement Showcase */}
        <div className="glass-panel p-6 rounded-3xl hover-float">
          <AchievementCard stats={currentStats} user={user} />
        </div>

        {/* Lower Grid: Badges & Submissions List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Achievements / Badges */}
          <div className="glass-panel p-6 rounded-2xl md:col-span-1 flex flex-col hover-float">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellowAccent" /> {t('Achievements & Badges')}
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2">
              {currentStats.achievements && currentStats.achievements.length > 0 ? (
                currentStats.achievements.map((ach, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3"
                  >
                    <div className="p-2 bg-yellow-500/10 text-yellowAccent rounded-lg">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-yellowAccent">{t('BADGE UNLOCKED')}</div>
                      <div className="text-sm font-semibold text-gray-200 mt-0.5">{t(ach)}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-sm text-gray-500">{t('Solve problems and earn achievements.')}</div>
              )}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="glass-panel p-6 rounded-2xl md:col-span-2 flex flex-col hover-float">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primaryBlue" /> {t('Recent Activity History')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">{t('PROBLEM')}</th>
                    <th className="py-3 px-4">{t('LANGUAGE')}</th>
                    <th className="py-3 px-4">{t('VERDICT')}</th>
                    <th className="py-3 px-4 text-right">{t('TIME AGO')}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStats.recentSubmissions && currentStats.recentSubmissions.length > 0 ? (
                    currentStats.recentSubmissions.map((sub) => (
                      <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          <Link 
                            to={`/problems/${sub.problemId || sub.problem?.id || ''}`} 
                            className="hover:text-primaryBlue hover:underline transition-colors"
                          >
                            {t(sub.problemTitle)}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-400 uppercase">{sub.language}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            sub.verdict === 'ACCEPTED' 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {t(sub.verdict)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-gray-400 font-semibold">
                          {timeAgo(sub.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        {t('No recent submissions.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </motion.div>
    </PageTransition>
  );
};

export default Dashboard;
