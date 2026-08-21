import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code2, Flame, Trophy, ChevronRight, ChevronLeft, Check, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STEPS = [
  {
    icon: Code2,
    badge: 'Step 1 of 4 • Sandboxed Compiler',
    title: 'Multi-Language Execution Engine',
    description: 'Solve algorithmic challenges in Java 17, Python 3.11, C++, C, and Node.js with instant sandbox feedback, memory metrics, and runtime analysis.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Terminal,
    badge: 'Step 2 of 4 • Workspace',
    title: 'Monaco Editor & Real-Time Test Cases',
    description: 'Enjoy a VS Code-grade coding environment complete with custom test cases, syntax highlighting, step-by-step hints, and editorial solutions.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Flame,
    badge: 'Step 3 of 4 • Analytics',
    title: 'Streaks, Contribution Grid & Analytics',
    description: 'Track daily problem-solving streaks, submission history breakdown, activity calendar, and achievement badges on your personal dashboard.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Trophy,
    badge: 'Step 4 of 4 • Ranks',
    title: 'Global Leaderboards & Community',
    description: 'Compete against software engineers worldwide, unlock tier badges (Gold, Silver, Bronze), and climb the global ranking leaderboard.',
    color: 'from-emerald-500 to-teal-600',
  },
];

export const OnboardingTour = ({ forceOpen = false, onClose = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user, t } = useApp();

  useEffect(() => {
    const hasCompleted = localStorage.getItem('codearena_onboarding_completed');
    if (forceOpen || (!hasCompleted && user)) {
      setIsOpen(true);
    }
  }, [user, forceOpen]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const finishTour = () => {
    localStorage.setItem('codearena_onboarding_completed', 'true');
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-gray-900/95 dark:bg-gray-950/95 text-white shadow-2xl backdrop-blur-2xl z-10"
        >
          {/* Header Banner */}
          <div className={`p-6 bg-gradient-to-r ${step.color} relative overflow-hidden`}>
            <div className="absolute -right-6 -bottom-6 opacity-20">
              <Icon className="h-40 w-40 text-white" />
            </div>
            
            <button
              onClick={finishTour}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-xs font-semibold text-white mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              {t(step.badge)}
            </span>
            
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white leading-snug">
                {t(step.title)}
              </h3>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6">
            <p className="text-sm text-gray-300 leading-relaxed min-h-[70px]">
              {t(step.description)}
            </p>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center gap-2 my-6">
              {STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-primaryBlue'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentStep === 0
                    ? 'opacity-30 cursor-not-allowed text-gray-500'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('onboarding_prev')}
              </button>

              <button
                onClick={finishTour}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {t('onboarding_skip')}
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primaryBlue to-indigo-600 hover:from-primaryBlue/90 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-primaryBlue/25 transition-all transform hover:scale-105 active:scale-95"
              >
                {currentStep === STEPS.length - 1 ? (
                  <>
                    {t('onboarding_finish')} <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {t('onboarding_next')} <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
