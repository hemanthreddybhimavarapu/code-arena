import React, { useState, useEffect } from 'react';

const TextType = ({
  text = '',
  speed = 50,
  className = '',
  cursorClassName = 'text-primaryBlue',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, speed, text]);

  return (
    <span className={className}>
      {displayedText}
      <span className={`inline-block animate-pulse font-mono ${cursorClassName}`}>|</span>
    </span>
  );
};

export default TextType;
