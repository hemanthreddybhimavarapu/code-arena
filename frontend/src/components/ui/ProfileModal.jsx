import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, User, Mail, Globe, MapPin, Calendar, Briefcase, 
  GraduationCap, Code, ChevronRight, Github, Linkedin, Twitter, FileText, Check, Loader2, Type, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';
import TypographyModal from './TypographyModal';

const AVATAR_LIBRARY = [
  // 3D & AI
  { id: '3d-1', name: '3D Bot AI', category: '3d', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
  { id: '3d-2', name: '3D Cyborg', category: '3d', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe' },
  { id: '3d-3', name: '3D Mech Pro', category: '3d', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Byte' },
  { id: '3d-4', name: '3D Spark Bot', category: '3d', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cipher' },
  { id: '3d-5', name: '3D Quantum', category: '3d', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha' },
  { id: '3d-6', name: '3D Titan', category: '3d', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Omega' },

  // Anime & Cyber
  { id: 'anime-1', name: 'Anime Shadow', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow' },
  { id: 'anime-2', name: 'Anime Wizard', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Merlin' },
  { id: 'anime-3', name: 'Cyber Neon', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Neon' },
  { id: 'anime-4', name: 'Kira Cyberpunk', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kira' },
  { id: 'anime-5', name: 'Blade Coder', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Blade' },
  { id: 'anime-6', name: 'Valkyrie Dev', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Valkyrie' },

  // People & Expressions (Male, Female, Neutral, Expressions, Skin Tones, Hairstyles)
  { id: 'p-1', name: 'Alex Tech (Male)', category: 'people', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'p-2', name: 'Sam Engineer (Male)', category: 'people', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
  { id: 'p-3', name: 'Maya Lead (Female)', category: 'people', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya' },
  { id: 'p-4', name: 'David Architect (Male)', category: 'people', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { id: 'p-5', name: 'Elena Designer (Female)', category: 'people', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Elena' },
  { id: 'p-6', name: 'Marcus Dev (Male)', category: 'people', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Marcus' },
  { id: 'p-7', name: 'Aria Hacker (Female)', category: 'people', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Aria' },
  { id: 'p-8', name: 'Jordan Coder (Neutral)', category: 'people', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Jordan' },
  { id: 'p-9', name: 'Happy Coder (Smile)', category: 'people', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Happy' },
  { id: 'p-10', name: 'Techie Female', category: 'people', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophie' },

  // Pixel & Modern
  { id: 'pixel-1', name: 'Pixel Hero', category: 'pixel', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel1' },
  { id: 'pixel-2', name: 'Pixel Mage', category: 'pixel', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel2' },
  { id: 'pixel-3', name: 'Pixel Ninja', category: 'pixel', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel3' },
  { id: 'pixel-4', name: 'Notionist Scholar', category: 'pixel', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Notion1' },
  { id: 'pixel-5', name: 'Notionist Maker', category: 'pixel', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Notion2' },
  { id: 'pixel-6', name: 'Mini Avatar', category: 'pixel', url: 'https://api.dicebear.com/7.x/miniavs/svg?seed=Mini' },
];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, showToast, updateAvatar, getAvatarUrl, t } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    gender: user?.gender || 'Prefer not to say',
    location: user?.location || '',
    birthday: user?.birthday || '',
    website: user?.website || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    twitter: user?.twitter || '',
    bio: user?.bio || '',
    work: user?.work || '',
    education: user?.education || '',
    skills: user?.skills || '',
    avatar: user?.avatar || '',
  });

  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload'
  const [avatarCategory, setAvatarCategory] = useState('all'); // 'all' | '3d' | 'anime' | 'people' | 'pixel'
  const [loading, setLoading] = useState(false);
  const [activeSubModal, setActiveSubModal] = useState(null);
  const [typographyOpen, setTypographyOpen] = useState(false);

  const generalItems = [
    { key: 'name', label: t('Display Name'), icon: User, value: formData.name || t('Not specified') },
    { key: 'gender', label: t('Gender'), icon: User, value: t(formData.gender) },
    { key: 'location', label: t('Location'), icon: MapPin, value: formData.location || t('Not specified') },
    { key: 'birthday', label: t('Birthday'), icon: Calendar, value: formData.birthday || t('Not specified') },
    { key: 'website', label: t('Website'), icon: Globe, value: formData.website || t('Not specified') },
    { key: 'github', label: t('GitHub'), icon: Github, value: formData.github || t('Not specified') },
    { key: 'linkedin', label: t('LinkedIn'), icon: Linkedin, value: formData.linkedin || t('Not specified') },
    { key: 'twitter', label: t('Twitter'), icon: Twitter, value: formData.twitter || t('Not specified') },
  ];

  const experienceItems = [
    { key: 'work', label: t('Work'), icon: Briefcase, value: formData.work || t('Not specified') },
    { key: 'education', label: t('Education'), icon: GraduationCap, value: formData.education || t('Not specified') },
    { key: 'skills', label: t('Skills'), icon: Code, value: formData.skills || t('Not specified') },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.username || '',
        gender: user.gender || 'Prefer not to say',
        location: user.location || '',
        birthday: user.birthday || '',
        website: user.website || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        bio: user.bio || '',
        work: user.work || '',
        education: user.education || '',
        skills: user.skills || '',
        avatar: user.avatar || '',
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectAvatar = (url) => {
    handleChange('avatar', url);
    showToast(t('Selected avatar! Click Save Changes to apply.'), 'info');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast(t('Image size must be less than 2MB'), 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatar', reader.result);
        showToast(t('Avatar preview updated! Click Save Changes to apply.'), 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', {
        name: formData.name,
        avatar: formData.avatar,
        bio: formData.bio,
      });
      updateAvatar(formData.avatar, formData.name);
      showToast(t('Profile settings saved successfully!'), 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to update profile settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAvatars = AVATAR_LIBRARY.filter(av => 
    avatarCategory === 'all' ? true : av.category === avatarCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6 text-gray-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-primaryBlue" />
            {t('profile_title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Preview Avatar & Tab Switcher */}
          <div className="flex flex-col items-center justify-center space-y-4 pb-5 border-b border-gray-200 dark:border-white/10">
            <div className="relative group">
              <img
                src={formData.avatar || getAvatarUrl(user?.username)}
                alt="Live Avatar Preview"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-primaryBlue/80 shadow-2xl transition-all group-hover:scale-105"
              />
              <span className="absolute -bottom-2 -right-2 p-1.5 bg-primaryBlue text-white rounded-full shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-lg">{formData.name || user?.username}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{user?.email}</p>
            </div>

            {/* Avatar Mode Tabs */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'gallery' ? 'bg-primaryBlue text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> {t('profile_gallery')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'upload' ? 'bg-primaryBlue text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> {t('profile_upload')}
              </button>
            </div>

            {/* Avatar Category Filter Pills (Gallery Tab) */}
            {activeTab === 'gallery' && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center text-[11px] font-semibold pt-1">
                {[
                  { id: 'all', label: 'All Avatars' },
                  { id: '3d', label: '🤖 3D & AI' },
                  { id: 'anime', label: '🌸 Anime & Cyber' },
                  { id: 'people', label: '👤 People & Styles' },
                  { id: 'pixel', label: '🎨 Pixel & Modern' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAvatarCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full border transition-all ${
                      avatarCategory === cat.id
                        ? 'bg-primaryBlue/20 border-primaryBlue text-primaryBlue font-bold'
                        : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Avatar Gallery Selector Grid */}
            {activeTab === 'gallery' ? (
              <div className="w-full grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-3 bg-gray-50 dark:bg-black/30 rounded-2xl border border-gray-200 dark:border-white/10 max-h-52 overflow-y-auto">
                {filteredAvatars.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleSelectAvatar(av.url)}
                    className={`relative p-1 rounded-xl transition-all hover:scale-105 border ${
                      formData.avatar === av.url ? 'border-primaryBlue bg-primaryBlue/20 shadow-lg ring-2 ring-primaryBlue' : 'border-transparent hover:border-white/20'
                    }`}
                    title={av.name}
                  >
                    <img src={av.url} alt={av.name} className="w-12 h-12 rounded-lg object-cover mx-auto" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl bg-gray-50 dark:bg-black/20 text-center">
                <Camera className="w-8 h-8 text-primaryBlue mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Upload custom image file (JPG, PNG, WebP max 2MB)</p>
                <label htmlFor="avatar-file-input" className="px-4 py-2 bg-primaryBlue hover:bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-lg">
                  Choose Image File
                </label>
                <input
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* General Section */}
          <div className="space-y-3">
            <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">{t('General')}</div>
            <p className="text-xs text-gray-400">{t('Manage your basic profile information.')}</p>

            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 divide-y divide-gray-200 dark:divide-white/5">
              {generalItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    onClick={() => setActiveSubModal(item.key)}
                    className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium max-w-[200px] truncate">{item.value}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">{t('EXPERIENCE')}</div>
            <p className="text-xs text-gray-400">{t('Share your growth from learning to career.')}</p>

            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 divide-y divide-gray-200 dark:divide-white/5">
              {experienceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    onClick={() => setActiveSubModal(item.key)}
                    className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium max-w-[200px] truncate">{item.value}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Appearance & Typography Section */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">{t('APPEARANCE & TYPOGRAPHY')}</div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" onClick={() => setTypographyOpen(true)}>
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs font-bold">{t('Typography & Font Settings')}</div>
                  <div className="text-[11px] text-gray-400">{t('Font family, size scale & interface density')}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            {t('btn_cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-primaryBlue hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {t('btn_save')}
          </button>
        </div>
      </motion.div>

      {/* Sub Edit Dialog */}
      <AnimatePresence>
        {activeSubModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-gray-900 dark:text-white"
            >
              <h3 className="text-base font-extrabold mb-4 capitalize">Edit {activeSubModal}</h3>
              <input
                type="text"
                value={formData[activeSubModal] || ''}
                onChange={(e) => handleChange(activeSubModal, e.target.value)}
                placeholder={`Enter your ${activeSubModal}...`}
                className="w-full glass-input text-xs py-2.5 mb-4 text-gray-900 dark:text-white bg-gray-100 dark:bg-black/30 border-gray-300 dark:border-white/10"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveSubModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TypographyModal isOpen={typographyOpen} onClose={() => setTypographyOpen(false)} />
    </div>
  );
};

export default ProfileModal;
