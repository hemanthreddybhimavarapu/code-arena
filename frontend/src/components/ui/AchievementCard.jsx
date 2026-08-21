import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Sparkles, CheckCircle2, Flame, Trophy, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useApp } from '../../context/AppContext';

const AchievementCard = ({ stats, user }) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const { t, showToast, getAvatarUrl } = useApp();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#050816',
        useCORS: true,
        logging: false,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${user?.username || 'Coder'}-CodeArena-Achievements.png`;
      link.click();
      showToast(t('Achievement Showcase downloaded as PNG!'), 'success');
    } catch (err) {
      console.error(err);
      showToast(t('Failed to export image'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  const achievementsList = stats?.achievements || [t('First Code Submitted'), t('Problem Solver'), t('Consistency Master')];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellowAccent" /> {t('Official Achievement Showcase Card')}
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primaryBlue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all btn-glow"
        >
          {downloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('Exporting Card...')}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {t('Download as Image')}
            </>
          )}
        </motion.button>
      </div>

      {/* Exportable Card Container */}
      <div
        ref={cardRef}
        className="relative w-full rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 border border-white/10 shadow-2xl text-white flex flex-col justify-between gap-6"
      >
        {/* Decorative Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primaryBlue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between z-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={getAvatarUrl(user?.avatar)}
              alt="User Avatar"
              className="w-14 h-14 rounded-full border-2 border-primaryBlue object-cover shadow-md"
            />
            <div>
              <div className="text-xl font-black text-white tracking-wide">{user?.username || 'Coder'}</div>
              <div className="text-xs font-semibold text-gray-400">CodeArena Certified Developer</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-bold text-yellowAccent shadow-inner">
            <Sparkles className="w-3.5 h-3.5" /> {t('GLOBAL RANK')} #{stats?.userRank || 1}
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-3 gap-4 z-10 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('SOLVED')}</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{stats?.solvedCount || 0}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('STREAK')}</div>
            <div className="text-2xl font-black text-orange-400 mt-0.5">{stats?.currentStreak || 0}d</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('ACCURACY')}</div>
            <div className="text-2xl font-black text-primaryBlue mt-0.5">
              {stats?.acceptanceRate ? stats.acceptanceRate.toFixed(1) : '100'}%
            </div>
          </div>
        </div>

        {/* Achievements List */}
        <div className="z-10 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellowAccent" /> {t('UNLOCKED BADGES & MILESTONES')}
          </div>
          <div className="flex flex-wrap gap-2">
            {achievementsList.map((badge, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-xl text-xs font-bold text-yellow-300 flex items-center gap-1.5 shadow-sm"
              >
                <Award className="w-3.5 h-3.5 text-yellowAccent" />
                {t(badge)}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Brand Seal */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 z-10 text-[11px] text-gray-400">
          <span className="font-bold tracking-widest text-primaryBlue uppercase">CodeArena 7.0</span>
          <span>{t('Verified Platform Stats')}</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
