import React from 'react';
import Card from '../common/Card';

const SymptomForm = ({ symptoms, onChange }) => {
  const symptomQuestions = [
    { key: "fatigue", label: "Extreme Fatigue or tiredness?" },
    { key: "dizziness", label: "Frequent dizziness or lightheadedness?" },
    { key: "headache", label: "Frequent headaches?" },
    { key: "shortness_of_breath", label: "Shortness of breath during minor activities?" },
    { key: "pale_skin", label: "Noticeable paleness in your skin?" },
    { key: "cold_hands_feet", label: "Cold hands or feet?" },
    { key: "weakness", label: "General body weakness?" },
    { key: "brittle_nails", label: "Brittle or easily breaking fingernails?" }
  ];

  return (
    <Card className="flex flex-col gap-4 bg-slate-900/40 border border-slate-800">
      <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
        Symptom Risk Assessment
      </h3>
      
      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
        {symptomQuestions.map((q) => {
          const currentValue = symptoms[q.key] || "no";
          
          return (
            <div key={q.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/40 pb-2">
              <span className="text-xs text-slate-300 font-medium">{q.label}</span>
              
              <div className="flex gap-2">
                {["no", "sometimes", "yes"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onChange(q.key, option)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                      currentValue === option
                        ? option === 'yes'
                          ? 'bg-red-500/20 text-red-400 border-red-500/50'
                          : option === 'sometimes'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                            : 'bg-teal-500/20 text-teal-400 border-teal-500/50'
                        : 'bg-slate-950/50 text-slate-500 border-slate-800/80 hover:text-slate-400'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SymptomForm;
