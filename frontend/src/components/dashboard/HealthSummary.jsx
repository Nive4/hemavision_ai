import React from 'react';
import Card from '../common/Card';

const HealthSummary = ({ height = 175, weight = 70, bloodType = "O+" }) => {
  // BMI calculation
  const heightInMeters = height / 100;
  const bmi = heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)).toFixed(1) : 0;
  
  let bmiCategory = "Normal";
  let bmiColor = "text-teal-400";
  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    bmiColor = "text-blue-400";
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = "Overweight";
    bmiColor = "text-orange-400";
  } else if (bmi >= 30) {
    bmiCategory = "Obese";
    bmiColor = "text-red-400";
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-slate-900/40 p-4">
        <span className="text-xs text-slate-400 font-medium">Body Mass Index (BMI)</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-slate-100">{bmi}</span>
          <span className={`text-xs font-semibold ${bmiColor}`}>{bmiCategory}</span>
        </div>
      </Card>
      
      <Card className="bg-slate-900/40 p-4">
        <span className="text-xs text-slate-400 font-medium">Blood Group Type</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-teal-400">{bloodType}</span>
          <span className="text-xs text-slate-500 font-medium">RH Factor positive</span>
        </div>
      </Card>

      <Card className="bg-slate-900/40 p-4">
        <span className="text-xs text-slate-400 font-medium">Height Metric</span>
        <div className="mt-1">
          <span className="text-xl font-bold text-slate-200">{height}</span>
          <span className="text-xs text-slate-500 ml-1">cm</span>
        </div>
      </Card>

      <Card className="bg-slate-900/40 p-4">
        <span className="text-xs text-slate-400 font-medium">Weight Metric</span>
        <div className="mt-1">
          <span className="text-xl font-bold text-slate-200">{weight}</span>
          <span className="text-xs text-slate-500 ml-1">kg</span>
        </div>
      </Card>
    </div>
  );
};

export default HealthSummary;
