import React from 'react';

const ShinyText = ({
  text,
  disabled = false,
  speed = 4,
  className = '',
}) => {
  return (
    <span
      className={`inline-block ${
        disabled
          ? ''
          : 'bg-gradient-to-r from-gray-100 via-yellow-300 via-primaryBlue to-gray-100 bg-[length:200%_auto] bg-clip-text text-transparent animate-shiny-sweep'
      } ${className}`}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
