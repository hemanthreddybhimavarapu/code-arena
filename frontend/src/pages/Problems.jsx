import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, CheckCircle2, Circle, Clock, FilterX, X, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import Pagination from '../components/ui/Pagination';
import { TableSkeletonRows } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { TagBadge } from '../utils/tagIcons';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import PageTransition from '../components/ui/PageTransition';

const Problems = () => {
  const { user, showToast, t, uiLanguage, changeUiLanguage } = useApp();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);



  // Available tags to filter
  const tagsList = ['Array', 'String', 'Math', 'Dynamic Programming', 'Greedy', 'Two Pointers', 'Hash Table', 'Sorting', 'Tree', 'Graph'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } },
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProblems();
  }, [search, difficulty, selectedTag]);

  const DEFAULT_PROBLEMS = [
    { id: 1, title: 'Two Sum', difficulty: 'EASY', acceptanceRate: 49.5, tags: ['Array', 'Hash Table'], isSolved: false, isAttempted: false },
    { id: 2, title: 'Reverse a String', difficulty: 'EASY', acceptanceRate: 75.2, tags: ['String', 'Two Pointers'], isSolved: false, isAttempted: false },
    { id: 3, title: 'Palindrome Check', difficulty: 'EASY', acceptanceRate: 68.4, tags: ['String', 'Two Pointers'], isSolved: false, isAttempted: false },
    { id: 4, title: 'Fibonacci Number', difficulty: 'EASY', acceptanceRate: 67.1, tags: ['Math', 'Dynamic Programming'], isSolved: false, isAttempted: false },
    { id: 5, title: 'Binary Search', difficulty: 'EASY', acceptanceRate: 56.3, tags: ['Array', 'Sorting'], isSolved: false, isAttempted: false },
    { id: 6, title: 'Valid Parentheses', difficulty: 'EASY', acceptanceRate: 40.2, tags: ['String'], isSolved: false, isAttempted: false },
    { id: 7, title: 'Merge Two Sorted Lists', difficulty: 'EASY', acceptanceRate: 62.8, tags: ['Array', 'Two Pointers'], isSolved: false, isAttempted: false },
    { id: 8, title: 'Maximum Subarray', difficulty: 'MEDIUM', acceptanceRate: 50.1, tags: ['Array', 'Dynamic Programming'], isSolved: false, isAttempted: false },
    { id: 9, title: 'Longest Substring Without Repeating Characters', difficulty: 'MEDIUM', acceptanceRate: 34.2, tags: ['String', 'Hash Table'], isSolved: false, isAttempted: false },
    { id: 10, title: 'Container With Most Water', difficulty: 'MEDIUM', acceptanceRate: 54.1, tags: ['Array', 'Two Pointers', 'Greedy'], isSolved: false, isAttempted: false },
    { id: 11, title: '3Sum', difficulty: 'MEDIUM', acceptanceRate: 32.9, tags: ['Array', 'Two Pointers', 'Sorting'], isSolved: false, isAttempted: false },
    { id: 12, title: 'Climbing Stairs', difficulty: 'EASY', acceptanceRate: 52.3, tags: ['Math', 'Dynamic Programming'], isSolved: false, isAttempted: false },
    { id: 13, title: 'Coin Change', difficulty: 'MEDIUM', acceptanceRate: 42.1, tags: ['Dynamic Programming'], isSolved: false, isAttempted: false },
    { id: 14, title: 'Trapping Rain Water', difficulty: 'HARD', acceptanceRate: 60.5, tags: ['Array', 'Two Pointers'], isSolved: false, isAttempted: false },
    { id: 15, title: 'Merge k Sorted Lists', difficulty: 'HARD', acceptanceRate: 51.2, tags: ['Heap', 'Sorting'], isSolved: false, isAttempted: false },
    { id: 16, title: 'Number of Islands', difficulty: 'MEDIUM', acceptanceRate: 57.8, tags: ['Graph', 'Tree'], isSolved: false, isAttempted: false },
  ];

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/problems', {
        params: {
          query: search || undefined,
          difficulty: difficulty || undefined,
          tag: selectedTag || undefined,
        },
      });
      const data = res.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        setProblems(data);
      } else {
        setProblems(DEFAULT_PROBLEMS);
      }
    } catch (err) {
      setProblems(DEFAULT_PROBLEMS);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = (problems || []).filter(p => {
    if (!p) return false;
    if (statusFilter === 'SOLVED') return p.isSolved;
    if (statusFilter === 'ATTEMPTED') return p.isAttempted;
    if (statusFilter === 'UNSOLVED') return !p.isSolved && !p.isAttempted;
    return true;
  });

  return (
    <PageTransition key={uiLanguage} className="min-h-[calc(100vh-73px)] w-full bg-darkBg text-white px-4 sm:px-8 xl:px-12 py-8 flex flex-col items-center">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1720px] 2xl:max-w-[1840px] space-y-6"
      >
        
        {/* Title Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primaryBlue" /> {t('Problems')}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{t('Discover, filter, and master algorithmic problems across multiple categories')}</p>
          </div>
        </motion.div>

        {/* Filter Toolbar */}
        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder={t('search_problems_placeholder')}
              className="w-full glass-input pl-10 pr-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Select */}
            <select
              className="bg-darkCard border border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:ring-2 focus:ring-primaryBlue focus:outline-none text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('filter_status')}: {t('status_all')}</option>
              <option value="SOLVED">{t('status_solved')}</option>
              <option value="ATTEMPTED">{t('Attempted')}</option>
              <option value="UNSOLVED">{t('status_unsolved')}</option>
            </select>

            {/* Difficulty select */}
            <select
              className="bg-darkCard border border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:ring-2 focus:ring-primaryBlue focus:outline-none text-white"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">{t('problem_difficulty')}: {t('status_all')}</option>
              <option value="EASY">{t('Easy')}</option>
              <option value="MEDIUM">{t('Medium')}</option>
              <option value="HARD">{t('Hard')}</option>
            </select>

            {/* Tag select */}
            <select
              className="bg-darkCard border border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:ring-2 focus:ring-primaryBlue focus:outline-none text-white"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">{t('Topic')}: {t('status_all')}</option>
              {tagsList.map(tag => (
                <option key={tag} value={tag}>{t(tag)}</option>
              ))}
            </select>

            {/* Reset Button */}
            {(search || difficulty || selectedTag || statusFilter) && (
              <button
                onClick={() => { setSearch(''); setDifficulty(''); setSelectedTag(''); setStatusFilter(''); }}
                className="text-xs text-primaryBlue hover:underline font-bold flex items-center gap-1 ml-1"
              >
                <FilterX className="w-3.5 h-3.5" /> {t('Clear Filters')}
              </button>
            )}
          </div>
        </motion.div>

        {/* Problems List */}
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider bg-white/5">
                  <th className="px-6 py-4 w-28 text-center">{t('problem_status')}</th>
                  <th className="px-6 py-4">{t('problem_title')}</th>
                  <th className="px-6 py-4">{t('problem_difficulty')}</th>
                  <th className="px-6 py-4">{t('problem_acceptance')}</th>
                  <th className="px-6 py-4">Tags</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeletonRows rows={6} cols={5} />
                ) : filteredProblems.length > 0 ? (
                  filteredProblems
                    .slice((currentPage - 1) * 10, currentPage * 10)
                    .map((problem, index) => (
                      <tr 
                        key={problem.id} 
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/problems/${problem.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/problems/${problem.id}`);
                          }
                        }}
                        className="border-b border-white/5 hover:bg-white/10 active:bg-white/15 cursor-pointer transition-all duration-200 group select-none"
                      >
                        <td className="px-6 py-4 text-center">
                          {problem.isSolved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full" title="Solved">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('status_solved')}
                            </span>
                          ) : problem.isAttempted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full" title="Attempted">
                              <Clock className="w-3.5 h-3.5 text-amber-400" /> {t('Attempted')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-400 bg-gray-500/10 border border-gray-500/20 rounded-full" title="Unsolved">
                              <Circle className="w-3.5 h-3.5 text-gray-500" /> {t('status_unsolved')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-100 group-hover:text-primaryBlue transition-colors">
                          <Link 
                            to={`/problems/${problem.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block hover:underline text-gray-100 group-hover:text-primaryBlue"
                          >
                            {(currentPage - 1) * 10 + index + 1}. {t(problem.title)}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <DifficultyBadge difficulty={problem.difficulty} />
                        </td>
                        <td className="px-6 py-4 text-gray-300 font-semibold">
                          {problem.acceptanceRate ? problem.acceptanceRate.toFixed(1) : '45.0'}%
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {problem.tags && problem.tags.map((tag) => (
                              <TagBadge key={tag} tag={t(tag)} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8">
                      <EmptyState
                        icon={BookOpen}
                        title={t('No Problems Found')}
                        description={t('No algorithmic tasks match your current search query, difficulty, tag, or status filter.')}
                        actionLabel={t('Clear Search Filters')}
                        onAction={() => { setSearch(''); setDifficulty(''); setSelectedTag(''); setStatusFilter(''); }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && filteredProblems.length > 0 && (
            <div className="border-t border-white/5 px-6 py-3 bg-black/20">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredProblems.length / 10)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </motion.div>

      </motion.div>
    </PageTransition>
  );
};

export default Problems;
