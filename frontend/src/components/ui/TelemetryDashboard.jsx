import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Server, ShieldCheck, Zap, Activity } from 'lucide-react';

const TelemetryDashboard = () => {
  const [telemetry, setTelemetry] = useState({
    activeSandboxes: 142,
    cpuUtilization: 14.8,
    ramAllocation: 34.2,
    latency: 5.2,
    compileUptime: 99.987,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const changeDir = Math.random() > 0.5 ? 1 : -1;
        const newCpu = Math.max(8.0, Math.min(35.0, prev.cpuUtilization + (Math.random() * 1.8 * changeDir)));
        const newRam = Math.max(28.0, Math.min(45.0, prev.ramAllocation + (Math.random() * 0.8 * changeDir)));
        const newSandboxes = Math.max(120, Math.min(180, prev.activeSandboxes + (Math.random() > 0.65 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
        const newLatency = Math.max(3.8, Math.min(8.5, prev.latency + (Math.random() * 0.4 * changeDir)));
        const newUptime = Math.min(100, Math.max(99.980, prev.compileUptime + (Math.random() * 0.0002 * changeDir)));

        return {
          activeSandboxes: newSandboxes,
          cpuUtilization: parseFloat(newCpu.toFixed(1)),
          ramAllocation: parseFloat(newRam.toFixed(1)),
          latency: parseFloat(newLatency.toFixed(1)),
          compileUptime: parseFloat(newUptime.toFixed(3)),
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full text-left">
      {/* Metric 1 */}
      <div className="bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-blue-500/35">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Server className="w-12 h-12" />
        </div>
        <div className="text-xxs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Sandboxes Active
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          {telemetry.activeSandboxes}
        </div>
        <div className="text-xxs text-emerald-500 font-bold mt-1">Docker Isolated</div>
      </div>

      {/* Metric 2 */}
      <div className="bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-purple-500/35">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Cpu className="w-12 h-12" />
        </div>
        <div className="text-xxs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          CPU Pool Load
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          {telemetry.cpuUtilization}%
        </div>
        <div className="text-xxs text-slate-400 dark:text-gray-400 font-bold mt-1">Simulated load</div>
      </div>

      {/* Metric 3 */}
      <div className="bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-yellow-500/35">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Activity className="w-12 h-12" />
        </div>
        <div className="text-xxs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
          RAM Utilized
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          {telemetry.ramAllocation}%
        </div>
        <div className="text-xxs text-yellowAccent font-bold mt-1">Dynamic scale</div>
      </div>

      {/* Metric 4 */}
      <div className="bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-emerald-500/35">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Zap className="w-12 h-12" />
        </div>
        <div className="text-xxs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Queue Latency
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          {telemetry.latency}ms
        </div>
        <div className="text-xxs text-emerald-400 font-bold mt-1">Average run</div>
      </div>

      {/* Metric 5 */}
      <div className="bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-blue-500/35 col-span-2 md:col-span-1">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <div className="text-xxs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-greenSuccess animate-pulse" />
          Core Uptime
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          {telemetry.compileUptime}%
        </div>
        <div className="text-xxs text-greenSuccess font-bold mt-1">Health index</div>
      </div>
    </div>
  );
};

export default TelemetryDashboard;
