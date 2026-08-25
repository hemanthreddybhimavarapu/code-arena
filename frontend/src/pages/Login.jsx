import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Code2, ArrowRight, Chrome } from 'lucide-react';
import Lottie from 'lottie-react';
import { useApp } from '../context/AppContext';
import api, { getBackendOrigin } from '../utils/api';
import PillNav from '../components/ui/PillNav';
import devTeamAnimation from '../assets/lottie/dev_team.json';
import PageTransition from '../components/ui/PageTransition';
import { isAdminUser } from '../utils/admin';
import GoogleAuthModal from '../components/GoogleAuthModal';

const Login = () => {
  const { token, user, login, showToast, t, uiLanguage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [usernameOrEmail, setUsernameOrEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    if (token && user && !searchParams.get('token')) {
      if (isAdminUser(user)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [token, user, searchParams, navigate]);

  useEffect(() => {
    // Intercept Google OAuth / token redirect from URL params
    const paramToken = searchParams.get('token');
    const paramError = searchParams.get('error');

    if (paramToken) {
      const id = searchParams.get('id');
      const username = searchParams.get('username') || 'GoogleUser';
      const email = searchParams.get('email') || '';
      const role = searchParams.get('role') || 'ROLE_USER';
      const avatar = searchParams.get('avatar');
      const userData = { id, username, email, role, avatar };

      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token: paramToken, userData }, '*');
        window.close();
        return;
      }

      login(userData, paramToken);
      showToast(`${t('Welcome')}, ${username}! ${t('Logged in with Google.')}`, 'success');
      if (isAdminUser(userData)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else if (paramError) {
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: paramError }, '*');
        window.close();
        return;
      }
      showToast('Google OAuth notice. Opening 1-Click Verification...', 'info');
      setShowGoogleModal(true);
    }
  }, [searchParams, login, navigate, showToast, t]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { token: userToken, userData } = event.data;
        login(userData, userToken);
        showToast(`Welcome, ${userData.username || 'User'}! Logged in with Google.`, 'success');
        if (isAdminUser(userData)) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else if (event.data && event.data.type === 'GOOGLE_AUTH_ERROR') {
        setShowGoogleModal(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login, navigate, showToast]);

  const handleGoogleLogin = () => {
    const origin = getBackendOrigin();
    const oauthUrl = origin + '/oauth2/authorization/google';

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      oauthUrl,
      'GoogleOAuthAccountChooserPopup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = oauthUrl;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      showToast(t('Please fill in all fields'), 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { usernameOrEmail, password });
      const userData = res.data.data;
      const userToken = userData?.token || userData?.jwtToken;
      
      login(userData, userToken);
      showToast('Welcome back, ' + (userData?.username || 'User') + '!', 'success');
      
      if (isAdminUser(userData)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition key={uiLanguage} className="relative min-h-[calc(100vh-73px)] w-full flex items-center justify-center bg-darkBg text-white px-6 py-10 overflow-hidden">
      <GoogleAuthModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} />
      {/* Background Blobs */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primaryBlue/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-12 z-10">
        {/* Left Column: Lottie Animation & Text Matter */}
        <div className="hidden md:flex flex-1 flex-col items-center text-center max-w-[320px] self-center -mt-6">
          <div className="w-full h-[180px] flex items-center justify-center mb-4">
            <Lottie animationData={devTeamAnimation} loop={true} style={{ height: 180, width: '100%' }} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('Code and Compile on the Fly')}</h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
            {t('Join the CodeArena community, solve algorithmic challenges, and scale up the leaderboard ranks.')}
          </p>
        </div>

        {/* Right Column: Login Card with PillNav */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative border border-white/10"
        >
          {/* Pill Switcher */}
          <div className="mb-6">
            <PillNav
              activeValue="login"
              onChange={(val) => {
                if (val === 'register') navigate('/register');
              }}
              options={[
                { value: 'login', label: t('Log In'), icon: <Code2 className="w-4 h-4" /> },
                { value: 'register', label: t('Sign Up'), icon: <ArrowRight className="w-4 h-4" /> },
              ]}
            />
          </div>
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-primaryBlue/10 border border-primaryBlue/20 rounded-xl text-primaryBlue mb-3">
              <Code2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">{t('Welcome Back')}</h2>
            <p className="text-gray-400 text-sm mt-1">{t('Sign in to your CodeArena account')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">{t('profile_username')} / {t('profile_email')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="developer"
                  className="w-full glass-input glass-input-icon"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase">{t('PASSWORD')}</label>
                <Link to="/forgot-password" className="text-xs text-primaryBlue hover:underline">
                  {t('Forgot password?')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full glass-input glass-input-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primaryBlue hover:bg-blue-600 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-all mt-6 shadow-lg shadow-blue-500/20 disabled:opacity-50 btn-glow"
            >
              {loading ? t('btn_loading') : t('Log In')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Separator Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('or')}</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Google OAuth Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-lg text-gray-200 font-bold flex items-center justify-center gap-2.5 transition-all text-sm btn-glow"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.64l3.66 2.84c.87-2.6 3.3-4.53 6.1-4.53z" fill="#EA4335"/>
            </svg>
            {t('Continue with Google')}
          </motion.button>

          {/* Quick Demo Access Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <button
              type="button"
              onClick={() => {
                const demoUser = {
                  id: 999,
                  username: 'DemoCoder',
                  email: 'democoder@codearena.com',
                  role: 'ROLE_USER',
                  avatar: 'DemoCoder',
                  currentStreak: 7,
                  score: 1850,
                };
                login(demoUser, 'demo-jwt-user-token');
                showToast('Logged in as Demo Coder!', 'success');
                navigate('/dashboard');
              }}
              className="py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              🚀 1-Click User Demo
            </button>

            <button
              type="button"
              onClick={() => {
                const demoAdmin = {
                  id: 1,
                  username: 'AdminUser',
                  email: 'admin@codearena.com',
                  role: 'ROLE_ADMIN',
                  avatar: 'AdminUser',
                  currentStreak: 14,
                  score: 4200,
                };
                login(demoAdmin, 'demo-jwt-admin-token');
                showToast('Logged in as Admin Console User!', 'success');
                navigate('/admin');
              }}
              className="py-2.5 px-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellowAccent border border-yellow-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              ⚡ 1-Click Admin Demo
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            {t("Don't have an account?")}{' '}
            <Link to="/register" className="text-primaryBlue hover:underline font-semibold">
              {t('Create Account')}
            </Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;
