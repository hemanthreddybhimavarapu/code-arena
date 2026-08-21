import React from 'react';
import { 
  Layers, GitFork, Cpu, Type, Calculator, Zap, 
  MoveHorizontal, Database, ArrowUpDown, GitBranch, 
  Binary, Repeat, Search, Maximize2, Tag 
} from 'lucide-react';

/**
 * Returns a React Lucide Icon component corresponding to a problem tag.
 * Standardizes tag names into lowercase/trimmed keys for matching.
 * Fallbacks to generic Tag icon for unrecognized tags.
 */
export const getTagIcon = (tagName, className = "w-3 h-3") => {
  if (!tagName || typeof tagName !== 'string') {
    return <Tag className={className} />;
  }

  const normalized = tagName.trim().toLowerCase();

  if (normalized.includes('array') || normalized.includes('matrix')) {
    return <Layers className={className} />;
  }
  if (normalized.includes('graph')) {
    return <GitFork className={className} />;
  }
  if (normalized.includes('dp') || normalized.includes('dynamic programming')) {
    return <Cpu className={className} />;
  }
  if (normalized.includes('string')) {
    return <Type className={className} />;
  }
  if (normalized.includes('math') || normalized.includes('number')) {
    return <Calculator className={className} />;
  }
  if (normalized.includes('greedy')) {
    return <Zap className={className} />;
  }
  if (normalized.includes('pointer')) {
    return <MoveHorizontal className={className} />;
  }
  if (normalized.includes('hash') || normalized.includes('map') || normalized.includes('set')) {
    return <Database className={className} />;
  }
  if (normalized.includes('sort')) {
    return <ArrowUpDown className={className} />;
  }
  if (normalized.includes('tree') || normalized.includes('trie')) {
    return <GitBranch className={className} />;
  }
  if (normalized.includes('bit') || normalized.includes('binary')) {
    return <Binary className={className} />;
  }
  if (normalized.includes('recur') || normalized.includes('backtrack')) {
    return <Repeat className={className} />;
  }
  if (normalized.includes('search')) {
    return <Search className={className} />;
  }
  if (normalized.includes('window') || normalized.includes('sliding')) {
    return <Maximize2 className={className} />;
  }

  return <Tag className={className} />;
};

/**
 * TagBadge component to render tag title with icon automatically attached.
 */
export const TagBadge = ({ tag, className = '' }) => {
  return (
    <span 
      className={`px-2 py-0.5 bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-300 rounded-md flex items-center gap-1.5 transition-colors hover:border-white/20 ${className}`}
    >
      {getTagIcon(tag, "w-3 h-3 text-primaryBlue")}
      <span>{tag}</span>
    </span>
  );
};
