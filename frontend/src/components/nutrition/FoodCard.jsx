import React from 'react';

const FoodCard = ({ name, type = "Iron Source", detail = "" }) => {
  return (
    <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-900 rounded-xl p-3 shadow-md">
      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold text-sm">
        🥗
      </div>
      <div>
        <span className="text-xs font-bold text-slate-200 block">{name}</span>
        <span className="text-[10px] text-slate-400 block">{detail || type}</span>
      </div>
    </div>
  );
};

export default FoodCard;
