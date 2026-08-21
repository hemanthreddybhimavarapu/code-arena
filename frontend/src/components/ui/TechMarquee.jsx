import React from 'react';

const languages = [
  { name: 'Java 17', color: 'border-orange-500/30 text-orange-400 bg-orange-500/10' },
  { name: 'Python 3.11', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { name: 'C++ (G++)', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { name: 'C (GCC)', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
  { name: 'Node.js JS', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  { name: 'Docker Isolated', color: 'border-sky-500/30 text-sky-400 bg-sky-500/10' },
  { name: 'Spring Boot 3', color: 'border-green-500/30 text-green-400 bg-green-500/10' },
  { name: 'React 18', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' },
];

const TechMarquee = () => {
  return (
    <div className="w-full overflow-hidden py-4 relative bg-black/20 border-y border-white/5 backdrop-blur-sm">
      {/* Soft gradient masks on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-darkBg to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-darkBg to-transparent pointer-events-none" />

      <div className="flex gap-6 animate-marquee whitespace-nowrap">
        {[...languages, ...languages, ...languages].map((item, idx) => (
          <div
            key={idx}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all hover:scale-105 ${item.color}`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechMarquee;
