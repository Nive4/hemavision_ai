import React from 'react';

const RiskGauge = ({ score = 0, level = "Normal" }) => {
  // Constants for circle drawing
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const colorTiers = {
    Normal: { text: "text-teal-400", border: "stroke-teal-500", shadow: "shadow-teal-500/20" },
    Mild: { text: "text-yellow-400", border: "stroke-yellow-500", shadow: "shadow-yellow-500/20" },
    Moderate: { text: "text-orange-400", border: "stroke-orange-500", shadow: "shadow-orange-500/20" },
    Severe: { text: "text-red-400", border: "stroke-red-500", shadow: "shadow-red-500/20" }
  };

  const currentTier = colorTiers[level] || colorTiers.Normal;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        {/* SVG Ring */}
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            className="stroke-slate-800"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={`${currentTier.border} transition-all duration-1000 ease-out`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        
        {/* Centered Score */}
        <div className="absolute text-center">
          <span className="text-3xl font-extrabold text-slate-100">{score}%</span>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Fused Risk</p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold bg-slate-950/80 border border-slate-800 ${currentTier.text}`}>
          {level} Risk Profile
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
