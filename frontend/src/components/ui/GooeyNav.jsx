import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const GooeyNav = ({ links = [], className = '' }) => {
  const location = useLocation();

  return (
    <div className={`relative flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md ${className}`}>
      {links.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`relative px-4 py-2 text-xs md:text-sm font-bold transition-colors duration-200 ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-gray-100'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="gooey-nav-pill"
                className="absolute inset-0 bg-gradient-to-r from-primaryBlue/80 to-purple-600/80 rounded-full shadow-md backdrop-blur-md"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {link.icon}
              {link.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default GooeyNav;
