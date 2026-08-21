import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BookOpen, BarChart3, ShieldAlert, Plus, Trash2, Edit3, CheckSquare, 
  Settings2, Activity, Tag, HelpCircle, FileText, Check, AlertTriangle, Mail, MessageSquare, CheckCircle2, Clock, Type 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import Pagination from '../components/ui/Pagination';
import { TableSkeletonRows } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { TagBadge } from '../utils/tagIcons';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import PageTransition from '../components/ui/PageTransition';
import TypographyModal from '../components/ui/TypographyModal';

const Admin = () => {
  const { getAvatarUrl, showToast, t } = useApp();
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, users, problems, submissions, leaderboard, messages
  const [typographyOpen, setTypographyOpen] = useState(false);
  
  // Data lists
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminProblemsPage, setAdminProblemsPage] = useState(1);

  // Problem creation form states
  const [isEditing, setIsEditing] = useState(false);
  const [editProblemId, setEditProblemId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [tags, setTags] = useState('');
  const [timeLimitMs, setTimeLimitMs] = useState(5000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(512);
  const [editorial, setEditorial] = useState('');

  // Hints
  const [hints, setHints] = useState([]);
  const [newHint, setNewHint] = useState('');

  // Test Cases
  const [testCases, setTestCases] = useState([]);
  const [tcInput, setTcInput] = useState('');
  const [tcOutput, setTcOutput] = useState('');
  const [tcHidden, setTcHidden] = useState(false);

  // Starter templates
  const [starterJava, setStarterJava] = useState('');
  const [starterPython, setStarterPython] = useState('');
  const [starterJs, setStarterJs] = useState('');

  // User Manager States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsUser, setStatsUser] = useState(null);

  // Problem Search States
  const [problemSearchQuery, setProblemSearchQuery] = useState('');
  const [problemSearchDifficulty, setProblemSearchDifficulty] = useState('');
  const [problemSearchTag, setProblemSearchTag] = useState('');

  const handleToggleActive = async (userObj) => {
    const action = userObj.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.post(`/admin/users/${userObj.id}/${action}`);
      showToast(`User ${action}d successfully`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || `Failed to ${action} user`, 'error');
    }
  };

  const handleToggleBan = async (userObj) => {
    const action = userObj.isBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.post(`/admin/users/${userObj.id}/${action}`);
      showToast(`User ${action}ned successfully`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || `Failed to ${action} user`, 'error');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await api.post(`/admin/users/${userId}/role`, { role: newRole });
      showToast("User role updated successfully", 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || "Failed to update role", 'error');
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = window.prompt("Enter new password for this user:");
    if (newPassword === null) return;
    if (!newPassword.trim()) {
      showToast("Password cannot be empty", 'error');
      return;
    }
    try {
      await api.post(`/admin/users/${userId}/reset-password`, { password: newPassword });
      showToast("Password reset successfully", 'success');
    } catch (err) {
      showToast(err.message || "Failed to reset password", 'error');
    }
  };

  const handleViewStats = async (userObj) => {
    setStatsUser(userObj);
    try {
      const res = await api.get(`/admin/users/${userObj.id}/statistics`);
      setSelectedUserStats(res.data.data);
      setIsStatsModalOpen(true);
    } catch (err) {
      showToast(err.message || "Failed to load user statistics", 'error');
    }
  };

  const handleSearchProblems = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.data);
      } else if (activeTab === 'problems') {
        const params = {};
        if (problemSearchQuery.trim()) params.query = problemSearchQuery.trim();
        if (problemSearchDifficulty) params.difficulty = problemSearchDifficulty;
        if (problemSearchTag.trim()) params.tag = problemSearchTag.trim();
        const res = await api.get('/problems', { params });
        setProblems(res.data.data);
      } else if (activeTab === 'submissions') {
        const res = await api.get('/admin/submissions');
        setSubmissions(res.data.data);
      } else if (activeTab === 'leaderboard') {
        const res = await api.get('/admin/leaderboard');
        setLeaderboard(res.data.data);
      } else if (activeTab === 'messages') {
        const res = await api.get('/admin/contact-messages');
        setContactMessages(res.data.data || []);
      }
    } catch (err) {
      if (err.response) {
        showToast(err.message || 'Failed to load admin dashboard data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMessageStatus = async (msgId, currentStatus) => {
    const newStatus = currentStatus === 'RESOLVED' ? 'PENDING' : 'RESOLVED';
    try {
      await api.patch(`/admin/contact-messages/${msgId}/status`, { status: newStatus });
      showToast(`Support inquiry #${msgId} marked as ${newStatus}`, 'success');

      if (newStatus === 'RESOLVED') {
        const msg = contactMessages.find((m) => m.id === msgId);
        if (msg) {
          const userKey = `codearena_notifications_${msg.email}`;
          const existingNotifs = JSON.parse(localStorage.getItem(userKey) || '[]');
          const newNotif = {
            id: Date.now(),
            title: 'Support Inquiry Resolved! 🎉',
            message: `Your support inquiry regarding "${msg.subject || 'Platform Support'}" has been marked as RESOLVED by the CodeArena admin team.`,
            timestamp: 'Just now',
            type: 'system',
            read: false,
          };
          localStorage.setItem(userKey, JSON.stringify([newNotif, ...existingNotifs]));

          const globalNotifs = JSON.parse(localStorage.getItem('codearena_notifications') || '[]');
          localStorage.setItem('codearena_notifications', JSON.stringify([newNotif, ...globalNotifs]));

          window.dispatchEvent(new Event('codearena_notification_update'));
        }
      }

      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update message status', 'error');
    }
  };

  const handleDeleteSubmission = async (subId) => {
    if (!window.confirm('Delete this submission record permanently?')) return;
    try {
      await api.delete(`/admin/submissions/${subId}`);
      showToast('Submission deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete submission', 'error');
    }
  };

  const handleDeleteLeaderboard = async (leadId) => {
    if (!window.confirm('Remove this leaderboard entry?')) return;
    try {
      await api.delete(`/admin/leaderboard/${leadId}`);
      showToast('Leaderboard record removed', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete entry', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showToast('User deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleAddHint = () => {
    if (!newHint.trim()) return;
    setHints([...hints, { hintNumber: hints.length + 1, content: newHint }]);
    setNewHint('');
  };

  const handleAddTestCase = () => {
    if (!tcInput.trim() || !tcOutput.trim()) {
      showToast('Input and expected output cannot be empty', 'error');
      return;
    }
    setTestCases([...testCases, { input: tcInput, expectedOutput: tcOutput, isHidden: tcHidden }]);
    setTcInput('');
    setTcOutput('');
    setTcHidden(false);
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      showToast('Title and Description are required', 'error');
      return;
    }

    const payload = {
      title,
      difficulty,
      description,
      constraints,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      timeLimitMs: parseInt(timeLimitMs),
      memoryLimitMb: parseInt(memoryLimitMb),
      starterCodeJava: starterJava,
      starterCodePython: starterPython,
      starterCodeJs: starterJs,
      editorial,
      hints
    };

    try {
      let savedProblem;
      if (isEditing) {
        const res = await api.put(`/admin/problems/${editProblemId}`, payload);
        savedProblem = res.data.data;
        showToast('Problem updated successfully!', 'success');
      } else {
        const res = await api.post('/admin/problems', payload);
        savedProblem = res.data.data;
        showToast('Problem created successfully!', 'success');
      }

      // Add Test Cases sequentially for the created/edited problem
      if (testCases.length > 0) {
        // delete existing test cases if editing
        if (isEditing) {
          try {
            const tcListRes = await api.get(`/admin/problems/${savedProblem.id}/testcases`);
            for (let tc of tcListRes.data.data) {
              await api.delete(`/admin/problems/testcases/${tc.id}`);
            }
          } catch (ignored) {}
        }

        // save all test cases
        for (let tc of testCases) {
          await api.post(`/admin/problems/${savedProblem.id}/testcases`, tc);
        }
      }

      resetProblemForm();
      setActiveTab('problems');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save problem details', 'error');
    }
  };

  const handleEditProblemClick = async (problemObj) => {
    setLoading(true);
    try {
      const res = await api.get(`/problems/${problemObj.id}`);
      const detail = res.data.data;
      
      setTitle(detail.title);
      setDifficulty(detail.difficulty);
      setDescription(detail.description);
      setConstraints(detail.constraints || '');
      setTags(Array.from(detail.tags || []).join(', '));
      setTimeLimitMs(detail.timeLimitMs);
      setMemoryLimitMb(detail.memoryLimitMb);
      setStarterJava(detail.starterCodeJava || '');
      setStarterPython(detail.starterCodePython || '');
      setStarterJs(detail.starterCodeJs || '');
      setEditorial(detail.editorial || '');
      setHints(detail.hints || []);

      // Load test cases
      const tcRes = await api.get(`/admin/problems/${problemObj.id}/testcases`);
      setTestCases(tcRes.data.data || []);

      setEditProblemId(problemObj.id);
      setIsEditing(true);
      setActiveTab('create_problem'); // trigger view switch
    } catch (err) {
      showToast(err.message || 'Failed to load problem for edit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm('Delete this problem? All test cases, editorials, and submissions will be deleted.')) return;
    try {
      await api.delete(`/admin/problems/${problemId}`);
      showToast('Problem deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete problem', 'error');
    }
  };

  const resetProblemForm = () => {
    setIsEditing(false);
    setEditProblemId(null);
    setTitle('');
    setDifficulty('EASY');
    setDescription('');
    setConstraints('');
    setTags('');
    setTimeLimitMs(5000);
    setMemoryLimitMb(512);
    setEditorial('');
    setHints([]);
    setTestCases([]);
    setStarterJava('');
    setStarterPython('');
    setStarterJs('');
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    const barData = Object.entries(analytics.verdictStats || {}).map(([verdict, count]) => ({
      name: verdict,
      Submissions: count,
    }));

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Platform Users')}</div>
              <div className="text-3xl font-extrabold mt-1">{analytics.totalUsers}</div>
            </div>
            <div className="p-3 bg-blue-500/10 text-primaryBlue border border-blue-500/20 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Total Tasks')}</div>
              <div className="text-3xl font-extrabold mt-1">{analytics.totalProblems}</div>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Total Submissions')}</div>
              <div className="text-3xl font-extrabold mt-1">{analytics.totalSubmissions}</div>
            </div>
            <div className="p-3 bg-yellow-500/10 text-yellowAccent border border-yellow-500/20 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primaryBlue" /> {t('Platform Submission Verdicts Distribution')}
          </h3>
          <div className="h-64">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Bar dataKey="Submissions" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-500 text-center py-20">{t('No submission records logged yet.')}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSupportMessages = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 p-4 rounded-xl">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-primaryBlue" /> {t('User Support Inquiries & Feedback')}
            </h3>
            <p className="text-xs text-gray-400">{t('View real-time contact requests submitted by platform users')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primaryBlue/20 text-primaryBlue border border-primaryBlue/30">
              {contactMessages.length} {t('Messages Total')}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider bg-white/5">
                  <th className="px-6 py-4 w-20">ID</th>
                  <th className="px-6 py-4">{t('Sender Details')}</th>
                  <th className="px-6 py-4">{t('Subject & Message')}</th>
                  <th className="px-6 py-4">{t('Submitted At')}</th>
                  <th className="px-6 py-4">{t('Status')}</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {contactMessages.length > 0 ? (
                  contactMessages.map((msg) => (
                    <tr key={msg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primaryBlue">#{msg.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{msg.name}</div>
                        <a href={`mailto:${msg.email}`} className="text-xs text-primaryBlue hover:underline">
                          {msg.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-bold text-white mb-1">{msg.subject}</div>
                        <div className="text-xs text-gray-300 whitespace-pre-wrap bg-black/20 p-2.5 rounded-lg border border-white/5">
                          {msg.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(msg.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {msg.status === 'RESOLVED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleMessageStatus(msg.id, msg.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            msg.status === 'RESOLVED'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {msg.status === 'RESOLVED' ? 'Mark Pending' : 'Mark Resolved'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8">
                      <EmptyState
                        icon={Mail}
                        title="No Support Messages"
                        description="There are currently no user support inquiries logged in the system."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PageTransition className="min-h-[calc(100vh-73px)] w-full bg-darkBg text-white px-4 sm:px-8 xl:px-12 py-8 flex flex-col items-center">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1840px] space-y-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 text-yellowAccent">
              <ShieldAlert className="w-8 h-8" /> {t('Admin Management Console')}
            </h1>
            <p className="text-gray-400 text-sm">{t('Control platform codebases, test metrics, and user lists')}</p>
          </div>
          
          <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'analytics' ? 'bg-primaryBlue text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> {t('Analytics')}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-primaryBlue text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> {t('Users')}
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'problems' || activeTab === 'create_problem' ? 'bg-primaryBlue text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> {t('nav_problems')}
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'submissions' ? 'bg-primaryBlue text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> {t('Submissions')}
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'leaderboard' ? 'bg-primaryBlue text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-yellowAccent" /> {t('nav_leaderboard')}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'messages' ? 'bg-primaryBlue text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> {t('Support Inquiries')}
            </button>
            <button
              onClick={() => setTypographyOpen(true)}
              className="px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 text-purple-400 hover:text-white hover:bg-white/10 border border-purple-500/30 bg-purple-500/10"
              title={t('Typography Settings')}
            >
              <Type className="w-3.5 h-3.5" /> {t('Typography')}
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="w-full">
          {loading && activeTab !== 'create_problem' ? (
            <div className="p-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin" />
              <div className="text-sm text-gray-400 font-semibold">{t('Loading data details...')}</div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'analytics' && renderAnalytics()}
              {activeTab === 'messages' && renderSupportMessages()}

              {activeTab === 'users' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center gap-4 bg-white/5 p-4 rounded-xl">
                    <input
                      type="text"
                      placeholder={t('Search Users by username or email...')}
                      className="glass-input text-xs w-full max-w-md"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-400 text-xs font-semibold uppercase bg-white/5">
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">{t('Avatar')}</th>
                          <th className="px-6 py-4">{t('profile_username')}</th>
                          <th className="px-6 py-4">{t('profile_email')}</th>
                          <th className="px-6 py-4">{t('Status')}</th>
                          <th className="px-6 py-4">{t('Role')}</th>
                          <th className="px-6 py-4 text-right">{t('Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => 
                          u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                        ).map((u) => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-gray-500">#{u.id}</td>
                            <td className="px-6 py-4">
                              <img src={getAvatarUrl(u.avatar || u.username)} alt="avatar" className="w-8 h-8 rounded-full border border-white/10 bg-slate-800" />
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-200">{u.username}</td>
                            <td className="px-6 py-4 text-gray-400">{u.email}</td>
                            <td className="px-6 py-4 space-x-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.isActive ? 'bg-green-500/10 text-greenSuccess' : 'bg-red-500/10 text-redError'
                              }`}>
                                {u.isActive ? t('Active') : t('Deactivated')}
                              </span>
                              {u.isBanned && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-yellowAccent border border-amber-500/20">
                                  {t('Banned')}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === 'ROLE_ADMIN' ? 'bg-yellow-500/10 text-yellowAccent border border-yellow-500/20' : 'bg-blue-500/10 text-primaryBlue'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleViewStats(u)}
                                className="px-2 py-1 text-[10px] font-bold bg-purple-500/10 text-purple-400 hover:bg-purple-950/20 rounded border border-purple-500/20 transition-colors"
                              >
                                {t('Stats')}
                              </button>
                              {u.username !== 'admin' && (
                                <>
                                  <button
                                    onClick={() => handleToggleActive(u)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${
                                      u.isActive 
                                        ? 'bg-amber-500/10 text-yellowAccent border-amber-500/20 hover:bg-amber-950/20' 
                                        : 'bg-green-500/10 text-greenSuccess border-green-500/20 hover:bg-green-950/20'
                                    }`}
                                  >
                                    {u.isActive ? t('Deactivate') : t('Activate')}
                                  </button>
                                  <button
                                    onClick={() => handleToggleBan(u)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${
                                      u.isBanned 
                                        ? 'bg-green-500/10 text-greenSuccess border-green-500/20 hover:bg-green-950/20' 
                                        : 'bg-red-500/10 text-redError border-red-500/20 hover:bg-red-950/20'
                                    }`}
                                  >
                                    {u.isBanned ? t('Unban') : t('Ban')}
                                  </button>
                                  <button
                                    onClick={() => handleChangeRole(u.id, u.role)}
                                    className="px-2 py-1 text-[10px] font-bold bg-blue-500/10 text-primaryBlue hover:bg-blue-950/20 rounded border border-blue-500/20 transition-colors"
                                  >
                                    {t('Role')}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleResetPassword(u.id)}
                                className="px-2 py-1 text-[10px] font-bold bg-gray-500/10 text-gray-300 hover:bg-gray-800 rounded border border-gray-500/20 transition-colors"
                              >
                                {t('Reset Pass')}
                              </button>
                              {u.username !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded transition-colors inline-flex align-middle"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'problems' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl items-end">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">{t('Search Title')}</label>
                      <input
                        type="text"
                        placeholder={t('Search Title...')}
                        className="glass-input text-xs w-full"
                        value={problemSearchQuery}
                        onChange={(e) => setProblemSearchQuery(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">{t('Difficulty')}</label>
                      <select
                        className="w-full bg-darkCard border border-white/10 rounded-lg py-2 px-3 text-xs focus:ring-2 focus:ring-primaryBlue focus:outline-none"
                        value={problemSearchDifficulty}
                        onChange={(e) => setProblemSearchDifficulty(e.target.value)}
                      >
                        <option value="">{t('All Difficulties')}</option>
                        <option value="EASY">{t('Easy')}</option>
                        <option value="MEDIUM">{t('Medium')}</option>
                        <option value="HARD">{t('Hard')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">{t('Tag Name')}</label>
                      <input
                        type="text"
                        placeholder="e.g. Array, Dynamic Programming..."
                        className="glass-input text-xs w-full"
                        value={problemSearchTag}
                        onChange={(e) => setProblemSearchTag(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSearchProblems}
                        className="flex-1 px-4 py-2 bg-primaryBlue hover:bg-blue-600 rounded-lg text-xs text-white font-bold transition-all shadow-md shadow-blue-500/20"
                      >
                        {t('Filter')}
                      </button>
                      <button
                        onClick={() => {
                          setProblemSearchQuery('');
                          setProblemSearchDifficulty('');
                          setProblemSearchTag('');
                          setTimeout(() => fetchData(), 50);
                        }}
                        className="px-3 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs text-gray-400 hover:text-white"
                      >
                        {t('Reset')}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => { resetProblemForm(); setActiveTab('create_problem'); }}
                      className="px-4 py-2.5 bg-primaryBlue hover:bg-blue-600 rounded-lg text-xs text-white font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                    >
                      <Plus className="w-4 h-4" /> {t('Create New Problem')}
                    </button>
                  </div>

                  <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-400 text-xs font-semibold uppercase bg-white/5">
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">{t('Title')}</th>
                          <th className="px-6 py-4">{t('Difficulty')}</th>
                          <th className="px-6 py-4">{t('Tags')}</th>
                          <th className="px-6 py-4 text-right">{t('Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <TableSkeletonRows rows={6} cols={5} />
                        ) : problems.length > 0 ? (
                          problems
                            .slice((adminProblemsPage - 1) * 10, adminProblemsPage * 10)
                            .map((p) => (
                              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-gray-500">#{p.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-200">{p.title}</td>
                                <td className="px-6 py-4 font-semibold">
                                  <DifficultyBadge difficulty={p.difficulty} />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1.5">
                                    {p.tags && p.tags.map((tag) => (
                                      <TagBadge key={tag} tag={tag} />
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <button
                                    onClick={() => handleEditProblemClick(p)}
                                    className="p-2 text-primaryBlue hover:text-blue-400 hover:bg-blue-950/20 rounded-lg transition-colors"
                                    title="Edit Problem"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProblem(p.id)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-colors"
                                    title="Delete Problem"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-500 font-semibold">
                              No problems found matching criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination Controls for Admin Problems */}
                    {!loading && problems.length > 0 && (
                      <div className="border-t border-white/5 px-6 py-2 bg-black/20">
                        <Pagination
                          currentPage={adminProblemsPage}
                          totalPages={Math.ceil(problems.length / 10)}
                          onPageChange={setAdminProblemsPage}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'submissions' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel rounded-2xl overflow-hidden shadow-2xl"
                >
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-400 text-xs font-semibold uppercase bg-white/5">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">{t('User')}</th>
                        <th className="px-6 py-4">{t('Problem')}</th>
                        <th className="px-6 py-4">{t('Language')}</th>
                        <th className="px-6 py-4">{t('Verdict')}</th>
                        <th className="px-6 py-4">{t('Runtime / Memory')}</th>
                        <th className="px-6 py-4">{t('Date')}</th>
                        <th className="px-6 py-4 text-right">{t('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.length > 0 ? (
                        submissions.map((s) => (
                          <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-xs">
                            <td className="px-6 py-4 font-mono font-bold text-gray-500">#{s.id}</td>
                            <td className="px-6 py-4 font-bold text-gray-200">{s.username || s.userId}</td>
                            <td className="px-6 py-4 font-semibold text-gray-300">{s.problemTitle || `Problem #${s.problemId}`}</td>
                            <td className="px-6 py-4 font-mono text-[11px] text-gray-400 uppercase">{s.language}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                s.verdict === 'ACCEPTED' ? 'bg-green-500/10 text-greenSuccess' : 'bg-red-500/10 text-redError'
                              }`}>
                                {s.verdict}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-[11px]">
                              {s.executionTimeMs}ms / {s.executionMemoryKb}KB
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                              {new Date(s.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteSubmission(s.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-10 text-center text-gray-500 italic">{t('No submissions recorded yet.')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel rounded-2xl overflow-hidden shadow-2xl"
                >
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-400 text-xs font-semibold uppercase bg-white/5">
                        <th className="px-6 py-4">{t('Rank')}</th>
                        <th className="px-6 py-4">{t('profile_username')}</th>
                        <th className="px-6 py-4">{t('Solved Count')}</th>
                        <th className="px-6 py-4">{t('Score')}</th>
                        <th className="px-6 py-4 text-right">{t('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.length > 0 ? (
                        leaderboard.map((l, idx) => (
                          <tr key={l.id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-yellowAccent">#{idx + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-200">{l.username}</td>
                            <td className="px-6 py-4 font-semibold text-gray-300">{l.solvedCount} {t('problems')}</td>
                            <td className="px-6 py-4 font-bold text-emerald-400">{l.score} {t('pts')}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteLeaderboard(l.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">{t('No rankings recorded yet.')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'create_problem' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel p-8 rounded-2xl shadow-2xl"
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primaryBlue" /> {isEditing ? t('Modify Problem Settings') : t('Create New Problem Profile')}
                  </h3>

                  <form onSubmit={handleSaveProblem} className="space-y-6">
                    {/* Basic specs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Title</label>
                        <input
                          type="text"
                          placeholder="Two Sum"
                          className="w-full glass-input"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Difficulty</label>
                        <select
                          className="w-full bg-darkCard border border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primaryBlue focus:outline-none"
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Tags (comma separated)</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Array, Hash Table"
                            className="w-full glass-input pl-9"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                          />
                          <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    </div>

                    {/* Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Execution Time Limit (ms)</label>
                        <input
                          type="number"
                          className="w-full glass-input"
                          value={timeLimitMs}
                          onChange={(e) => setTimeLimitMs(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Memory Limit (MB)</label>
                        <input
                          type="number"
                          className="w-full glass-input"
                          value={memoryLimitMb}
                          onChange={(e) => setMemoryLimitMb(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Description (Markdown Supported)</label>
                      <textarea
                        placeholder="Write problem statement details here..."
                        className="w-full glass-input h-32 font-sans text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Constraints */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Constraints</label>
                      <textarea
                        placeholder="Write constraint equations..."
                        className="w-full glass-input h-20 font-mono text-xs"
                        value={constraints}
                        onChange={(e) => setConstraints(e.target.value)}
                      />
                    </div>

                    {/* Editor Templates */}
                    <div className="border-t border-white/5 my-6 pt-6">
                      <h4 className="text-sm font-semibold text-gray-300 mb-4">Starter Code Templates</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1.5">Python Starter</label>
                          <textarea
                            placeholder="def solve(x):"
                            className="w-full glass-input h-24 font-mono text-xs"
                            value={starterPython}
                            onChange={(e) => setStarterPython(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1.5">Java Starter</label>
                          <textarea
                            placeholder="class Solution { ... }"
                            className="w-full glass-input h-24 font-mono text-xs"
                            value={starterJava}
                            onChange={(e) => setStarterJava(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1.5">JavaScript Starter</label>
                          <textarea
                            placeholder="function solve() { ... }"
                            className="w-full glass-input h-24 font-mono text-xs"
                            value={starterJs}
                            onChange={(e) => setStarterJs(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Editorial */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Author's Editorial</label>
                      <textarea
                        placeholder="Detailed algorithmic approach writeup..."
                        className="w-full glass-input h-32 font-sans text-sm"
                        value={editorial}
                        onChange={(e) => setEditorial(e.target.value)}
                      />
                    </div>

                    {/* Hints Builder */}
                    <div className="border-t border-white/5 my-6 pt-6">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                        <HelpCircle className="w-4.5 h-4.5 text-purple-400" /> Hints Constructor
                      </h4>
                      <div className="flex gap-3 mb-4">
                        <input
                          type="text"
                          placeholder="e.g. Try hash lookup..."
                          className="flex-1 glass-input text-xs"
                          value={newHint}
                          onChange={(e) => setNewHint(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={handleAddHint}
                          className="px-4 bg-purple-600 hover:bg-purple-700 text-xs font-bold rounded-lg text-white"
                        >
                          Add Hint
                        </button>
                      </div>
                      <div className="space-y-2">
                        {hints.map((h, i) => (
                          <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 text-xs">
                            <span className="text-gray-300">Hint #{h.hintNumber}: {h.content}</span>
                            <button
                              type="button"
                              onClick={() => setHints(hints.filter((_, idx) => idx !== i))}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test Cases Builder */}
                    <div className="border-t border-white/5 my-6 pt-6">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                        <CheckSquare className="w-4.5 h-4.5 text-emerald-400" /> Evaluation Test Cases Constructor
                      </h4>
                      
                      <div className="space-y-3 p-4 bg-white/5 border border-white/5 rounded-xl mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Standard Input (stdin)</label>
                            <textarea
                              placeholder="[2, 7, 11, 15]\n9"
                              className="w-full glass-input h-20 font-mono text-xs"
                              value={tcInput}
                              onChange={(e) => setTcInput(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Expected Output (stdout)</label>
                            <textarea
                              placeholder="[0, 1]"
                              className="w-full glass-input h-20 font-mono text-xs"
                              value={tcOutput}
                              onChange={(e) => setTcOutput(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={tcHidden}
                            onChange={(e) => setTcHidden(e.target.checked)}
                          />
                          <label className="text-xs text-gray-400">Is this a hidden evaluation test case?</label>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTestCase}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-lg text-white"
                        >
                          Queue Test Case
                        </button>
                      </div>

                      <div className="space-y-2">
                        {testCases.map((tc, i) => (
                          <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 text-xs">
                            <div>
                              <span className="font-bold text-gray-300">Test Case #{i+1}: </span>
                              <span className="text-gray-400">In: {tc.input.substring(0, 30)} | Out: {tc.expectedOutput.substring(0, 30)}</span>
                              {tc.isHidden && <span className="text-yellow-400 ml-2 font-bold">(HIDDEN)</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => setTestCases(testCases.filter((_, idx) => idx !== i))}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => { resetProblemForm(); setActiveTab('problems'); fetchData(); }}
                        className="px-4 py-2.5 border border-white/10 hover:bg-white/5 rounded-lg text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-primaryBlue hover:bg-blue-600 rounded-lg text-xs text-white font-bold shadow-lg shadow-blue-500/20"
                      >
                        {isEditing ? 'Update Problem' : 'Publish Problem'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* User Stats Modal */}
        {isStatsModalOpen && selectedUserStats && statsUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-darkCard border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <img src={getAvatarUrl(statsUser.avatar || statsUser.username)} alt="avatar" className="w-12 h-12 rounded-full border border-white/10 bg-slate-800" />
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{statsUser.username} Statistics</h2>
                    <p className="text-xs text-gray-400">{statsUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsStatsModalOpen(false)}
                  className="px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-xs text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Solved Count</div>
                  <div className="text-2xl font-extrabold mt-1 text-primaryBlue">{selectedUserStats.solvedCount}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Total Score</div>
                  <div className="text-2xl font-extrabold mt-1 text-emerald-400">{selectedUserStats.score} pts</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Acceptance Rate</div>
                  <div className="text-2xl font-extrabold mt-1 text-yellowAccent">
                    {selectedUserStats.acceptanceRate ? selectedUserStats.acceptanceRate.toFixed(1) : 0.0}%
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Current / Max Streak</div>
                  <div className="text-xl font-extrabold mt-1.5 text-purple-400">
                    {selectedUserStats.currentStreak} / {selectedUserStats.longestStreak} days
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Submission Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Submissions:</span>
                    <span className="font-semibold text-white">{selectedUserStats.totalSubmissions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Accepted Submissions:</span>
                    <span className="font-semibold text-greenSuccess">{selectedUserStats.acceptedSubmissions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rejected Submissions:</span>
                    <span className="font-semibold text-redError">
                      {selectedUserStats.totalSubmissions - selectedUserStats.acceptedSubmissions}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Profile Information</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Full Name:</span>
                    <span className="font-semibold text-white">{statsUser.name || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400 block mb-0.5">Bio:</span>
                    <span className="text-gray-300 italic">{statsUser.bio || 'No bio written yet.'}</span>
                  </div>
                </div>
              </div>

              {/* Submissions History table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Recent Submissions (Last 10)</h4>
                <div className="border border-white/5 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-400 bg-white/5">
                        <th className="px-4 py-2.5">ID</th>
                        <th className="px-4 py-2.5">Problem</th>
                        <th className="px-4 py-2.5">Language</th>
                        <th className="px-4 py-2.5">Verdict</th>
                        <th className="px-4 py-2.5">Runtime</th>
                        <th className="px-4 py-2.5">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserStats.recentSubmissions && selectedUserStats.recentSubmissions.length > 0 ? (
                        selectedUserStats.recentSubmissions.map((s) => (
                          <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-2 font-mono font-bold text-gray-500">#{s.id}</td>
                            <td className="px-4 py-2 font-semibold text-gray-200">{s.problemTitle}</td>
                            <td className="px-4 py-2 font-mono uppercase text-[10px] text-gray-400">{s.language}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.verdict === 'ACCEPTED' ? 'bg-green-500/10 text-greenSuccess' : 'bg-red-500/10 text-redError'
                              }`}>
                                {s.verdict}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-400">{s.executionTimeMs}ms</td>
                            <td className="px-4 py-2 text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-4 py-6 text-center text-gray-500 italic">No submissions logged yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </div>
      <TypographyModal isOpen={typographyOpen} onClose={() => setTypographyOpen(false)} />
    </PageTransition>
  );
};

export default Admin;
