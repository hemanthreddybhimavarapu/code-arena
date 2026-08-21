import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, X, Globe, Check, AlertCircle, RefreshCw, Cpu, Laptop } from 'lucide-react';
import api, { getApiBaseUrl } from '../../utils/api';

export const BackendConfigModal = ({ isOpen, onClose, showToast }) => {
  const [currentUrl, setCurrentUrl] = useState(getApiBaseUrl());
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('custom_backend_url') || '');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'failed'

  useEffect(() => {
    setCurrentUrl(getApiBaseUrl());
    setCustomUrl(localStorage.getItem('custom_backend_url') || '');
  }, [isOpen]);

  const testConnection = async (targetUrl) => {
    setTesting(true);
    setStatus('idle');
    try {
      let urlToTest = targetUrl || customUrl || currentUrl;
      if (!urlToTest.endsWith('/api')) {
        urlToTest = urlToTest.replace(/\/+$/, '') + '/api';
      }
      const testRes = await fetch(`${urlToTest}/problems`, { method: 'GET' });
      if (testRes.ok || testRes.status === 401 || testRes.status === 403) {
        setStatus('success');
        if (showToast) showToast('Backend server connection successful!', 'success');
      } else {
        setStatus('failed');
        if (showToast) showToast('Could not reach backend server at specified URL', 'error');
      }
    } catch (err) {
      setStatus('failed');
      if (showToast) showToast('Network connection failed. Ensure backend is running.', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (customUrl.trim()) {
      let clean = customUrl.trim();
      if (!clean.endsWith('/api')) {
        clean = clean.replace(/\/+$/, '') + '/api';
      }
      localStorage.setItem('custom_backend_url', clean);
      if (showToast) showToast('Backend URL updated! Reloading app...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      localStorage.removeItem('custom_backend_url');
      if (showToast) showToast('Reset to default backend URL! Reloading app...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
    onClose();
  };

  const handleResetDefault = () => {
    localStorage.removeItem('custom_backend_url');
    setCustomUrl('');
    if (showToast) showToast('Reset to localhost:8080 backend. Reloading...', 'success');
    setTimeout(() => window.location.reload(), 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-darkCard border border-white/10 rounded-2xl p-6 shadow-2xl text-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primaryBlue/10 border border-primaryBlue/20 rounded-xl text-primaryBlue">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Backend Server Connection</h3>
                <p className="text-xs text-gray-400">Configure host URL for other laptops & remote devices</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Active URL Badge */}
          <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-400">Active API Endpoint:</span>
              <span className="font-mono font-semibold text-white">{currentUrl}</span>
            </div>
            <button
              onClick={() => testConnection(currentUrl)}
              disabled={testing}
              className="text-[11px] font-bold text-primaryBlue hover:underline flex items-center gap-1"
            >
              {testing ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Test'}
            </button>
          </div>

          {/* Explanation Box */}
          <div className="mb-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Laptop className="w-4 h-4 text-primaryBlue" /> Why doesn't localhost work on other laptops?
            </div>
            <p className="text-[11px] text-gray-300">
              `localhost` points to the user's local machine. When friends open Vercel from another laptop, enter your public backend tunnel or server URL below to connect them directly to your live backend.
            </p>
          </div>

          {/* Input field */}
          <div className="space-y-3 mb-6">
            <label className="block text-xs font-bold text-gray-300">
              Custom Live Backend API URL
            </label>
            <input
              type="text"
              placeholder="e.g. https://your-backend.onrender.com/api or localltunnel URL"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-darkBg border border-white/10 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-primaryBlue"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <button
              onClick={handleResetDefault}
              className="px-3 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold"
            >
              Reset to Localhost
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => testConnection(customUrl)}
                disabled={testing}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1"
              >
                {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Test Endpoint
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-primaryBlue hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Save & Reload
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BackendConfigModal;
