import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, Percent, Zap } from 'lucide-react';
import Lottie from 'lottie-react';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import successTrophyAnimation from '../assets/lottie/success_trophy.json';
import PageTransition from '../components/ui/PageTransition';

const Leaderboard = () => {
  const { showToast, getAvatarUrl, t } = useApp();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('global');
  const [language, setLanguage] = useState('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const params = {};
        if (timeframe === 'weekly') {
          params.type = 'weekly';
        }
        if (language !== 'all') {
          params.language = language;
        }
        const res = await api.get('/leaderboard', { params });
        if (res.data?.data && res.data.data.length > 0) {
          setBoard(res.data.data);
        } else {
          throw new Error('Empty backend leaderboard response');
        }
      } catch (err) {
        // Fallback leaderboard data for demo & standalone mode
        setBoard([
          { id: 1, userId: 1, rank: 1, username: 'Alex_MasterCoder', score: 3450, solvedCount: 42, acceptanceRate: 94.2, avatar: 'Alex_MasterCoder' },
          { id: 2, userId: 2, rank: 2, username: 'Sarah_AlgoQueen', score: 2890, solvedCount: 36, acceptanceRate: 91.5, avatar: 'Sarah_AlgoQueen' },
          { id: 3, userId: 3, rank: 3, username: 'DemoCoder', score: 1850, solvedCount: 24, acceptanceRate: 88.0, avatar: 'DemoCoder' },
          { id: 4, userId: 4, rank: 4, username: 'Dev_Vikram', score: 1620, solvedCount: 20, acceptanceRate: 85.4, avatar: 'Dev_Vikram' },
          { id: 5, userId: 5, rank: 5, username: 'Priya_Pythonista', score: 1410, solvedCount: 18, acceptanceRate: 82.1, avatar: 'Priya_Pythonista' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [timeframe, language]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] w-full flex items-center justify-center bg-darkBg text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-semibold">{t('btn_loading')}</p>
        </div>
      </div>
    );
  }

  // Split top 3 and the rest
  const topThree = board.slice(0, 3);
  const remaining = board.slice(3);

  // Rearrange top 3 for standard podium: Rank 2 on Left, Rank 1 in Middle, Rank 3 on Right
  const podium = [];
  if (topThree[1]) podium.push({ ...topThree[1], displayRank: 2 });
  if (topThree[0]) podium.push({ ...topThree[0], displayRank: 1 });
  if (topThree[2]) podium.push({ ...topThree[2], displayRank: 3 });

  const getTrophyColor = (rank) => {
    if (rank === 1) return 'text-yellowAccent';
    if (rank === 2) return 'text-gray-300';
    return 'text-amber-600';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } },
  };

  return (
    <PageTransition className="min-h-[calc(100vh-73px)] w-full bg-darkBg text-white px-4 sm:px-8 xl:px-12 py-8 flex flex-col items-center">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1600px] 2xl:max-w-[1720px] space-y-12"
      >
        
        {/* Title */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellowAccent animate-bounce" /> {t('leaderboard_title')}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{t('leaderboard_subtitle')}</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 max-w-3xl mx-auto w-full">
          {/* Timeframe Filter */}
          <div className="flex bg-black/30 p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => setTimeframe('global')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                timeframe === 'global'
                  ? 'bg-primaryBlue text-white shadow-md smooth-glow-active'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Globally
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                timeframe === 'weekly'
                  ? 'bg-primaryBlue text-white shadow-md smooth-glow-active'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>

          {/* Language Filter */}
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {['all', 'python', 'java', 'cpp', 'c', 'javascript'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-300 uppercase tracking-wider ${
                  language === lang
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 smooth-glow-emerald-active'
                    : 'bg-black/20 text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                {lang === 'all' ? 'All Languages' : lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>
        </div>

        {/* Podium Display */}
        {topThree.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex justify-center">
              <div className="w-40 h-40">
                <Lottie animationData={successTrophyAnimation} loop={true} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-end justify-center gap-6 pb-6 max-w-3xl mx-auto">
              {podium.map((user) => {
                const heightClass = user.displayRank === 1 ? 'h-64' : user.displayRank === 2 ? 'h-52' : 'h-44';
                const scaleVal = user.displayRank === 1 ? 1.05 : 1;

                return (
                  <motion.div
                    key={user.userId || user.id}
                    whileHover={{ scale: 1.02 }}
                    style={{ scale: scaleVal }}
                    className={`w-full sm:w-56 glass-panel rounded-2xl p-6 flex flex-col items-center justify-between shadow-2xl relative border ${
                      user.displayRank === 1 ? 'border-yellowAccent/40 smooth-glow-gold-active' :
                      user.displayRank === 2 ? 'border-white/5 smooth-glow-silver-active' :
                      'border-white/5 smooth-glow-active'
                    } ${heightClass} hover-float`}
                  >
                    {/* Floating Rank Crown */}
                    <div className={`absolute -top-6 p-3 rounded-full bg-darkCard border ${
                      user.displayRank === 1 ? 'border-yellowAccent text-yellowAccent shadow-lg shadow-yellowAccent/20' : 
                      user.displayRank === 2 ? 'border-gray-400 text-gray-300' : 'border-amber-600 text-amber-600'
                    }`}>
                      <Trophy className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col items-center gap-2 mt-4">
                      <img
                        src={getAvatarUrl(user.avatar)}
                        alt="avatar"
                        className="w-14 h-14 rounded-full border-2 border-white/10"
                      />
                      <div className="font-bold text-gray-100 text-sm text-center truncate w-40">{user.username}</div>
                    </div>

                    <div className="text-center w-full">
                      <div className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {user.score} {t('pts')}
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                        {user.solvedCount} {t('Tasks Solved')}
                      </div>
                    </div>

                    <div className={`w-full py-1 text-center text-xs font-bold rounded-lg mt-2 bg-white/5 border border-white/5 ${getTrophyColor(user.displayRank)}`}>
                      {t('Rank')} #{user.displayRank}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Ranks Table */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm text-gray-300">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 text-xs font-semibold uppercase bg-white/5">
                <th className="px-6 py-4">{t('Global Rank')}</th>
                <th className="px-6 py-4">{t('User')}</th>
                <th className="px-6 py-4">{t('Score')}</th>
                <th className="px-6 py-4">{t('Problems Solved')}</th>
                <th className="px-6 py-4">{t('Acceptance Rate')}</th>
              </tr>
            </thead>
            <tbody>
              {board.map((user) => (
                <tr 
                  key={user.userId || user.id} 
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    user.rank <= 3 ? 'bg-white/[0.01]' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-gray-200">
                    <span className={`px-2 py-0.5 rounded-md font-mono ${
                      user.rank === 1 ? 'text-yellowAccent bg-yellow-500/10' :
                      user.rank === 2 ? 'text-gray-300 bg-gray-500/10' :
                      user.rank === 3 ? 'text-amber-600 bg-amber-600/10' : 'text-gray-400'
                    }`}>
                      #{user.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img 
                      src={getAvatarUrl(user.avatar)} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full border border-white/10"
                    />
                    <span className="font-semibold text-gray-100">{user.username}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{user.score} {t('pts')}</td>
                  <td className="px-6 py-4 text-gray-400 font-semibold flex items-center gap-1.5 py-4">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {user.solvedCount} {t('Solved')}
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-blue-500" />
                      {user.acceptanceRate ? user.acceptanceRate.toFixed(1) : '0.0'}%
                    </span>
                  </td>
                </tr>
              ))}
              {board.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No rank standings recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </motion.div>
    </PageTransition>
  );
};

export default Leaderboard;
