import React from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * Renders problem difficulty badge with visual star ratings:
 * - EASY   -> 1 Star (Green)
 * - MEDIUM -> 2 Stars (Gold/Yellow)
 * - HARD   -> 3 Stars (Red/Orange)
 */
export const DifficultyBadge = ({ difficulty = 'EASY', showLabel = false, className = '' }) => {
  const { t } = useApp();
  const normalized = (difficulty || 'EASY').toUpperCase();

  let starCount = 1;
  let colorClasses = 'text-greenSuccess bg-green-500/10 border-green-500/20';

  if (normalized === 'MEDIUM') {
    starCount = 2;
    colorClasses = 'text-yellowAccent bg-yellow-500/10 border-yellow-500/20';
  } else if (normalized === 'HARD') {
    starCount = 3;
    colorClasses = 'text-red-400 bg-red-500/10 border-red-500/20';
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-extrabold border rounded-full shadow-sm transition-all hover:scale-105 ${colorClasses} ${className}`}
      title={`${normalized} Difficulty (${starCount} Star${starCount > 1 ? 's' : ''})`}
    >
      <span className="flex items-center gap-0.5">
        {Array.from({ length: starCount }).map((_, idx) => (
          <Star key={idx} className="w-3.5 h-3.5 fill-current shrink-0" />
        ))}
      </span>
      {showLabel && <span className="capitalize ml-1">{t(normalized.charAt(0) + normalized.slice(1).toLowerCase())}</span>}
    </span>
  );
};

export default DifficultyBadge;
