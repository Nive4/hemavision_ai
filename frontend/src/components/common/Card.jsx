import React from 'react';

const Card = ({ children, className = '', hoverEffect = true }) => {
  return (
    <div className={`bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl ${
      hoverEffect ? 'hover:shadow-teal-500/5 hover:border-slate-700/60 transition-all duration-300' : ''
    } ${className}`}>
      {children}
    </div>
  );
};

export default Card;
