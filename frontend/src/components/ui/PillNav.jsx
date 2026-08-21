import React from 'react';

const PillNav = ({
  options = [],
  activeValue = '',
  onChange = () => {},
  className = '',
}) => {
  return (
    <div className={`relative flex items-center p-1.5 bg-slate-900/90 border border-white/15 rounded-2xl backdrop-blur-md shadow-xl w-full ${className}`}>
      {options.map((opt) => {
        const isActive = opt.value === activeValue;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 py-2.5 px-4 text-xs sm:text-sm font-extrabold transition-all duration-200 z-10 rounded-xl flex items-center justify-center gap-2 ${
              isActive
                ? 'text-white bg-gradient-to-r from-primaryBlue to-purple-600 shadow-md shadow-blue-500/30'
                : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
            }`}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PillNav;
