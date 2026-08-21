import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sliders, Sun, Moon, Monitor, Type, Code2, 
  Sparkles, Keyboard, Save, Volume2, Globe, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, changeTheme, editorSettings, updateEditorSettings, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('editor');

  if (!isOpen) return null;

  const fontSizes = [12, 14, 16, 18, 20];
  const editorThemes = [
    { id: 'vs-dark', name: 'Dark Plus (Default)' },
    { id: 'vs-light', name: 'Light Plus' },
    { id: 'hc-black', name: 'High Contrast' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-darkCard border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primaryBlue/15 text-primaryBlue border border-primaryBlue/30 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Platform & Editor Settings</h2>
                <p className="text-xs text-gray-400">Customize workspace preferences, themes, and shortcuts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 px-6 bg-black/20 gap-6 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'editor'
                  ? 'border-primaryBlue text-primaryBlue font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Code2 className="w-4 h-4" /> Editor Controls
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'appearance'
                  ? 'border-primaryBlue text-primaryBlue font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Sun className="w-4 h-4" /> Appearance & Theme
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'shortcuts'
                  ? 'border-primaryBlue text-primaryBlue font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Keyboard className="w-4 h-4" /> Shortcuts
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-200">
            {activeTab === 'editor' && (
              <div className="space-y-6">
                {/* Font Size */}
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="font-bold text-gray-100">Monaco Font Size</div>
                      <div className="text-xs text-gray-400">Adjust code typography readability</div>
                    </div>
                  </div>
                  <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                    {fontSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => updateEditorSettings({ fontSize: size })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          editorSettings.fontSize === size
                            ? 'bg-primaryBlue text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Theme */}
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-bold text-gray-100">Monaco Editor Theme</div>
                      <div className="text-xs text-gray-400">Select syntax highlighting color scheme</div>
                    </div>
                  </div>
                  <select
                    value={editorSettings.editorTheme || 'vs-dark'}
                    onChange={(e) => updateEditorSettings({ editorTheme: e.target.value })}
                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primaryBlue"
                  >
                    {editorThemes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* AI Assistant */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="font-bold text-gray-100">AI Assistant</div>
                        <div className="text-xs text-gray-400">Code hints & optimization</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={editorSettings.aiAssistant ?? true}
                      onChange={(e) => updateEditorSettings({ aiAssistant: e.target.checked })}
                      className="w-4 h-4 rounded text-primaryBlue focus:ring-primaryBlue accent-primaryBlue cursor-pointer"
                    />
                  </div>

                  {/* Auto Save */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Save className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="font-bold text-gray-100">Auto Save Code</div>
                        <div className="text-xs text-gray-400">Persist draft solution automatically</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={editorSettings.autoSave ?? true}
                      onChange={(e) => updateEditorSettings({ autoSave: e.target.checked })}
                      className="w-4 h-4 rounded text-primaryBlue focus:ring-primaryBlue accent-primaryBlue cursor-pointer"
                    />
                  </div>

                  {/* Sound Effects */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-bold text-gray-100">Sound Effects</div>
                        <div className="text-xs text-gray-400">Audio cues on AC / error verdicts</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={editorSettings.soundEffects ?? true}
                      onChange={(e) => updateEditorSettings({ soundEffects: e.target.checked })}
                      className="w-4 h-4 rounded text-primaryBlue focus:ring-primaryBlue accent-primaryBlue cursor-pointer"
                    />
                  </div>

                  {/* Language Response */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-teal-400" />
                      <div>
                        <div className="font-bold text-gray-100">Response Language</div>
                        <div className="text-xs text-gray-400">English (US)</div>
                      </div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                  <div className="font-bold text-gray-100 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellowAccent" /> Global Platform Theme
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => changeTheme('dark')}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        theme === 'dark'
                          ? 'border-primaryBlue bg-primaryBlue/15 text-white font-bold ring-2 ring-primaryBlue/30'
                          : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <Moon className="w-6 h-6 text-indigo-400" />
                      <span>Dark Theme</span>
                    </button>
                    <button
                      onClick={() => changeTheme('light')}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        theme === 'light'
                          ? 'border-primaryBlue bg-primaryBlue/15 text-white font-bold ring-2 ring-primaryBlue/30'
                          : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <Sun className="w-6 h-6 text-amber-400" />
                      <span>Light Theme</span>
                    </button>
                    <button
                      onClick={() => changeTheme('sapphire')}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        theme === 'sapphire'
                          ? 'border-primaryBlue bg-primaryBlue/15 text-white font-bold ring-2 ring-primaryBlue/30'
                          : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <Monitor className="w-6 h-6 text-cyan-400" />
                      <span>Sapphire Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase text-gray-400 tracking-wider">Keyboard Shortcuts Reference</div>
                <div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                  <div className="p-3.5 flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-300">Run Code Solution</span>
                    <kbd className="px-2.5 py-1 bg-black/60 border border-white/20 rounded-md font-mono text-primaryBlue font-bold">Ctrl + Enter</kbd>
                  </div>
                  <div className="p-3.5 flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-300">Submit Code Solution</span>
                    <kbd className="px-2.5 py-1 bg-black/60 border border-white/20 rounded-md font-mono text-emerald-400 font-bold">Ctrl + Shift + Enter</kbd>
                  </div>
                  <div className="p-3.5 flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-300">Format / Auto Indent</span>
                    <kbd className="px-2.5 py-1 bg-black/60 border border-white/20 rounded-md font-mono text-gray-300">Shift + Alt + F</kbd>
                  </div>
                  <div className="p-3.5 flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-300">Toggle Full Screen Mode</span>
                    <kbd className="px-2.5 py-1 bg-black/60 border border-white/20 rounded-md font-mono text-gray-300">F11 / Esc</kbd>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end">
            <button
              onClick={() => {
                showToast('Settings saved successfully', 'success');
                onClose();
              }}
              className="px-5 py-2.5 bg-primaryBlue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Save & Apply Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
