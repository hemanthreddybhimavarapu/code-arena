import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Award, Users2, Zap, ArrowRight, Sparkles, Code2, 
  CheckCircle, Globe, Shield, HelpCircle, Mail, Briefcase, FileText, Lock, X
} from 'lucide-react';
import Lottie from 'lottie-react';
import { useApp } from '../context/AppContext';
import codingHeroAnimation from '../assets/lottie/coding_hero.json';
import TextType from '../components/ui/TextType';
import RotatingText from '../components/ui/RotatingText';
import ShinyText from '../components/ui/ShinyText';
import CountUp from '../components/ui/CountUp';
import MagicBento, { MagicBentoCard } from '../components/ui/MagicBento';
import PageTransition from '../components/ui/PageTransition';
import TechMarquee from '../components/ui/TechMarquee';
import MagneticButton from '../components/ui/MagneticButton';

const Home = () => {
  const { token, t, uiLanguage } = useApp();
  const [activeModal, setActiveModal] = useState(null); // 'about', 'faq', 'support', 'contact', 'careers', 'terms', 'privacy', 'docs'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } },
  };

  const modalContents = {
    about: {
      title: t('About CodeArena 7.0'),
      icon: <Code2 className="w-6 h-6 text-primaryBlue" />,
      content: (
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong>CodeArena 7.0</strong> {t('is an enterprise-grade algorithmic assessment and practice engine designed for developers, engineering teams, and computer science students globally.')}
          </p>
          <p>
            {t('Our infrastructure leverages isolated Docker containers to execute code securely with strict resource limits, offering real-time evaluation across Java, Python, C++, C, and JavaScript.')}
          </p>
          <p className="text-xs text-gray-400">
            {t('Founded with the vision of elevating analytical thinking and problem-solving excellence.')}
          </p>
        </div>
      ),
    },
    faq: {
      title: t('Frequently Asked Questions'),
      icon: <HelpCircle className="w-6 h-6 text-yellowAccent" />,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <h4 className="font-bold text-white mb-1">{t('What compilers and runtimes are supported?')}</h4>
            <p className="text-xs text-gray-400">{t('Java 17 (OpenJDK), Python 3.11, GCC 12 (C/C++), and Node.js v20 runtime engines.')}</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-1">{t('How is code execution secured?')}</h4>
            <p className="text-xs text-gray-400">{t('All user submissions execute inside non-root, isolated Docker containers with non-networked sandboxing and CPU/memory caps.')}</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-1">{t('How do streaks and leaderboard points work?')}</h4>
            <p className="text-xs text-gray-400">{t('Points are awarded based on problem difficulty. Submitting accepted solutions daily maintains your active streak badge.')}</p>
          </div>
        </div>
      ),
    },
    support: {
      title: t('Support & Help Centre'),
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-sm text-gray-300">
          <p>{t('Need assistance with your account, compiler timeouts, or problem reports?')}</p>
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{t('Email Support:')}</span>
              <span className="text-primaryBlue">support@codearena.dev</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{t('Community Forum:')}</span>
              <span className="text-emerald-400 font-semibold">{t('Active 24/7')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{t('Platform Status:')}</span>
              <span className="text-greenSuccess font-semibold">{t('All Systems Operational (99.99%)')}</span>
            </div>
          </div>
        </div>
      ),
    },
    contact: {
      title: t('Contact Engineering Team'),
      icon: <Mail className="w-6 h-6 text-indigo-400" />,
      content: (
        <div className="space-y-3 text-sm text-gray-300">
          <p>{t('Get in touch for enterprise licensing, institutional partnerships, or technical inquiries.')}</p>
          <div className="space-y-2 text-xs text-gray-400">
            <p><strong>{t('Headquarters:')}</strong> CodeArena HQ, Suite 400, Tech Park</p>
            <p><strong>{t('General Inquiries:')}</strong> contact@codearena.dev</p>
            <p><strong>{t('Press & Media:')}</strong> media@codearena.dev</p>
          </div>
        </div>
      ),
    },
    careers: {
      title: t('Careers at CodeArena'),
      icon: <Briefcase className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-3 text-sm text-gray-300">
          <p>{t("We are building the world's most performant developer evaluation platform. Join our distributed engineering team!")}</p>
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-white">{t('Open Roles:')}</div>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>{t('Senior Backend Engineer (Java / Distributed Systems)')}</li>
              <li>{t('Frontend Architect (React / Performance)')}</li>
              <li>{t('Infrastructure & Security Engineer (Docker / Kubernetes)')}</li>
            </ul>
          </div>
        </div>
      ),
    },
    terms: {
      title: t('Terms of Service'),
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      content: (
        <div className="space-y-3 text-xs text-gray-300 leading-relaxed max-h-60 overflow-y-auto pr-2">
          <p>{t('By accessing or using CodeArena 7.0, you agree to comply with our platform policies.')}</p>
          <p><strong>{t('1. Code Submissions:')}</strong> {t('Users retain ownership of their submitted code. CodeArena reserves the right to evaluate submissions using automated test cases.')}</p>
          <p><strong>{t('2. Fair Usage:')}</strong> {t('Automated scraping, bot submissions, or malicious exploits targeting the sandboxed compiler are strictly prohibited and result in account termination.')}</p>
        </div>
      ),
    },
    privacy: {
      title: t('Privacy Policy'),
      icon: <Lock className="w-6 h-6 text-red-400" />,
      content: (
        <div className="space-y-3 text-xs text-gray-300 leading-relaxed max-h-60 overflow-y-auto pr-2">
          <p>{t('Your privacy is paramount at CodeArena. We do not sell your personal data.')}</p>
          <p><strong>{t('Data Collected:')}</strong> {t('Email address, display username, submission records, and analytical telemetry for leaderboard scoring.')}</p>
          <p><strong>{t('Security:')}</strong> {t('All passwords are hashed using BCrypt cryptographic standards. Communication is encrypted via TLS 1.3.')}</p>
        </div>
      ),
    },
    docs: {
      title: t('Platform Documentation'),
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-sm text-gray-300">
          <p>{t('Explore full documentation on problem formats, API specifications, custom testcase execution, and time limit calculations.')}</p>
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1 text-gray-400">
            <p>• <strong>{t('Compiler Limits:')}</strong> 5.0s CPU time cap per test case, 512MB RAM cap.</p>
            <p>• <strong>{t('Standard Streams:')}</strong> Read inputs from <code>stdin</code> and write results to <code>stdout</code>.</p>
          </div>
        </div>
      ),
    },
  };

  return (
    <PageTransition key={uiLanguage} className="relative min-h-[calc(100vh-73px)] w-full overflow-hidden bg-darkBg text-white flex flex-col items-center justify-between">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primaryBlue/20 blur-[100px] animated-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-purple-600/20 blur-[120px] animated-blob-delay pointer-events-none" />

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl px-6 pt-16 pb-16 flex flex-col md:flex-row items-center justify-between gap-12 z-10 text-center md:text-left"
      >
        {/* Left Column: Text Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          {/* Glow Tag with ShinyText */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-bold tracking-wider mb-8 shadow-lg shadow-yellow-500/20 float-glow blink-live"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellowAccent" />
            <ShinyText text={t('CODEARENA 7.0 IS LIVE')} speed={3} />
          </motion.div>

          {/* Headline with TextType */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white"
          >
            <TextType text={t('Practice. Compile.')} speed={60} /><br />
            <span className="bg-gradient-to-r from-primaryBlue via-purple-500 to-yellowAccent bg-clip-text text-transparent flex items-center justify-center md:justify-start gap-2">
              <RotatingText words={[t('Compete.'), t('Conquer.'), t('Master.'), t('Elevate.')]} interval={2500} />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-slate-600 dark:text-gray-400 text-base md:text-lg max-w-xl mb-10 font-medium leading-relaxed"
          >
            {t('An elite online judge and coding arena. Code in multiple languages, compile inside sandboxed Docker containers, compete in real-time leaderboards, and elevate your analytical performance.')}
          </motion.p>

          {/* Action Button */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to={token ? "/problems" : "/register"}
              className="group px-8 py-4 bg-gradient-to-r from-primaryBlue to-purple-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-blue-500/20 btn-glow"
            >
              {t('Start Coding Now')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/leaderboard"
              className="px-8 py-4 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl text-slate-800 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white font-semibold transition-all flex items-center justify-center btn-glow"
            >
              {t('View Arena Standings')}
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Lottie Hero Animation */}
        <motion.div
          variants={itemVariants}
          className="flex-1 w-full max-w-[380px] md:max-w-[420px]"
        >
          <div className="glass-panel p-4 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md max-h-[340px] flex items-center justify-center">
            <Lottie animationData={codingHeroAnimation} loop={true} className="w-full h-auto max-h-[280px]" />
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/10 blur-xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-500/15 blur-2xl" />
          </div>
        </motion.div>
      </motion.div>

      {/* Infinite Tech Stack Marquee */}
      <div className="w-full z-10 my-4">
        <TechMarquee />
      </div>

      {/* Platform Statistics Section */}
      <div className="w-full max-w-6xl px-6 py-12 z-10">
        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">
              <CountUp end={50000} suffix="+" duration={2} />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{t('Submissions Evaluated')}</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-primaryBlue">
              <CountUp end={500} suffix="+" duration={2} />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{t('Algorithmic Tasks')}</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-yellowAccent">
              <CountUp end={12000} suffix="+" duration={2} />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{t('Active Developers')}</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-purple-400">
              <CountUp end={99.9} decimals={1} suffix="%" duration={2} />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{t('Docker Uptime')}</div>
          </div>
        </div>
      </div>

      {/* Magic Bento Section */}
      <div className="w-full max-w-6xl px-6 pb-16 z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight">{t('Engineered for High-Performance Coding')}</h2>
          <p className="text-gray-400 text-sm mt-2">{t('State-of-the-art features powering competitive programming')}</p>
        </div>
        <MagicBento>
          <MagicBentoCard spotlightColor="rgba(59, 130, 246, 0.25)" className="flex flex-col gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-primaryBlue rounded-xl w-fit">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-100">{t('Multi-Lang Compiler')}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('Write solutions in Java 17, Python 3.11, GCC, G++, and Node.js with instant execution response.')}
            </p>
          </MagicBentoCard>

          <MagicBentoCard spotlightColor="rgba(168, 85, 247, 0.25)" className="flex flex-col gap-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl w-fit">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-100">{t('Sandboxed Execution')}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('Code runs securely inside isolated Docker containers with strict memory & CPU time caps.')}
            </p>
          </MagicBentoCard>

          <MagicBentoCard spotlightColor="rgba(250, 204, 21, 0.25)" className="flex flex-col gap-4">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellowAccent rounded-xl w-fit animate-pulse">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-100">{t('Gamified Dashboard')}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('Track streaks, solve statistics via Recharts, and claim custom profile achievement cards.')}
            </p>
          </MagicBentoCard>

          <MagicBentoCard spotlightColor="rgba(16, 185, 129, 0.25)" className="flex flex-col gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-100">{t('Global Standings')}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('Compare metrics with developers worldwide on the real-time arena leaderboard.')}
            </p>
          </MagicBentoCard>
        </MagicBento>
      </div>

      {/* CTA Section */}
      <div className="w-full max-w-6xl px-6 pb-20 z-10">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 text-center flex flex-col items-center gap-6 relative overflow-hidden bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-slate-900/30">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-2xl">
            {t('Ready to Accelerate Your Algorithmic Skillset?')}
          </h2>
          <p className="text-gray-300 text-sm md:text-base max-w-xl">
            {t('Join thousands of software engineers practicing data structures, algorithms, and competitive coding on CodeArena.')}
          </p>
          <Link
            to={token ? "/problems" : "/register"}
            className="px-8 py-4 bg-gradient-to-r from-primaryBlue to-purple-600 rounded-xl text-white font-extrabold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 btn-glow"
          >
            {t('Get Started For Free')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Commercial SaaS Footer */}


      {/* Footer Informational Modals */}
      <AnimatePresence>
        {activeModal && modalContents[activeModal] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-darkCard border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5 font-bold text-lg">
                  {modalContents[activeModal].icon}
                  <span>{modalContents[activeModal].title}</span>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-2">
                {modalContents[activeModal].content}
              </div>

              <div className="border-t border-white/10 pt-4 mt-6 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-primaryBlue hover:bg-blue-600 rounded-lg text-xs font-bold text-white transition-all shadow-md shadow-blue-500/20"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Home;
