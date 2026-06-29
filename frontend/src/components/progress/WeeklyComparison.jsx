import React from 'react';
import Card from '../common/Card';

const WeeklyComparison = ({ history = [] }) => {
  if (history.length < 2) {
    return (
      <Card className="bg-slate-900/40 p-4">
        <span className="text-xs text-slate-400">Complete another screening next week to unlock historical comparisons.</span>
      </Card>
    );
  }

  // Sorted history, last index is latest, second to last is previous
  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  
  const diff = latest.risk_score - previous.risk_score;
  const isReduced = diff <= 0;

  return (
    <Card className="bg-slate-900/40 border border-slate-800/80 p-4">
      <span className="text-xs text-slate-400 font-semibold block">Weekly Comparison Analysis</span>
      
      <div className="flex items-center gap-3 mt-2">
        <span className={`text-2xl font-bold ${isReduced ? 'text-teal-400' : 'text-rose-400'}`}>
          {isReduced ? '↓' : '↑'} {Math.abs(diff).toFixed(1)}%
        </span>
        <div>
          <span className="text-[11px] text-slate-200 block font-semibold">
            {isReduced ? 'Anemia Risk Reduced' : 'Anemia Risk Increased'}
          </span>
          <span className="text-[10px] text-slate-500 block">
            Comparing Week {previous.week_number} to Week {latest.week_number}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default WeeklyComparison;
