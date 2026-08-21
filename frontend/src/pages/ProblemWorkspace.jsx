import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Send, RotateCcw, Copy, Download, Maximize, Bookmark, BookmarkCheck,
  BookOpen, HelpCircle, Terminal, FileText, MessagesSquare, CheckCircle, XCircle, SendHorizontal, Clock, Lock, AlertTriangle, History, Code, FileCode,
  Upload, Wand2, Eye, EyeOff, Sliders, ChevronDown, Check, Palette
} from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
const confetti = canvasConfetti;
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import PageTransition from '../components/ui/PageTransition';

const ProblemWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, showToast, getAvatarUrl, user, t, uiLanguage } = useApp();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leftTab, setLeftTab] = useState('description'); // description, hints, editorial, discussions, submissions
  const [mobileTab, setMobileTab] = useState('description'); // description, editor on mobile
  
  // Editor Preferences & States
  const savedEditorPrefs = JSON.parse(localStorage.getItem('codearena_editor_prefs') || '{}');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [editorTheme, setEditorTheme] = useState(savedEditorPrefs.theme || 'vs-dark');
  const [fontSize, setFontSize] = useState(savedEditorPrefs.fontSize || 14);
  const [minimapEnabled, setMinimapEnabled] = useState(savedEditorPrefs.minimap !== undefined ? savedEditorPrefs.minimap : false);
  const [wordWrapEnabled, setWordWrapEnabled] = useState(savedEditorPrefs.wordWrap !== undefined ? savedEditorPrefs.wordWrap : true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const fileInputRef = useRef(null);
  const handleCodeRunRef = useRef(null);
  const handleCodeSubmitRef = useRef(null);

  // Submission History States
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);

  // Execution States
  const [executing, setExecuting] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [results, setResults] = useState([]);
  const [executionStats, setExecutionStats] = useState(null);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState('sampleCases'); // sampleCases, testCases, customCases, testResults
  const [customInput, setCustomInput] = useState('');

  // Pill active cases selection states
  const [activeSampleCase, setActiveSampleCase] = useState(0);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [activeResultCase, setActiveResultCase] = useState(0);

  // Clockwatch States
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Discussions
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [replyId, setReplyId] = useState(null);

  // Locked Sections
  const [failedCount, setFailedCount] = useState(0);

  // LeetCode Draggable Split Panes & Rate Limiting States
  const rightPanelRef = React.useRef(null);
  
  const getInitialLeftWidth = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('codearena_splitters') || '{}');
      const val = Number(saved.leftWidth);
      if (!isNaN(val) && val >= 25 && val <= 70) return val;
    } catch (e) {}
    return 45;
  };

  const getInitialEditorHeight = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('codearena_splitters') || '{}');
      const val = Number(saved.editorHeight);
      if (!isNaN(val) && val >= 30 && val <= 80) return val;
    } catch (e) {}
    return 60;
  };

  const [leftPanelWidth, setLeftPanelWidth] = useState(getInitialLeftWidth);
  const [editorHeight, setEditorHeight] = useState(getInitialEditorHeight);
  const [isDraggingH, setIsDraggingH] = useState(false);
  const [isDraggingV, setIsDraggingV] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    let interval = null;
    if (cooldownSec > 0) {
      interval = setInterval(() => {
        setCooldownSec((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownSec]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (isDraggingH) {
        const newWidth = (clientX / window.innerWidth) * 100;
        if (newWidth >= 25 && newWidth <= 75) {
          setLeftPanelWidth(newWidth);
          if (editorRef.current) {
            setTimeout(() => editorRef.current.layout(), 10);
          }
        }
      }
      if (isDraggingV && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        const relativeY = clientY - rect.top;
        const newHeight = (relativeY / rect.height) * 100;
        if (newHeight >= 25 && newHeight <= 80) {
          setEditorHeight(newHeight);
          if (editorRef.current) {
            setTimeout(() => editorRef.current.layout(), 10);
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (isDraggingH || isDraggingV) {
        setIsDraggingH(false);
        setIsDraggingV(false);
        localStorage.setItem('codearena_splitters', JSON.stringify({
          leftWidth: leftPanelWidth,
          editorHeight: editorHeight,
        }));
      }
    };

    if (isDraggingH || isDraggingV) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingH, isDraggingV, leftPanelWidth, editorHeight]);

  const clearErrorHighlights = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (model) {
      monacoRef.current.editor.setModelMarkers(model, 'compiler-error', []);
    }
  };

  const highlightErrorLines = (errorMsg) => {
    if (!editorRef.current || !monacoRef.current || !errorMsg) return;
    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = [];
    const lineRegex = /(?:line\s+(\d+)|[:\.]java:(\d+)|[:\.]cpp:(\d+)|[:\.]c:(\d+)|[:\.]py",\s*line\s*(\d+)|:(\d+):)/gi;
    let match;
    const lineNumbers = new Set();
    while ((match = lineRegex.exec(errorMsg)) !== null) {
      const lineNumStr = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
      if (lineNumStr) {
        const lineNum = parseInt(lineNumStr, 10);
        if (lineNum > 0 && lineNum <= model.getLineCount()) {
          lineNumbers.add(lineNum);
        }
      }
    }

    lineNumbers.forEach(lineNum => {
      markers.push({
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: model.getLineMaxColumn(lineNum),
        message: errorMsg,
        severity: monaco.MarkerSeverity.Error,
      });
    });

    if (markers.length > 0) {
      monaco.editor.setModelMarkers(model, 'compiler-error', markers);
      const firstLine = Array.from(lineNumbers)[0];
      editorRef.current.revealLineInCenter(firstLine);
    }
  };



  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const parseDescriptionContent = (desc = '') => {
    let mainDesc = desc;
    let inputFormat = "Standard test case input parameters mapped to standard input stream.";
    let outputFormat = "Produce the expected result mapped to standard output stream.";
    let timeComplexity = "O(N) optimal time target";
    let spaceComplexity = "O(1) auxiliary storage space";

    try {
      const inputFormatIdx = desc.indexOf("Input Format");
      const outputFormatIdx = desc.indexOf("Output Format");
      const timeCompIdx = desc.indexOf("Time Complexity");
      const spaceCompIdx = desc.indexOf("Space Complexity");

      if (inputFormatIdx !== -1) {
        const nextIdx = outputFormatIdx !== -1 ? outputFormatIdx : desc.length;
        inputFormat = desc.substring(inputFormatIdx + 12, nextIdx).replace(/^[:\-\s\r\n#*]+|[:\-\s\r\n#*]+$/g, '');
        mainDesc = desc.substring(0, inputFormatIdx);
      }
      if (outputFormatIdx !== -1) {
        const nextIdx = timeCompIdx !== -1 ? timeCompIdx : (spaceCompIdx !== -1 ? spaceCompIdx : desc.length);
        outputFormat = desc.substring(outputFormatIdx + 13, nextIdx).replace(/^[:\-\s\r\n#*]+|[:\-\s\r\n#*]+$/g, '');
      }
      if (timeCompIdx !== -1) {
        const nextIdx = spaceCompIdx !== -1 ? spaceCompIdx : desc.length;
        timeComplexity = desc.substring(timeCompIdx + 15, nextIdx).replace(/^[:\-\s\r\n#*]+|[:\-\s\r\n#*]+$/g, '');
      }
      if (spaceCompIdx !== -1) {
        spaceComplexity = desc.substring(spaceCompIdx + 16).replace(/^[:\-\s\r\n#*]+|[:\-\s\r\n#*]+$/g, '');
      }
    } catch (e) {
      console.error("Error parsing description sections", e);
    }

    return { mainDesc, inputFormat, outputFormat, timeComplexity, spaceComplexity };
  };

  const getStorageKey = (langKey = language) => `codearena_saved_code_${id}_${langKey}`;

  useEffect(() => {
    const initWorkspace = async () => {
      const history = await fetchSubmissionHistory();
      let initialLang = language;
      if (history && history.length > 0) {
        const latestSub = history.find(s => s.code) || history[0];
        if (latestSub && latestSub.language) {
          initialLang = latestSub.language.toLowerCase();
          setLanguage(initialLang);
        }
      }
      await fetchProblemDetails(true, history, initialLang);
      fetchDiscussions();
    };
    initWorkspace();
  }, [id, token]);

  const getFallbackProblem = (probId) => {
    const fallbackList = {
      '1': {
        id: 1,
        title: 'Two Sum',
        difficulty: 'EASY',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.\n\nInput Format\nArray nums and target integer.\n\nOutput Format\nIndices array of two integers.\n\nTime Complexity\nO(N) optimal time target\n\nSpace Complexity\nO(1) auxiliary storage space',
        sampleCases: [{ input: '[2,7,11,15]\n9', output: '[0,1]' }, { input: '[3,2,4]\n6', output: '[1,2]' }],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hints: ['Try using a hash map to store complements of numbers as you iterate.']
      },
      '2': {
        id: 2,
        title: 'Reverse a String',
        difficulty: 'EASY',
        description: 'Write a function that reverses a string. The input string is given as an array of characters.\n\nInput Format\nArray of characters s.\n\nOutput Format\nReversed in-place array.\n\nTime Complexity\nO(N) optimal time target\n\nSpace Complexity\nO(1) auxiliary storage space',
        sampleCases: [{ input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hints: ['Use two pointers, one at the start and one at the end, and swap characters until they meet.']
      },
      '3': {
        id: 3,
        title: 'Palindrome Check',
        difficulty: 'EASY',
        description: 'Given a string `s`, return true if it is a palindrome, or false otherwise.\n\nInput Format\nSingle string s.\n\nOutput Format\nBoolean true/false.\n\nTime Complexity\nO(N) optimal time target\n\nSpace Complexity\nO(1) auxiliary storage space',
        sampleCases: [{ input: '"racecar"', output: 'true' }, { input: '"hello"', output: 'false' }],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hints: ['Compare characters from start and end moving inward.']
      }
    };

    return fallbackList[String(probId)] || {
      id: Number(probId) || 1,
      title: 'Algorithmic Problem #' + (probId || 1),
      difficulty: 'EASY',
      description: 'Given an array of integers, solve the algorithmic problem efficiently.\n\nInput Format\nStandard input stream parameters.\n\nOutput Format\nStandard output stream result.\n\nTime Complexity\nO(N) optimal time target\n\nSpace Complexity\nO(1) auxiliary storage space',
      sampleCases: [{ input: '1 2 3', output: '6' }],
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      hints: ['Break down the problem into smaller subproblems.']
    };
  };

  const fetchProblemDetails = async (isInitial = false, historyData = null, targetLang = null) => {
    try {
      const res = await api.get(`/problems/${id}`);
      const data = res.data?.data || getFallbackProblem(id);
      setProblem(data);
      
      // Purge any legacy full-solution drafts from local storage
      ['python', 'java', 'c', 'cpp', 'javascript'].forEach(l => {
        const k = `codearena_saved_code_${id}_${l}`;
        const draft = localStorage.getItem(k);
        if (draft && isFullSolution(draft)) {
          localStorage.removeItem(k);
        }
      });

      if (isInitial) {
        loadLanguageTemplate(targetLang || language, data, historyData || submissionHistory);
      }
    } catch (err) {
      const fallback = getFallbackProblem(id);
      setProblem(fallback);
      if (isInitial) {
        loadLanguageTemplate(targetLang || language, fallback, historyData || submissionHistory);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const res = await api.get(`/discussions/${id}`);
      setDiscussions(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissionHistory = async () => {
    if (!token || token === 'null' || token === 'undefined') return [];
    try {
      const res = await api.get(`/submissions/${id}/history`);
      const history = res.data.data || [];
      setSubmissionHistory(history);
      const fails = history.filter(sub => sub.verdict !== 'ACCEPTED' && sub.verdict !== 'PENDING' && sub.verdict !== 'RUNNING').length;
      setFailedCount(fails);
      return history;
    } catch (err) {
      console.error('Failed to fetch submission history', err);
      return [];
    }
  };

  // Persist Editor Preferences
  useEffect(() => {
    localStorage.setItem('codearena_editor_prefs', JSON.stringify({
      theme: editorTheme,
      fontSize,
      minimap: minimapEnabled,
      wordWrap: wordWrapEnabled,
    }));
  }, [editorTheme, fontSize, minimapEnabled, wordWrapEnabled]);

  // Save current code on unload / tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (code !== undefined && code !== null && id && language) {
        localStorage.setItem(`codearena_saved_code_${id}_${language.toLowerCase()}`, code);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [id, language, code]);

  const defaultTemplates = {
    java: `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}`,
    python: `# Write your solution here\nimport sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()`,
    c: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`,
    javascript: `const fs = require('fs');\n\nfunction main() {\n    // Write your solution here\n}\n\nmain();`,
  };

  const isFullSolution = (str = '') => {
    if (!str) return false;
    const s = str.toLowerCase();
    return (
      s.includes('seen') ||
      s.includes('target -') ||
      s.includes('enumerate') ||
      s.includes('splitlines') ||
      s.includes('while') ||
      s.includes('for i') ||
      s.includes('s[i]') ||
      s.includes('return math') ||
      s.includes('hashmap') ||
      s.includes('vector<') ||
      s.includes('push_back') ||
      s.includes('system.out.print') ||
      (s.includes('sum') && s.includes('target')) ||
      (s.split('\n').filter(line => line.trim() && !line.trim().startsWith('#') && !line.trim().startsWith('//')).length > 7)
    );
  };

  const loadLanguageTemplate = (lang, probData = problem, history = submissionHistory) => {
    if (!probData) return;
    const currentLang = (lang || language).toLowerCase();
    const key = `codearena_saved_code_${id}_${currentLang}`;
    const savedDraft = localStorage.getItem(key);
    
    // Validate draft is not full solution
    if (savedDraft && !isFullSolution(savedDraft)) {
      setCode(savedDraft);
      return;
    }

    let starter = '';
    switch (currentLang) {
      case 'java': starter = probData.starterCodeJava; break;
      case 'python': starter = probData.starterCodePython; break;
      case 'c': starter = probData.starterCodeC; break;
      case 'cpp': starter = probData.starterCodeCpp; break;
      case 'javascript': starter = probData.starterCodeJs; break;
      default: starter = '';
    }

    if (!starter || isFullSolution(starter)) {
      starter = defaultTemplates[currentLang] || defaultTemplates.python;
    }

    setCode(starter);
    localStorage.setItem(key, starter);
  };

  const handleLanguageChange = (e) => {
    const nextLang = e.target.value;
    // Save draft for current language before switching!
    if (code !== undefined && code !== null) {
      localStorage.setItem(getStorageKey(language), code);
    }
    setLanguage(nextLang);
    loadLanguageTemplate(nextLang);
  };

  const handleCodeChange = (val) => {
    setCode(val);
    if (val !== undefined && val !== null) {
      localStorage.setItem(getStorageKey(language), val);
    }
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      showToast('Formatted source document', 'info');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        setCode(fileContent);
        localStorage.setItem(getStorageKey(language), fileContent);
        showToast(`Uploaded ${file.name} to editor`, 'success');
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current.layout();
      }, 150);
    }
  }, [mobileTab, isFullscreen]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    setTimeout(() => {
      editor.layout();
    }, 150);

    // Keyboard Shortcut: Ctrl + Enter (or Cmd + Enter) -> Run Sample Cases
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (handleCodeRunRef.current) {
        handleCodeRunRef.current();
      }
    });

    // Keyboard Shortcut: Ctrl + Shift + Enter (or Cmd + Shift + Enter) -> Submit Solution
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (handleCodeSubmitRef.current) {
        handleCodeSubmitRef.current();
      }
    });
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to starter template? Your edits will be lost.')) {
      localStorage.removeItem(getStorageKey(language));
      let starter = '';
      switch (language.toLowerCase()) {
        case 'java': starter = problem?.starterCodeJava || ''; break;
        case 'python': starter = problem?.starterCodePython || ''; break;
        case 'c': starter = problem?.starterCodeC || ''; break;
        case 'cpp': starter = problem?.starterCodeCpp || ''; break;
        case 'javascript': starter = problem?.starterCodeJs || ''; break;
        default: starter = '';
      }
      setCode(starter);
      clearErrorHighlights();
      showToast('Code reset to template', 'success');
    }
  };

  const handleLoadSubmittedCode = (sub) => {
    if (!sub || !sub.code) return;
    const targetLang = (sub.language || language).toLowerCase();
    if (targetLang !== language.toLowerCase()) {
      setLanguage(targetLang);
    }
    setCode(sub.code);
    localStorage.setItem(`codearena_saved_code_${id}_${targetLang}`, sub.code);
    showToast('Loaded submitted solution into editor', 'success');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard', 'success');
  };

  const handleDownloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    
    let ext = 'py';
    if (language === 'java') ext = 'java';
    else if (language === 'c') ext = 'c';
    else if (language === 'cpp') ext = 'cpp';
    else if (language === 'javascript') ext = 'js';

    element.download = `Solution_${id}.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleToggleBookmark = async () => {
    if (!token) {
      showToast('Please login to bookmark problems', 'error');
      return;
    }
    try {
      const res = await api.post(`/problems/${id}/bookmark`);
      setProblem(prev => ({ ...prev, isBookmarked: res.data.data }));
      showToast(res.data.message, 'success');
    } catch (err) {
      showToast(err.message || 'Bookmark action failed', 'error');
    }
  };

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Please login to participate in discussions', 'error');
      return;
    }
    if (!newDiscussion.trim()) return;

    try {
      const res = await api.post(`/discussions/${id}`, {
        content: newDiscussion,
        parentId: replyId
      });
      showToast('Discussion comment posted!', 'success');
      setNewDiscussion('');
      setReplyId(null);
      fetchDiscussions();
    } catch (err) {
      showToast(err.message || 'Failed to post comment', 'error');
    }
  };

  const isUneditedStarterCode = (userCode = '', lang = language) => {
    if (!userCode || !userCode.trim()) return true;
    const clean = userCode.trim();
    const currentLang = (lang || language).toLowerCase();
    const template = defaultTemplates[currentLang] || '';
    
    if (clean === template.trim()) return true;

    const stripped = clean
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/#.*/g, '')
      .replace(/\s+/g, '');

    if (currentLang === 'python') {
      const basicPy = "importsysdefsolve():passif__name__=='__main__':solve()";
      if (stripped === basicPy || stripped === "defsolve():pass") return true;
    } else if (currentLang === 'java') {
      const basicJava = "importjava.util.Scanner;publicclassSolution{publicstaticvoidmain(String[]args){Scannersc=newScanner(System.in);}}";
      if (stripped === basicJava) return true;
    } else if (currentLang === 'c') {
      const basicC = "#include<stdio.h>intmain(){return0;}";
      if (stripped === basicC) return true;
    } else if (currentLang === 'cpp') {
      const basicCpp = "#include<iostream>usingnamespacestd;intmain(){return0;}";
      if (stripped === basicCpp) return true;
    } else if (currentLang === 'javascript') {
      const basicJs = "constfs=require('fs');functionmain(){}main();";
      if (stripped === basicJs) return true;
    }

    return false;
  };

  const checkRateLimit = () => {
    const key = `sub_timestamps_${id}`;
    const now = Date.now();
    const timestamps = JSON.parse(localStorage.getItem(key) || '[]').filter(t => now - t < 60000);
    if (timestamps.length >= 5) {
      const oldest = Math.min(...timestamps);
      const waitSec = Math.ceil((60000 - (now - oldest)) / 1000);
      return waitSec;
    }
    return 0;
  };

  const recordSubmissionTimestamp = () => {
    const key = `sub_timestamps_${id}`;
    const now = Date.now();
    const timestamps = JSON.parse(localStorage.getItem(key) || '[]').filter(t => now - t < 60000);
    timestamps.push(now);
    localStorage.setItem(key, JSON.stringify(timestamps));
  };

  const handleCodeSubmit = async () => {
    if (!token) {
      showToast('Please login to submit code', 'error');
      return;
    }
    if (isUneditedStarterCode(code, language)) {
      showToast('Please write your solution code before submitting!', 'warning');
      setVerdict('NO SOLUTION WRITTEN');
      setConsoleOpen(true);
      setConsoleTab('testResults');
      return;
    }
    const wait = checkRateLimit();
    if (wait > 0) {
      setCooldownSec(wait);
      showToast(`Rate limit reached (max 5/min). Please wait ${wait} seconds.`, 'warning');
      return;
    }
    recordSubmissionTimestamp();
    clearErrorHighlights();
    setExecuting(true);
    setConsoleOpen(true);
    setConsoleTab('testResults');
    setVerdict('PENDING'); // First show status as Pending
    setResults([]);
    setExecutionStats(null);

    // Transition to RUNNING
    const runningTimer = setTimeout(() => {
      setVerdict('RUNNING');
    }, 400);

    try {
      const res = await api.post(`/submissions/${id}/submit`, {
        code,
        language
      });
      clearTimeout(runningTimer);
      const data = res.data.data;
      setVerdict(data.verdict); // Display final result automatically without page refresh
      setResults(data.results || []);
      setExecutionStats({
        timeMs: data.executionTimeMs,
        memoryKb: data.memoryUsedKb
      });

      if (data.verdict === 'ACCEPTED') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        showToast('Accepted! Congratulations!', 'success');
      } else {
        showToast('Submission returned verdict: ' + data.verdict, 'error');
        // Extract error outputs if compilation or runtime error
        const errLogs = (data.results || []).map(r => r.actualOutput || r.stderr || '').join('\n');
        highlightErrorLines(errLogs || data.verdict);
      }
      localStorage.setItem(getStorageKey(language), code);
      fetchProblemDetails(false);
      fetchSubmissionHistory();
    } catch (err) {
      clearTimeout(runningTimer);
      setVerdict('RUNTIME_ERROR');
      highlightErrorLines(err.message || 'Error executing submission');
      showToast(err.message || 'Execution request failed', 'error');
    } finally {
      setExecuting(false);
    }
  };

  const handleCodeRun = async () => {
    if (isUneditedStarterCode(code, language)) {
      showToast('Please write your solution code before running!', 'warning');
      setVerdict('NO SOLUTION WRITTEN');
      setConsoleOpen(true);
      setConsoleTab('testResults');
      return;
    }
    clearErrorHighlights();
    setExecuting(true);
    setConsoleOpen(true);
    setConsoleTab('testResults');
    setVerdict('RUNNING');
    setResults([]);
    setExecutionStats(null);

    try {
      const res = await api.post(`/submissions/${id}/run`, {
        code,
        language,
        customInput: customInput
      });
      const data = res.data.data;
      setVerdict(data.verdict);
      setResults(data.results || []);
      setExecutionStats({
        timeMs: data.executionTimeMs,
        memoryKb: data.memoryUsedKb
      });
      if (data.verdict === 'ACCEPTED' || data.verdict === 'SUCCESS') {
        showToast('Verdict: ACCEPTED', 'success');
      } else {
        const formattedVerdict = (data.verdict || 'ERROR').replace(/_/g, ' ');
        showToast(`Verdict: ${formattedVerdict}`, 'error');
        const errLogs = (data.results || []).map(r => r.actualOutput || r.stderr || '').join('\n');
        highlightErrorLines(errLogs || data.verdict);
      }
    } catch (err) {
      setVerdict('RUNTIME_ERROR');
      highlightErrorLines(err.message || 'Error executing code');
      showToast(err.message || 'Execution request failed', 'error');
    } finally {
      setExecuting(false);
    }
  };

  // Keep latest function refs for Monaco keyboard shortcut bindings
  handleCodeRunRef.current = handleCodeRun;
  handleCodeSubmitRef.current = handleCodeSubmit;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] w-full flex items-center justify-center bg-darkBg text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-semibold">Preparing workspace...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-[calc(100vh-73px)] w-full flex items-center justify-center bg-darkBg text-white p-6">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-4 border border-white/10 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-white font-outfit">{t('Problem Could Not Be Loaded')}</h3>
          <p className="text-sm text-gray-400 font-sans leading-relaxed">
            The requested problem details could not be retrieved. Please check your backend connection or select another problem.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/problems')}
              className="px-6 py-2.5 bg-primaryBlue hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              ← {t('Back to Problems List')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition key={uiLanguage}>
    <div 
      style={{
        '--left-width': `${leftPanelWidth}%`,
        '--right-width': `${100 - leftPanelWidth}%`,
      }}
      className={`min-h-[calc(100vh-73px)] w-full bg-darkBg text-white flex flex-col md:flex-row border-t border-white/5 ${isFullscreen ? 'fixed inset-0 z-50 min-h-screen' : ''}`}
    >
      
      {/* Mobile Responsive View Switcher */}
      <div className="flex md:hidden border-b border-white/10 bg-darkCard/90 p-2 gap-2 justify-center sticky top-0 z-30 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMobileTab('description')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'description'
              ? 'bg-primaryBlue text-white shadow-lg shadow-blue-500/20'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> {t('workspace_desc')}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'editor'
              ? 'bg-primaryBlue text-white shadow-lg shadow-blue-500/20'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" /> {t('workspace_code')}
        </button>
      </div>

      {/* Left Workspace Panel */}
      <div className={`w-full md:w-[var(--left-width)] border-r border-white/5 flex flex-col h-[calc(100vh-125px)] md:h-[calc(100vh-73px)] overflow-hidden ${mobileTab === 'description' ? 'flex' : 'hidden md:flex'}`}>
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-darkCard/50 overflow-x-auto">
          <button 
            onClick={() => setLeftTab('description')}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs md:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
              leftTab === 'description' ? 'border-primaryBlue text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> {t('workspace_desc')}
          </button>
          <button 
            onClick={() => setLeftTab('hints')}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs md:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
              leftTab === 'hints' ? 'border-primaryBlue text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> {t('workspace_hints')} ({problem?.hints?.length || 0})
          </button>
          <button 
            onClick={() => setLeftTab('editorial')}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs md:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
              leftTab === 'editorial' ? 'border-primaryBlue text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> {t('workspace_editorial')}
          </button>
          <button 
            onClick={() => setLeftTab('discussions')}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs md:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
              leftTab === 'discussions' ? 'border-primaryBlue text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <MessagesSquare className="w-4 h-4" /> {t('workspace_discussions')} ({discussions.length})
          </button>
          <button 
            onClick={() => setLeftTab('submissions')}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs md:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
              leftTab === 'submissions' ? 'border-primaryBlue text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-yellowAccent" /> {t('workspace_submissions')} ({submissionHistory.length})
          </button>
        </div>

        {/* Tab Contents Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {leftTab === 'description' && (() => {
              const { mainDesc, inputFormat, outputFormat, timeComplexity, spaceComplexity } = parseDescriptionContent(problem?.description || '');
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold">{t(problem?.title)}</h2>
                    <button 
                      onClick={handleToggleBookmark}
                      className="p-2 border border-white/10 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      {problem?.isBookmarked ? (
                        <BookmarkCheck className="w-5 h-5 text-yellowAccent" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <DifficultyBadge difficulty={problem?.difficulty} />
                    <span className="text-xs text-gray-500">{t('max_time')} {problem?.timeLimitMs}ms</span>
                    <span className="text-xs text-gray-500">{t('max_memory')} {problem?.memoryLimitMb}MB</span>
                  </div>

                  {/* Description Statement */}
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line border-t border-white/5 pt-6 font-sans">
                    {t(mainDesc)}
                  </div>

                  {/* Input Format card */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-gray-200">{t('input_format_label')}</h4>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs text-gray-300 leading-relaxed font-sans">
                      {t(inputFormat)}
                    </div>
                  </div>

                  {/* Complexity Targets card */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-gray-200">{t('complexity_targets_label')}</h4>
                    <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/5 p-4 rounded-xl text-xs text-gray-300 font-sans">
                      <div>
                        <span className="text-gray-400 block font-semibold mb-1">{t('time_complexity_label')}</span>
                        <code className="bg-black/30 px-2 py-1 rounded text-primaryBlue font-mono">{t(timeComplexity)}</code>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold mb-1">{t('space_complexity_label')}</span>
                        <code className="bg-black/30 px-2 py-1 rounded text-primaryBlue font-mono">{t(spaceComplexity)}</code>
                      </div>
                    </div>
                  </div>

                  {/* Sample Cases side-by-side Input / Expected Output */}
                  {problem?.testCases && problem.testCases.length > 0 && (
                    <div className="space-y-4 border-t border-white/5 pt-6">
                      <h4 className="font-bold text-sm text-gray-200">{t('sample_cases_label')}</h4>
                      <div className="space-y-4">
                        {problem.testCases.map((tc, idx) => (
                          <div key={tc.id || idx} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                            <div className="text-xs font-bold text-primaryBlue">{t('sample_case_title')} {idx + 1}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                              <div>
                                <span className="text-gray-400 block font-semibold mb-1">{t('input_label')}</span>
                                <pre className="bg-black/30 p-2.5 rounded text-gray-300 whitespace-pre-wrap">{tc.input}</pre>
                              </div>
                              <div>
                                <span className="text-gray-400 block font-semibold mb-1">{t('output_label')}</span>
                                <pre className="bg-black/30 p-2.5 rounded text-gray-300 whitespace-pre-wrap">{tc.expectedOutput}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {problem?.constraints && (
                    <div className="space-y-2 border-t border-white/5 pt-6">
                      <h4 className="font-bold text-sm text-gray-200">{t('constraints_label')}</h4>
                      <pre className="p-4 bg-darkCard/80 border border-white/5 rounded-xl text-xs font-mono text-gray-300 whitespace-pre-wrap">
                        {t(problem.constraints)}
                      </pre>
                    </div>
                  )}
                </motion.div>
              );
            })()}

            {leftTab === 'hints' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 font-sans"
              >
                <h3 className="font-bold text-lg font-outfit">{t('hints_help_title')}</h3>
                {problem?.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hint, idx) => {
                    const requiredFails = 3 * hint.hintNumber;
                    const isLocked = failedCount < requiredFails;
                    return (
                      <details 
                        key={hint.id || idx} 
                        className={`glass-panel p-4 rounded-xl cursor-pointer group border ${
                          isLocked ? 'border-red-500/10' : 'border-white/5'
                        }`}
                      >
                        <summary className={`font-semibold text-sm select-none flex items-center justify-between ${
                          isLocked 
                            ? 'text-gray-400 group-open:text-red-400' 
                            : 'text-gray-300 group-open:text-yellowAccent'
                        }`}>
                          <span className="flex items-center gap-1.5 font-sans">
                            {isLocked && <Lock className="w-3.5 h-3.5 text-red-500" />}
                            <span>{t('hint_label')}{hint.hintNumber} {isLocked ? `(${t('locked_label')})` : `(${t('unlocked_label')})`}</span>
                          </span>
                          {isLocked ? (
                            <span className="text-[10px] px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-mono font-bold">
                              {t('locked_label')} ({failedCount}/{requiredFails})
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-mono font-bold">
                              {t('unlocked_label')}
                            </span>
                          )}
                        </summary>
                        
                        {isLocked ? (
                          <div className="text-xs text-gray-400 mt-3 p-3.5 bg-red-950/10 border border-red-500/20 rounded-xl leading-relaxed font-sans cursor-text">
                            <p className="font-semibold text-red-400 mb-1">{t('hint_label')}{hint.hintNumber} is locked.</p>
                            To view this hint, you must have at least <strong className="text-white">{requiredFails}</strong> failed submissions. 
                            You currently have <strong className="text-white">{failedCount}</strong> failed attempts.
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 mt-3 whitespace-pre-line leading-relaxed font-sans cursor-text">
                            {t(hint.content)}
                          </p>
                        )}
                      </details>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">{t('no_hints')}</div>
                )}
              </motion.div>
            )}

            {leftTab === 'editorial' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 font-sans"
              >
                <h3 className="font-bold text-lg font-outfit">{t('editorial_title')}</h3>
                {problem?.editorials && problem.editorials.length > 0 ? (
                  problem.editorials.map((editStep, idx) => {
                    const isLocked = editStep.content.startsWith('[Locked');
                    return (
                      <details key={idx} className="glass-panel p-4 rounded-xl cursor-pointer group font-sans">
                        <summary className="font-semibold text-sm text-gray-300 group-open:text-emerald-400 select-none flex items-center justify-between">
                          <span>{t('editorial_step')} {editStep.stepNumber}: {t(editStep.title)}</span>
                          {isLocked && (
                            <span className="text-[10px] px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-sans">{t('locked_label')}</span>
                          )}
                        </summary>
                        <div className="text-sm text-gray-400 mt-3 whitespace-pre-line leading-relaxed font-sans cursor-text">
                          {t(editStep.content)}
                        </div>
                      </details>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {t(problem?.editorial)}
                  </div>
                )}
              </motion.div>
            )}

            {leftTab === 'discussions' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="font-bold text-lg">{t('discussions_title')}</h3>
                
                {/* Submit new post */}
                <form onSubmit={handleSubmitDiscussion} className="space-y-2">
                  <textarea
                    placeholder={replyId ? t('reply_placeholder') : t('discussions_placeholder')}
                    className="w-full glass-input h-24 text-sm font-sans"
                    value={newDiscussion}
                    onChange={(e) => setNewDiscussion(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    {replyId && (
                      <button 
                        type="button" 
                        onClick={() => setReplyId(null)}
                        className="text-xs text-redError hover:underline"
                      >
                        {t('cancel_reply')}
                      </button>
                    )}
                    <button
                      type="submit"
                      className="ml-auto px-4 py-2 bg-primaryBlue hover:bg-blue-600 rounded-lg text-xs text-white font-semibold flex items-center gap-1.5 transition-all btn-glow"
                    >
                      {t('post_comment')} <SendHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Posts Timeline */}
                <div className="space-y-4 border-t border-white/5 pt-6">
                  {discussions.length > 0 ? (
                    discussions.map((d) => (
                      <div key={d.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-3">
                        <img 
                          src={getAvatarUrl(d.userAvatar)} 
                          alt="avatar" 
                          className="w-8 h-8 rounded-full border border-white/10"
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-200">{d.username}</span>
                            <span className="text-gray-500">
                              {new Date(d.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed font-sans">{t(d.content)}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setReplyId(d.id); showToast('Replying to comment...', 'info'); }}
                              className="text-xs text-primaryBlue hover:underline"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-6">Be the first to start the discussion!</div>
                  )}
                </div>
              </motion.div>
            )}

            {leftTab === 'submissions' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 font-sans"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg font-outfit">{t('submissions_history_title')}</h3>
                  <span className="text-xs text-gray-400 font-mono">Total: {submissionHistory.length}</span>
                </div>

                {submissionHistory.length > 0 ? (
                  <div className="space-y-3">
                    {submissionHistory.map((sub) => {
                      const isExpanded = expandedSubmissionId === sub.id;
                      const isAccepted = sub.verdict === 'ACCEPTED';
                      return (
                        <div key={sub.id} className="glass-panel p-4 rounded-xl space-y-3 border border-white/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                                isAccepted 
                                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                  : 'text-red-400 bg-red-500/10 border-red-500/20'
                              }`}>
                                {sub.verdict || 'SUBMITTED'}
                              </span>
                              <span className="text-xs font-mono text-gray-300 uppercase px-2 py-0.5 bg-white/5 rounded border border-white/10">
                                {sub.language}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              {new Date(sub.createdAt).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/5">
                            <span>{t('runtime_label')}: <strong className="text-gray-200">{sub.executionTimeMs != null ? `${sub.executionTimeMs}ms` : 'N/A'}</strong></span>
                            <span>{t('memory_label')}: <strong className="text-gray-200">{sub.memoryUsedKb != null ? `${sub.memoryUsedKb}KB` : 'N/A'}</strong></span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                                className="text-xs text-primaryBlue hover:underline flex items-center gap-1 font-semibold"
                              >
                                <Code className="w-3.5 h-3.5" />
                                {isExpanded ? 'Hide Code' : 'View Code'}
                              </button>
                              {sub.code && (
                                <button
                                  onClick={() => handleLoadSubmittedCode(sub)}
                                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold ml-2"
                                  title="Load this solution into the Monaco editor"
                                >
                                  <FileCode className="w-3.5 h-3.5" />
                                  Load to Editor
                                </button>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-2"
                            >
                              <div className="text-xs text-gray-400 mb-1 font-semibold flex items-center justify-between">
                                <span>Submitted Code Preview:</span>
                                {sub.code && (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(sub.code);
                                      showToast('Submitted code copied to clipboard', 'success');
                                    }}
                                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                                  >
                                    <Copy className="w-3 h-3" /> Copy
                                  </button>
                                )}
                              </div>
                              <pre className="bg-black/50 p-3 rounded-lg text-xs font-mono text-gray-200 overflow-x-auto max-h-60 border border-white/10 whitespace-pre-wrap">
                                {sub.code || '// Code preview unavailable'}
                              </pre>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-10">
                    No submissions recorded for this problem yet. Submit your solution to track history here!
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Horizontal Drag Handle Splitter (Desktop) */}
      <div
        onMouseDown={() => setIsDraggingH(true)}
        onTouchStart={() => setIsDraggingH(true)}
        onDoubleClick={() => { setLeftPanelWidth(45); localStorage.setItem('codearena_splitters', JSON.stringify({ leftWidth: 45, editorHeight })); }}
        className="hidden md:flex w-1.5 hover:w-2 hover:bg-primaryBlue bg-white/10 cursor-col-resize z-30 transition-all items-center justify-center select-none"
        title="Drag left/right to resize split panels (Double-click to reset 45%)"
      >
        <div className="w-0.5 h-8 bg-white/30 rounded-full" />
      </div>

      {/* Right Code Workspace Panel */}
      <div 
        ref={rightPanelRef}
        className={`w-full md:w-[var(--right-width)] flex flex-col h-[calc(100vh-125px)] md:h-[calc(100vh-73px)] overflow-hidden ${mobileTab === 'editor' ? 'flex' : 'hidden md:flex'}`}
      >
        {/* Editor Settings Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 border-b border-white/5 bg-darkCard/50 z-10 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Custom Code Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setLangDropdownOpen(!langDropdownOpen); setThemeDropdownOpen(false); }}
                className="px-2.5 py-1.5 bg-darkCard border border-white/10 rounded-lg text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1.5 hover:bg-white/5 transition-all shadow-sm"
                title="Select Programming Language"
              >
                <Code className="w-4 h-4 text-primaryBlue" />
                <span>
                  {{
                    python: 'Python 3.11',
                    java: 'Java 17',
                    c: 'C (GCC)',
                    cpp: 'C++ (G++)',
                    javascript: 'NodeJS (JS)',
                  }[language] || 'Python 3.11'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-44 rounded-xl border border-white/10 bg-darkCard p-2 shadow-2xl z-50 text-white"
                  >
                    <div className="px-3 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-white/5 mb-1">
                      Programming Languages
                    </div>
                    {[
                      { id: 'python', label: 'Python 3.11' },
                      { id: 'java', label: 'Java 17' },
                      { id: 'c', label: 'C (GCC)' },
                      { id: 'cpp', label: 'C++ (G++)' },
                      { id: 'javascript', label: 'NodeJS (JS)' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          handleLanguageChange({ target: { value: l.id } });
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                          language === l.id ? 'bg-primaryBlue/20 text-primaryBlue font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{l.label}</span>
                        {language === l.id && <Check className="w-3.5 h-3.5 text-primaryBlue" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom Theme Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setThemeDropdownOpen(!themeDropdownOpen); setLangDropdownOpen(false); }}
                className="px-2.5 py-1.5 bg-darkCard border border-white/10 rounded-lg text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1.5 hover:bg-white/5 transition-all shadow-sm"
                title="Select Editor Theme"
              >
                <Palette className="w-4 h-4 text-purple-400" />
                <span>
                  {{
                    'vs-dark': 'VS Dark',
                    'light': 'VS Light',
                    'hc-black': 'High Contrast',
                  }[editorTheme] || 'VS Dark'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {themeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-48 rounded-xl border border-white/10 bg-darkCard p-2 shadow-2xl z-50 text-white"
                  >
                    <div className="px-3 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-white/5 mb-1">
                      Editor Themes
                    </div>
                    {[
                      { id: 'vs-dark', label: 'VS Dark' },
                      { id: 'light', label: 'VS Light' },
                      { id: 'hc-black', label: 'High Contrast' },
                    ].map((tm) => (
                      <button
                        key={tm.id}
                        type="button"
                        onClick={() => {
                          setEditorTheme(tm.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                          editorTheme === tm.id ? 'bg-purple-500/20 text-purple-400 font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{tm.label}</span>
                        {editorTheme === tm.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Font size */}
            <select
              className="bg-darkCard border border-white/10 rounded-lg py-1.5 px-2 text-xs focus:ring-2 focus:ring-primaryBlue focus:outline-none"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              title="Font Size"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Timer */}
            <div className="flex items-center gap-1.5 bg-black/35 px-2 py-1 rounded-lg border border-white/5 text-gray-300 font-mono text-[11px] mr-1">
              <Clock className="w-3.5 h-3.5 text-yellowAccent animate-pulse" />
              <span>{formatTime(seconds)}</span>
              <button
                onClick={() => setSeconds(0)}
                className="text-gray-500 hover:text-white transition-colors ml-0.5"
                title="Restart Stopwatch"
              >
                <RotateCcw className="w-3 h-3 text-red-400 hover:text-red-300" />
              </button>
            </div>
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".py,.java,.cpp,.c,.js,.txt"
              className="hidden"
            />

            {/* Format Document */}
            <button
              onClick={handleFormatCode}
              title="Format Code (Shift+Alt+F)"
              className="p-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            </button>

            {/* Minimap Toggle */}
            <button
              onClick={() => setMinimapEnabled(!minimapEnabled)}
              title={minimapEnabled ? "Hide Minimap" : "Show Minimap"}
              className={`p-1.5 border rounded-lg transition-colors ${
                minimapEnabled ? 'border-primaryBlue bg-primaryBlue/20 text-white' : 'border-white/10 hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {minimapEnabled ? <Eye className="w-3.5 h-3.5 text-primaryBlue" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* Upload File */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload code from file"
              className="p-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {/* Reset */}
            <button
              onClick={handleResetCode}
              title="Reset code template"
              className="p-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Copy */}
            <button
              onClick={handleCopyCode}
              title="Copy code"
              className="p-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownloadCode}
              title="Download solution file"
              className="p-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen Editor"
              className="p-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Resizable Code & Console Drawer Layout Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* Monaco Editor Container */}
          <div style={{ height: consoleOpen ? `calc(${editorHeight}% - 3px)` : '100%' }} className="relative flex-1 min-h-[120px] overflow-hidden">
            <MonacoEditor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'javascript' ? 'javascript' : language === 'java' ? 'java' : 'python'}
              theme={editorTheme}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: fontSize,
                fontFamily: 'Fira Code, JetBrains Mono, monospace',
                minimap: { enabled: minimapEnabled },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: wordWrapEnabled ? 'on' : 'off',
                lineNumbersMinChars: 3,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                parameterHints: { enabled: true },
                autoClosingBrackets: 'always',
                autoIndent: 'full',
                folding: true,
                formatOnType: true,
                formatOnPaste: true,
                matchBrackets: 'always',
                renderLineHighlight: 'all',
                tabSize: 4,
              }}
              loading={
                <div className="flex items-center justify-center h-full bg-darkBg text-gray-400 text-xs font-mono">
                  <div className="animate-spin w-5 h-5 border-2 border-primaryBlue border-t-transparent rounded-full mr-2" />
                  Loading Monaco Code Editor...
                </div>
              }
            />
          </div>

          {/* Interactive Vertical Drag Handle Splitter */}
          {consoleOpen && (
            <div
              onMouseDown={() => setIsDraggingV(true)}
              onTouchStart={() => setIsDraggingV(true)}
              onDoubleClick={() => { setEditorHeight(60); localStorage.setItem('codearena_splitters', JSON.stringify({ leftWidth: leftPanelWidth, editorHeight: 60 })); }}
              className="h-1.5 hover:h-2 hover:bg-primaryBlue bg-white/10 cursor-row-resize z-20 transition-all flex items-center justify-center select-none shrink-0"
              title="Drag up/down to resize editor & console drawer (Double-click to reset 60%)"
            >
              <div className="h-0.5 w-8 bg-white/30 rounded-full" />
            </div>
          )}

          {/* Console / Output Drawer */}
          <div 
            style={{ height: consoleOpen ? `calc(${100 - editorHeight}% - 3px)` : '42px' }}
            className="border-t border-white/5 bg-darkCard flex flex-col shrink-0 relative overflow-hidden min-h-[42px]"
          >
          {/* Horizontal Console Tabs */}
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 overflow-x-auto">
            <div className="flex">
              <button
                onClick={() => { setConsoleOpen(true); setConsoleTab('sampleCases'); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  consoleOpen && consoleTab === 'sampleCases'
                    ? 'border-primaryBlue text-white bg-white/5'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {t('Sample Cases')}
              </button>
              <button
                onClick={() => { setConsoleOpen(true); setConsoleTab('testCases'); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  consoleOpen && consoleTab === 'testCases'
                    ? 'border-primaryBlue text-white bg-white/5'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {t('Test Cases')}
              </button>
              <button
                onClick={() => { setConsoleOpen(true); setConsoleTab('customCases'); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  consoleOpen && consoleTab === 'customCases'
                    ? 'border-primaryBlue text-white bg-white/5'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {t('Custom Cases')}
              </button>
              <button
                onClick={() => { setConsoleOpen(true); setConsoleTab('testResults'); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  consoleOpen && consoleTab === 'testResults'
                    ? 'border-primaryBlue text-white bg-white/5'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {t('Test Results')}
              </button>
            </div>
            
            <button
              onClick={() => setConsoleOpen(!consoleOpen)}
              className="text-xs text-primaryBlue hover:underline font-semibold shrink-0"
            >
              {consoleOpen ? t('Collapse') : t('Expand')}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {consoleOpen && consoleTab === 'sampleCases' && (
              <motion.div
                key="sampleCases"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-5 space-y-4 max-h-[280px] overflow-y-auto"
              >
                {problem?.testCases && problem.testCases.length > 0 ? (
                  <div className="space-y-4">
                    {/* Case pills */}
                    <div className="flex gap-2 border-b border-white/5 pb-2">
                      {problem.testCases.map((tc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveSampleCase(idx)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            activeSampleCase === idx
                              ? 'bg-blue-600/20 border-blue-500 text-white'
                              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Selected sample case */}
                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <div className="text-xs font-bold text-gray-300 mb-1 border-l-2 border-green-500 pl-2">Input</div>
                        <pre className="bg-black/35 p-3 rounded-lg text-gray-300 whitespace-pre-wrap">
                          {problem.testCases[activeSampleCase]?.input}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-300 mb-1 border-l-2 border-green-500 pl-2">Expected Output</div>
                        <pre className="bg-black/35 p-3 rounded-lg text-gray-300 whitespace-pre-wrap">
                          {problem.testCases[activeSampleCase]?.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No sample cases available.</div>
                )}
              </motion.div>
            )}

            {consoleOpen && consoleTab === 'testCases' && (
              <motion.div
                key="testCases"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-5 space-y-4 max-h-[280px] overflow-y-auto"
              >
                {results.length > 0 ? (
                  <div className="space-y-4">
                    {/* Case pills */}
                    <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
                      {results.map((r, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveTestCase(idx)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            activeTestCase === idx
                              ? 'bg-blue-600/20 border-blue-500 text-white'
                              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <span>Case {idx + 1}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.verdict === 'ACCEPTED' ? 'bg-greenSuccess' : 'bg-redError'}`} />
                        </button>
                      ))}
                    </div>

                    {/* Selected test case */}
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <span className="text-gray-400 font-bold">Verdict:</span>
                        <span className={results[activeTestCase]?.verdict === 'ACCEPTED' ? 'text-greenSuccess font-bold' : 'text-redError font-bold'}>
                          {results[activeTestCase]?.verdict}
                        </span>
                      </div>
                      {!results[activeTestCase]?.isHidden ? (
                        <>
                          <div>
                            <div className="text-xs font-bold text-gray-300 mb-1 border-l-2 border-blue-500 pl-2">Input</div>
                            <pre className="bg-black/35 p-3 rounded-lg text-gray-300 whitespace-pre-wrap">
                              {results[activeTestCase]?.input}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-300 mb-1 border-l-2 border-blue-500 pl-2">Expected Output</div>
                            <pre className="bg-black/35 p-3 rounded-lg text-gray-300 whitespace-pre-wrap">
                              {results[activeTestCase]?.expectedOutput}
                            </pre>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500 italic text-[11px] p-3 bg-white/5 rounded-lg text-center border border-white/5">
                          Outputs hidden for evaluation test cases.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Submit or run code first to evaluate against all test cases.</div>
                )}
              </motion.div>
            )}

            {consoleOpen && consoleTab === 'customCases' && (
              <motion.div
                key="customCases"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-5 space-y-3 max-h-[280px]"
              >
                <label className="block text-xs font-semibold text-gray-400 uppercase">Custom Test Case Input</label>
                <textarea
                  placeholder="Type your custom input here..."
                  className="w-full h-28 bg-black/45 border border-white/10 rounded-lg font-mono text-xs p-3 focus:outline-none focus:ring-1 focus:ring-primaryBlue"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                />
              </motion.div>
            )}

            {consoleOpen && consoleTab === 'testResults' && (
              <motion.div
                key="testResults"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-5 space-y-4 max-h-[280px] overflow-y-auto"
              >
                {verdict ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-gray-400 uppercase font-bold">Verdict:</div>
                      <div className={`text-sm font-extrabold flex items-center gap-1.5 ${
                        verdict === 'ACCEPTED' ? 'text-greenSuccess' :
                        verdict === 'RUNNING' ? 'text-yellowAccent animate-pulse' :
                        'text-redError'
                      }`}>
                        {verdict === 'ACCEPTED' && <CheckCircle className="w-4 h-4 text-greenSuccess" />}
                        {verdict !== 'ACCEPTED' && verdict !== 'RUNNING' && <XCircle className="w-4 h-4 text-redError" />}
                        {verdict}
                      </div>
                      {executionStats && (
                        <div className="text-xs text-gray-400 ml-auto bg-black/40 px-2.5 py-1 rounded-full">
                          Time: {executionStats.timeMs}ms | Memory: {executionStats.memoryKb}KB
                        </div>
                      )}
                    </div>

                    {/* Compilation Error Alert Box */}
                    {verdict === 'COMPILATION_ERROR' && (
                      <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl space-y-2 text-red-300 font-mono text-xs">
                        <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                          <AlertTriangle className="w-4 h-4 text-red-400" /> Compilation Error
                        </div>
                        <div className="text-gray-300 text-xs font-sans">
                          The compiler reported syntax/type errors in your code. Corresponding error lines are highlighted with red markers in the editor.
                        </div>
                        <pre className="bg-black/50 p-3 rounded-lg text-red-300 overflow-x-auto whitespace-pre-wrap max-h-40 border border-red-500/20">
                          {(results && results[0] && (results[0].stderr || results[0].actualOutput)) || 'Compilation failed. Check code syntax.'}
                        </pre>
                      </div>
                    )}

                    {results.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
                          {results.map((r, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveResultCase(idx)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                activeResultCase === idx
                                  ? 'bg-blue-600/20 border-blue-500 text-white'
                                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                              }`}
                            >
                              <span>Case {idx + 1}</span>
                              <span className={`w-1.5 h-1.5 rounded-full ${r.verdict === 'ACCEPTED' ? 'bg-greenSuccess' : 'bg-redError'}`} />
                              <span className="text-[10px] text-gray-400 font-normal">
                                ({r.executionTimeMs != null ? `${r.executionTimeMs}ms` : '0ms'})
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="space-y-2 font-mono text-xs">
                          {/* Test case execution time badge */}
                          <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5 text-xs font-mono">
                            <span className="text-gray-400 font-bold">Execution Time:</span>
                            <span className="text-primaryBlue font-bold">
                              {results[activeResultCase]?.executionTimeMs != null 
                                ? `${results[activeResultCase]?.executionTimeMs} ms` 
                                : (executionStats?.timeMs != null ? `${executionStats.timeMs} ms` : '0 ms')}
                            </span>
                          </div>

                          {!results[activeResultCase]?.isHidden ? (
                            <>
                              {results[activeResultCase]?.stdout && (
                                <div>
                                  <div className="text-xs font-bold text-gray-300 mb-1 border-l-2 border-indigo-500 pl-2">Stdout</div>
                                  <pre className="bg-black/35 p-3 rounded-lg text-gray-300 mt-1 whitespace-pre-wrap">{results[activeResultCase]?.stdout}</pre>
                                </div>
                              )}
                              {results[activeResultCase]?.stderr && (
                                <div className="text-red-400">
                                  <div className="text-xs font-bold text-red-400 mb-1 border-l-2 border-red-500 pl-2">Stderr</div>
                                  <pre className="bg-red-950/20 p-3 rounded-lg text-red-300 mt-1 whitespace-pre-wrap">{results[activeResultCase]?.stderr}</pre>
                                </div>
                              )}
                              {!results[activeResultCase]?.stdout && !results[activeResultCase]?.stderr && (
                                <div className="text-gray-500 italic p-3 bg-white/5 rounded-lg text-center">
                                  No console outputs (stdout/stderr) recorded for this case.
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-500 italic text-[11px] p-3 bg-white/5 rounded-lg text-center border border-white/5">
                              Output logs hidden for evaluation test cases.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No execution results available. Run or submit your code to see results.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/5 mt-auto">
            <span className="text-xs text-gray-500">
              {executing ? 'Executing test cases...' : 'Ready to evaluate'}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCodeRun}
                disabled={executing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10 btn-glow-green text-xs"
              >
                <Play className="w-4 h-4" /> {executing ? 'Running...' : 'Run'}
              </button>
              
              <button
                onClick={handleCodeSubmit}
                disabled={executing || cooldownSec > 0}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 btn-glow-orange text-xs"
              >
                <Send className="w-4 h-4" /> {executing ? 'Evaluating...' : cooldownSec > 0 ? `Cooldown (${cooldownSec}s)` : 'Submit'}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
  </PageTransition>
  );
};

export default ProblemWorkspace;
