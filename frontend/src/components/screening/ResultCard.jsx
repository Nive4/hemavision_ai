import React from 'react';
import Card from '../common/Card';
import RiskGauge from '../dashboard/RiskGauge';

const ResultCard = ({ result }) => {
  if (!result) return null;

  const score = result.fusion_score ?? 0;
  const level = result.final_risk_level ?? "Normal";
  const weights = result.weights_used ?? {};

  return (
    <Card className="bg-slate-900/50 border border-slate-800">
      <h3 className="text-sm font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">
        Clinical Diagnostic Fusion
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Gauge */}
        <RiskGauge score={score} level={level} />
        
        {/* Weight Allocation & Details */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-slate-300">Modality Contribution Weights:</span>
          
          <div className="flex flex-col gap-2">
            {Object.entries(weights).map(([modality, weight]) => (
              <div key={modality} className="flex justify-between items-center bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-900">
                <span className="text-xs text-slate-400 capitalize">{modality} Channel</span>
                <span className="text-xs font-bold text-teal-400">{(weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 italic mt-2 leading-normal">
            *Weights are dynamically adjusted in real-time depending on the presence of uploaded sensor modalities.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ResultCard;
