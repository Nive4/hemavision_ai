import React from 'react';
import Card from '../common/Card';

const MealPlan = ({ dietaryPreference = 'omnivore', riskLevel = 'Normal' }) => {
  const isVeg = dietaryPreference.toLowerCase() === 'veg' || dietaryPreference.toLowerCase() === 'vegan';

  const meals = {
    breakfast: {
      title: "Breakfast",
      veg: "Fortified Oatmeal with sliced strawberries and pumpkin seeds.",
      nonVeg: "Boiled Eggs with whole wheat toast and side of sliced oranges."
    },
    lunch: {
      title: "Lunch",
      veg: "Lentil spinach soup paired with lemon dressing salad.",
      nonVeg: "Grilled Salmon/Tuna with quinoa salad and broccoli."
    },
    dinner: {
      title: "Dinner",
      veg: "Tofu stir-fry with broccoli, bell peppers and sesame seeds.",
      nonVeg: "Sautéed chicken liver or grilled beef with spinach side."
    }
  };

  return (
    <Card className="bg-slate-900/50 border border-slate-800">
      <h3 className="text-sm font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">
        Personalized Iron Absorption Meal Blueprint
      </h3>
      
      <div className="flex flex-col gap-4">
        {Object.values(meals).map((m) => (
          <div key={m.title} className="flex gap-4 items-start border-b border-slate-800/40 pb-3 last:border-b-0 last:pb-0">
            <div className="bg-teal-500/10 px-3 py-1.5 rounded-lg text-teal-400 font-extrabold text-[10px] uppercase tracking-wider min-w-[70px] text-center">
              {m.title}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isVeg ? m.veg : m.nonVeg}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MealPlan;
