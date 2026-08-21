import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Search, BookOpen, Trash2, FolderHeart, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import PageTransition from '../components/ui/PageTransition';
import { isAdminUser } from '../utils/admin';

const BookmarkedProblems = () => {
  const { user, showToast } = useApp();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isAdminUser(user)) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const fetchBookmarkedProblems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/problems');
      const allProblems = res.data.data;
      
      // Get bookmarked IDs from localStorage
      const savedKey = `bookmarked_problems_${user?.id}`;
      const bookmarkedIds = JSON.parse(localStorage.getItem(savedKey) || '[]');
      
      // Filter list
      const filtered = allProblems.filter(p => bookmarkedIds.includes(p.id));
      setProblems(filtered);
    } catch (err) {
      showToast('Failed to load bookmarked problems', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookmarkedProblems();
    }
  }, [user]);

  const handleRemoveBookmark = async (id, title) => {
    try {
      await api.post(`/problems/${id}/bookmark`);
      const savedKey = `bookmarked_problems_${user?.id}`;
      let bookmarkedIds = JSON.parse(localStorage.getItem(savedKey) || '[]');
      bookmarkedIds = bookmarkedIds.filter(bId => bId !== id);
      localStorage.setItem(savedKey, JSON.stringify(bookmarkedIds));
      
      setProblems(prev => prev.filter(p => p.id !== id));
      showToast(`Removed "${title}" from bookmarks`, 'info');
      // Trigger dynamic event to notify other elements (like Navbar)
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      showToast('Failed to remove bookmark', 'error');
    }
  };

  const filteredProblems = problems.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition className="min-h-[calc(100vh-73px)] w-full bg-darkBg text-white px-4 sm:px-8 xl:px-12 py-8 flex flex-col items-center">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1840px] space-y-6">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <FolderHeart className="w-8 h-8 text-pink-500" /> Bookmarked Challenges
            </h1>
            <p className="text-gray-400 text-sm mt-1">Review your customized library of saved coding tasks</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="glass-panel p-4 rounded-2xl flex items-center shadow-xl">
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Search in bookmarks..."
              className="w-full glass-input pl-10 pr-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Table/List */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-white/5 backdrop-blur-xl">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 font-semibold">Scanning bookmarks database...</p>
            </div>
          ) : filteredProblems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">
                    <th className="py-4 px-6">Problem</th>
                    <th className="py-4 px-6">Difficulty</th>
                    <th className="py-4 px-6">Acceptance</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredProblems.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-all">
                      <td className="py-4.5 px-6">
                        <Link to={`/problems/${p.id}`} className="font-bold text-white hover:text-primaryBlue transition-colors">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-4.5 px-6">
                        <DifficultyBadge difficulty={p.difficulty} />
                      </td>
                      <td className="py-4.5 px-6 font-mono text-xs">
                        {p.acceptanceRate?.toFixed(1) || '0.0'}%
                      </td>
                      <td className="py-4.5 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleRemoveBookmark(p.id, p.title)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 rounded-lg text-red-400 transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/problems/${p.id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10 transition-all hover:scale-[1.02]"
                        >
                          Solve <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center space-y-4">
              <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-lg">No bookmarked challenges found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Select problem cards inside the Problem Workspace and click the Bookmark icon to save them here for offline practice.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default BookmarkedProblems;
