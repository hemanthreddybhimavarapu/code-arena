import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, Send, Mail, User, CheckCircle, ShieldCheck, Heart, Sparkles, X, 
  Loader2, Globe, HelpCircle, Briefcase, FileText, Lock, Building2 
} from 'lucide-react';
import axios from 'axios';
import api from '../../utils/api';
import { useApp } from '../../context/AppContext';
import { isAdminUser } from '../../utils/admin';

export const Footer = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoModal, setInfoModal] = useState(null); // 'about', 'careers', 'privacy', 'terms'
  const { user, showToast, t } = useApp();

  if (isAdminUser(user) || location.pathname.startsWith('/admin')) {
    return null;
  }

  const [formData, setFormData] = useState({
    name: user?.name || user?.username || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showToast('Please fill in all contact fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      showToast('Message sent! Support team will respond shortly.', 'success');
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
        setFormData({
          name: user?.name || user?.username || '',
          email: user?.email || '',
          subject: '',
          message: '',
        });
      }, 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send message. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const modalContents = {
    about: {
      title: t('About CodeArena SaaS Inc.'),
      icon: <Building2 className="w-5 h-5 text-primaryBlue" />,
      content: t('CodeArena 7.0 is a commercial-grade competitive programming and developer evaluation platform powered by sandboxed Docker containers. We deliver multi-language real-time code compilation, performance metrics, and global ranking leaderboards for software engineers worldwide.'),
    },
    careers: {
      title: t('Careers & Opportunities'),
      icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
      content: t('We are expanding our engineering and developer infrastructure team! Open positions include Senior Backend Engineer (Java / Distributed Systems), Security Engineer (Docker Sandbox), and Frontend Engineer (React / Performance).'),
    },
    privacy: {
      title: t('Privacy Policy'),
      icon: <Lock className="w-5 h-5 text-purple-400" />,
      content: t('Your privacy and data security are our top priorities. CodeArena encrypts all authentication credentials, submission telemetry, and support inquiries. We never share user data with third parties.'),
    },
    terms: {
      title: t('Terms of Service'),
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      content: t('By accessing CodeArena 7.0, you agree to comply with platform usage guidelines. Automated scraping, malicious code execution in sandbox environments, and improper account sharing are strictly prohibited.'),
    },
  };

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-slate-950/95 dark:bg-gray-950/95 backdrop-blur-2xl text-gray-400 text-sm z-10 w-full">
      {/* Top Subtle Gradient Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-primaryBlue via-indigo-500 to-purple-600 opacity-80" />

      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2 pr-0 md:pr-6">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primaryBlue to-indigo-600 shadow-lg shadow-primaryBlue/30 text-white">
                <Code className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black text-white">Code<span className="text-yellowAccent">Arena</span></span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primaryBlue/20 text-primaryBlue border border-primaryBlue/30 font-extrabold tracking-wide uppercase">7.0 SaaS</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md font-sans">
              {t('footer_tagline')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shadow-inner">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{t('footer_operational')}</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-outfit border-l-2 border-primaryBlue pl-2.5">{t('footer_platform')}</h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li><a href="/problems" className="hover:text-primaryBlue hover:translate-x-1 inline-block transition-all text-gray-300">{t('nav_problems')}</a></li>
              <li><a href="/leaderboard" className="hover:text-primaryBlue hover:translate-x-1 inline-block transition-all text-gray-300">{t('nav_leaderboard')}</a></li>
              <li><a href="/dashboard" className="hover:text-primaryBlue hover:translate-x-1 inline-block transition-all text-gray-300">{t('nav_dashboard')}</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-outfit border-l-2 border-indigo-500 pl-2.5">{t('footer_company')}</h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li><button onClick={() => setInfoModal('about')} className="hover:text-primaryBlue hover:translate-x-1 inline-block transition-all text-gray-300 text-left">{t('footer_about')}</button></li>
              <li><button onClick={() => setInfoModal('careers')} className="hover:text-primaryBlue hover:translate-x-1 inline-block transition-all text-gray-300 text-left">{t('footer_careers')}</button></li>
              <li><button onClick={() => setInfoModal('privacy')} className="hover:text-primaryBlue hover:translate-x-1 inline-block transition-all text-gray-300 text-left">{t('footer_privacy')}</button></li>
              <li><button onClick={() => setInfoModal('terms')} className="hover:text-primaryBlue hover:translate-x-1 inline-block transition-all text-gray-300 text-left">{t('footer_terms')}</button></li>
            </ul>
          </div>

          {/* Support & Help */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-outfit border-l-2 border-purple-500 pl-2.5">{t('footer_support')}</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              {t('footer_contact_desc')}
            </p>
            <button
              id="contact-footer-btn"
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primaryBlue via-indigo-600 to-purple-600 hover:from-primaryBlue/90 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-primaryBlue/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Send className="h-4 w-4" />
              {t('footer_contact_btn')}
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          <p className="text-gray-400">© {new Date().getFullYear()} CodeArena 7.0 SaaS Inc. {t('footer_rights')}</p>
          <div className="flex items-center gap-1.5 text-gray-400 font-semibold bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by Core Engineering Team at CodeArena</span>
          </div>
        </div>
      </div>

      {/* Info Modals */}
      <AnimatePresence>
        {infoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-gray-900 border border-white/15 rounded-2xl p-6 text-white shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5 font-bold text-lg">
                  {modalContents[infoModal].icon}
                  <span>{modalContents[infoModal].title}</span>
                </div>
                <button
                  onClick={() => setInfoModal(null)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed py-2">
                {modalContents[infoModal].content}
              </p>

              <div className="border-t border-white/10 pt-4 mt-6 flex justify-end">
                <button
                  onClick={() => setInfoModal(null)}
                  className="px-4 py-2 bg-primaryBlue hover:bg-blue-600 rounded-lg text-xs font-bold text-white transition-all shadow-md shadow-blue-500/20"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Working Contact Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-gray-900/95 dark:bg-gray-950/95 text-white shadow-2xl backdrop-blur-2xl z-10 p-6 sm:p-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="h-10 w-10 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{t('Message Sent Successfully!')}</h3>
                  <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                    {t('Your inquiry has been stored in real time and delivered to our support team. We will reply to')} <strong>{formData.email}</strong>.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-primaryBlue/20 border border-primaryBlue/30 text-primaryBlue">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">{t('Contact Support')}</h3>
                      <p className="text-xs text-gray-400">{t('Send an inquiry directly to the CodeArena admin')}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t('Your Name')}</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full glass-input glass-input-icon text-xs py-2.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t('Your Email Address')}</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="w-full glass-input glass-input-icon text-xs py-2.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t('Subject')}</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder={t('Platform feedback, bug report, or assistance')}
                        className="w-full glass-input text-xs py-2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t('Message')}</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder={t('Describe your inquiry in detail...')}
                        className="w-full glass-input text-xs py-2.5 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primaryBlue to-indigo-600 hover:from-primaryBlue/90 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-primaryBlue/25 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('Sending Message...')}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {t('Send Support Message')}
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
