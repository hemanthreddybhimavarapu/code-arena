import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Terminal, Cpu, HardDrive, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const CODE_TEMPLATES = {
  python: {
    name: 'binary_search.py',
    lang: 'Python 3.11',
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Interactive demo input
dataset = [1, 3, 5, 7, 9, 11, 13, 15]
print("Target indices matched:", binary_search(dataset, 9))`
  },
  javascript: {
    name: 'two_sum.js',
    lang: 'Node.js v20',
    code: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

// Running automated test cases
console.log("Matched indices:", twoSum([2, 7, 11, 15], 9));`
  },
  cpp: {
    name: 'quicksort.cpp',
    lang: 'GCC 12 / C++20',
    code: `#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high], i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) swap(arr[++i], arr[j]);
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

int main() {
    vector<int> data = {10, 7, 8, 9, 1, 5};
    cout << "QuickSort algorithm executed." << endl;
    return 0;
}`
  }
};

const InteractivePlayground = () => {
  const [selectedLang, setSelectedLang] = useState('python');
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ cpu: 0, ram: 128, time: 0 });

  const currentTemplate = CODE_TEMPLATES[selectedLang];

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalLogs([]);
    setProgress(0);
    setStats({ cpu: 0, ram: 128, time: 0 });

    const logs = [
      { text: 'Spinning up Docker sandbox environment...', type: 'info', delay: 200 },
      { text: `Compiling source using ${currentTemplate.lang}...`, type: 'info', delay: 750 },
      { text: 'Executing test runner...', type: 'process', delay: 1400 },
      { text: '✔ Test case 1: Passed [standard input] (4ms)', type: 'success', delay: 1700 },
      { text: '✔ Test case 2: Passed [boundary values] (6ms)', type: 'success', delay: 2000 },
      { text: '✔ Test case 3: Passed [empty limits] (3ms)', type: 'success', delay: 2300 },
      { text: '✔ All tests successfully verified!', type: 'finish', delay: 2800 }
    ];

    logs.forEach((log) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [...prev, log]);
        if (log.type === 'success') {
          setStats((prev) => ({
            cpu: Math.floor(Math.random() * 20) + 12,
            ram: Math.floor(Math.random() * 30) + 160,
            time: prev.time + parseFloat(log.text.match(/\((\d+)ms\)/)?.[1] || 0)
          }));
        }
        if (log.type === 'finish') {
          setIsRunning(false);
          setProgress(100);
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#3b82f6', '#c084fc', '#eab308']
          });
        }
      }, log.delay);
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress >= 95) {
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
      }
    }, 120);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-slate-200/20 dark:border-white/10 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-slate-950/70 backdrop-blur-2xl flex flex-col md:flex-row text-left transition-all duration-300 hover:shadow-[0_0_60px_rgba(168,85,247,0.2)]">
      {/* Editor Pane */}
      <div className="flex-1 flex flex-col border-r border-slate-200/10">
        {/* Editor Tab Headers */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900/50 border-b border-slate-200/10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-lg shadow-red-500/30" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-lg shadow-yellow-500/30" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 shadow-lg shadow-green-500/30" />
            <span className="text-xs font-mono font-bold text-gray-400 ml-2">
              {currentTemplate.name}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Object.keys(CODE_TEMPLATES).map((lang) => (
              <button
                key={lang}
                disabled={isRunning}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1 rounded-lg text-xxs font-bold uppercase tracking-widest transition-all ${
                  selectedLang === lang
                    ? 'bg-gradient-to-r from-primaryBlue to-purple-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-grow p-5 min-h-[250px] max-h-[300px] overflow-y-auto font-mono text-xs text-gray-300 leading-relaxed bg-slate-950/40">
          <pre className="whitespace-pre-wrap select-none">
            {currentTemplate.code.split('\n').map((line, idx) => (
              <div key={idx} className="flex hover:bg-white/5 px-2 rounded">
                <span className="w-8 text-right pr-4 text-slate-600 select-none border-r border-slate-800 mr-4">
                  {idx + 1}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </pre>
        </div>

        {/* Editor Action Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-200/10 flex items-center justify-between">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primaryBlue to-purple-600 hover:scale-[1.03] active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isRunning ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            {isRunning ? 'RUNNING TESTCASES...' : 'EXECUTE PLAYGROUND'}
          </button>
          <div className="text-xxs text-gray-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-yellowAccent" />
            Live compiler sandbox simulation
          </div>
        </div>
      </div>

      {/* Terminal / Telemetry Pane */}
      <div className="w-full md:w-80 flex flex-col bg-slate-950/80 text-gray-300 font-mono text-xs">
        <div className="px-5 py-4 bg-slate-900/80 border-b border-slate-200/10 flex items-center gap-2 text-gray-400">
          <Terminal className="w-4 h-4 text-primaryBlue animate-pulse" />
          <span className="font-bold text-xxs uppercase tracking-wider">Evaluation Output</span>
        </div>

        {/* Live Logs */}
        <div className="flex-grow p-5 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2.5">
          {terminalLogs.length === 0 && !isRunning && (
            <div className="text-slate-600 flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
              <Terminal className="w-8 h-8 opacity-20" />
              <p className="text-xxs uppercase tracking-wider">Click Execute to start run evaluation</p>
            </div>
          )}
          <AnimatePresence>
            {terminalLogs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`leading-relaxed text-xxs ${
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'finish' ? 'text-yellowAccent font-bold' : 'text-gray-300'
                }`}
              >
                <span className="text-slate-700 mr-2">&gt;</span>
                {log.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progress and simulated hardware monitor */}
        <div className="p-5 bg-slate-900/50 border-t border-slate-200/10 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xxs text-gray-500 font-bold tracking-wider">
              <span>SANDBOX RESOURCE POOL</span>
              <span>{isRunning ? `${progress}%` : progress === 100 ? '100% (READY)' : 'STANDBY'}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primaryBlue via-purple-500 to-emerald-400 transition-all duration-150"
                style={{ width: `${isRunning ? progress : progress === 100 ? 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Telemetry Stats */}
          <div className="grid grid-cols-3 gap-2.5 text-center border-t border-slate-200/10 pt-4">
            <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-200/10">
              <div className="text-slate-500 flex items-center justify-center gap-1 mb-1">
                <Cpu className="w-3 h-3 text-primaryBlue" />
                <span className="text-xxs font-bold">CPU</span>
              </div>
              <div className="text-xs font-bold text-white font-mono">
                {isRunning ? `${stats.cpu}%` : '0%'}
              </div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-200/10">
              <div className="text-slate-500 flex items-center justify-center gap-1 mb-1">
                <HardDrive className="w-3 h-3 text-purple-400" />
                <span className="text-xxs font-bold">RAM</span>
              </div>
              <div className="text-xs font-bold text-white font-mono">
                {isRunning ? `${stats.ram}MB` : '128MB'}
              </div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-200/10">
              <div className="text-slate-500 flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span className="text-xxs font-bold">TIME</span>
              </div>
              <div className="text-xs font-bold text-white font-mono">
                {isRunning || stats.time > 0 ? `${stats.time}ms` : '0ms'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractivePlayground;
