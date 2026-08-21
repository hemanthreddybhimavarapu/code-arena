import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../utils/i18n';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [uiLanguage, setUiLanguageState] = useState(localStorage.getItem('uiLanguage') || 'en');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light', 'theme-sapphire', 'theme-cyberpunk', 'theme-amethyst');
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'sapphire') {
      root.classList.add('dark', 'theme-sapphire');
    } else if (theme === 'cyberpunk') {
      root.classList.add('dark', 'theme-cyberpunk');
    } else if (theme === 'amethyst') {
      root.classList.add('dark', 'theme-amethyst');
    } else {
      root.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const loginUser = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'success');
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const updateAvatar = (avatarUrl, name) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        avatar: avatarUrl || user.avatar,
        name: name !== undefined ? name : user.name
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const formatInitialsSeed = (rawInput, userObj) => {
    let text = rawInput;
    if (!text || text === 'ocean' || text === 'codearena') {
      text = userObj?.name || userObj?.username || (userObj?.email ? userObj.email.split('@')[0] : 'User');
    }
    if (!text) text = 'User';

    // Strip trailing or embedded numbers e.g. "iamhemanth9848" -> "iamhemanth"
    text = text.replaceAll(/[0-9]/g, '').trim();

    // Convert delimiters (underscores, dots, hyphens) to spaces: "hemanth_reddy" -> "hemanth reddy"
    text = text.replace(/[_.-]/g, ' ').trim();

    // Smart split for common single-word compound handles:
    // "hemureddy" -> "Hemu Reddy" -> "HR"
    // "iamhemanth" -> "Iam Hemanth" -> "IH"
    if (!text.includes(' ') && text.length >= 5) {
      const lower = text.toLowerCase();
      if (lower.startsWith('iam')) {
        text = 'Iam ' + text.substring(3);
      } else if (lower.startsWith('hemu')) {
        text = 'Hemu ' + text.substring(4);
      } else if (lower.startsWith('code')) {
        text = 'Code ' + text.substring(4);
      }
    }

    return text
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const getAvatarUrl = (avatar, fallbackSeed = 'User') => {
    const defaultParams = 'backgroundColor=0f172a,1e293b,334155,1e1b4b,0f766e,312e81&textColor=ffffff&fontSize=42&fontWeight=700';
    
    if (avatar && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image/'))) {
      if (avatar.includes('dicebear.com') && (avatar.includes('avataaars') || avatar.includes('bottts') || avatar.includes('pixel-art'))) {
        try {
          const urlObj = new URL(avatar);
          const rawSeed = urlObj.searchParams.get('seed') || user?.name || user?.username || fallbackSeed;
          const seed = formatInitialsSeed(rawSeed, user);
          return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&${defaultParams}`;
        } catch (e) {}
      }
      return avatar;
    }

    const seed = formatInitialsSeed(avatar, user);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&${defaultParams}`;
  };

  const DEFAULT_TYPOGRAPHY = {
    fontStyle: 'Inter',
    fontSize: 'comfortable',
    density: 'comfortable',
  };

  const [typography, setTypography] = useState(() => {
    const userKey = user?.id ? `user_typography_${user.id}` : 'user_typography_guest';
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : DEFAULT_TYPOGRAPHY;
  });

  useEffect(() => {
    const userKey = user?.id ? `user_typography_${user.id}` : 'user_typography_guest';
    const saved = localStorage.getItem(userKey);
    if (saved) {
      setTypography(JSON.parse(saved));
    } else {
      setTypography(DEFAULT_TYPOGRAPHY);
    }
  }, [user?.id]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Font Style
    const fontMap = {
      'Inter': "'Inter', sans-serif",
      'Poppins': "'Poppins', sans-serif",
      'Manrope': "'Manrope', sans-serif",
      'Outfit': "'Outfit', sans-serif",
      'JetBrains Mono': "'JetBrains Mono', monospace",
    };
    const selectedFont = fontMap[typography.fontStyle] || fontMap['Inter'];
    root.style.setProperty('--app-font', selectedFont);
    root.style.fontFamily = selectedFont;

    // Font Size
    const fontSizeMap = {
      compact: '14px',
      comfortable: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizeMap[typography.fontSize] || '16px';

    // Density
    const densityMap = {
      compact: '0.85',
      comfortable: '1',
      spacious: '1.15',
    };
    root.style.setProperty('--density-scale', densityMap[typography.density] || '1');

    const userKey = user?.id ? `user_typography_${user.id}` : 'user_typography_guest';
    localStorage.setItem(userKey, JSON.stringify(typography));
  }, [typography, user?.id]);

  const updateTypography = (updates) => {
    setTypography((prev) => ({ ...prev, ...updates }));
  };

  const resetTypography = () => {
    setTypography(DEFAULT_TYPOGRAPHY);
    showToast('Typography reset to default settings', 'info');
  };

  const changeUiLanguage = (lang) => {
    setUiLanguageState(lang);
    localStorage.setItem('uiLanguage', lang);
  };

  const t = (key, fallback) => {
    if (!key) return fallback || '';
    const res = getTranslation(uiLanguage, key);
    if (res === key && fallback) return fallback;
    return res;
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        theme,
        uiLanguage,
        changeUiLanguage,
        t,
        toasts,
        typography,
        updateTypography,
        resetTypography,
        login: loginUser,
        logout: logoutUser,
        toggleTheme,
        changeTheme,
        showToast,
        updateAvatar,
        getAvatarUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
