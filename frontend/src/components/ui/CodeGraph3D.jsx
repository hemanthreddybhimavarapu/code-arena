import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const Node = ({ x, y, z, color, size }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: color,
      boxShadow: `0 0 ${size * 2} ${color}`,
      transform: `translate3d(${x}px, ${y}px, ${z}px)`,
    }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
    }}
    transition={{
      duration: 2 + Math.random() * 2,
      repeat: Infinity,
      ease: "easeInOut",
      delay: Math.random() * 1,
    }}
  />
);

const CodeGraph3D = () => {
  const containerRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Subtle tilt effect (max 15 degrees)
    setRotateX(((y - centerY) / centerY) * -15);
    setRotateY(((x - centerX) / centerX) * 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Generate nodes
  const nodes = Array.from({ length: 30 }, (_, i) => ({
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    z: (Math.random() - 0.5) * 150,
    color: ['rgba(59, 130, 246, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(250, 204, 21, 0.6)'][i % 3],
    size: 8 + Math.random() * 12,
  }));

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-[300px] h-[300px]"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 30,
          mass: 0.5,
        }}
      >
        {nodes.map((node, i) => (
          <Node key={i} {...node} />
        ))}
        
        {/* Central core element */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/10 bg-darkBg/50 backdrop-blur-sm flex items-center justify-center"
          style={{ transform: 'translateZ(50px)' }}
        >
          <div className="text-2xl font-bold bg-gradient-to-r from-primaryBlue to-purple-500 bg-clip-text text-transparent">
            OJ
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CodeGraph3D;