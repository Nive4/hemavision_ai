import React from 'react';
import Card from '../common/Card';

const ProgressChart = ({ history = [] }) => {
  if (history.length === 0) {
    return (
      <Card className="bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center">
        <span className="text-xl mb-1">📊</span>
        <span className="text-xs text-slate-400">No screening history to graph. Complete a screening to see trends.</span>
      </Card>
    );
  }

  // Graph dimension constants
  const width = 500;
  const height = 200;
  const padding = 30;

  // Map values to coordinates
  const points = history.map((record, index) => {
    const x = padding + (index / Math.max(1, history.length - 1)) * (width - padding * 2);
    // Invert y: higher score means higher risk, so it should render higher (closer to top padding)
    const y = height - padding - (record.risk_score / 100) * (height - padding * 2);
    return { x, y, score: record.risk_score, label: `Wk ${record.week_number}` };
  });

  // SVG Line path string
  const pathD = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, '');

  return (
    <Card className="bg-slate-900/50 border border-slate-800">
      <h3 className="text-sm font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">
        Anemia Risk Score progression
      </h3>
      
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px] overflow-visible">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />

          {/* Line Path */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#0D9488"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Nodes */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="#0D9488"
                stroke="#020617"
                strokeWidth="2"
                className="cursor-pointer hover:r-7 transition-all"
              />
              <text x={p.x} y={p.y - 10} fill="#94A3B8" fontSize="9" textAnchor="middle">
                {p.score}%
              </text>
              <text x={p.x} y={height - padding + 15} fill="#64748B" fontSize="9" textAnchor="middle">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
};

export default ProgressChart;
