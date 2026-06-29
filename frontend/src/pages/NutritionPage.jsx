import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  Apple, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Plus,
  RefreshCw,
  Search,
  ScanHeart
} from "lucide-react";
import { Link } from "react-router-dom";

export default function NutritionPage() {
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Interactive Iron Estimator State
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [customDietHabit, setCustomDietHabit] = useState("veg");
  
  // Hardcoded food library with approximate iron content per 100g
  const FOOD_DATABASE = [
    { name: "Chicken Liver (cooked)", iron: 11.6, category: "non-veg" },
    { name: "Beef (cooked)", iron: 3.8, category: "non-veg" },
    { name: "Sardines (canned)", iron: 2.9, category: "non-veg" },
    { name: "Chicken Breast", iron: 1.0, category: "non-veg" },
    { name: "Spinach (cooked)", iron: 3.6, category: "veg" },
    { name: "Lentils (cooked)", iron: 3.3, category: "veg" },
    { name: "Pumpkin Seeds", iron: 8.8, category: "veg" },
    { name: "Dark Chocolate (70%+)", iron: 8.0, category: "veg" },
    { name: "Tofu", iron: 2.7, category: "veg" },
    { name: "Quinoa (cooked)", iron: 1.5, category: "veg" },
    { name: "Dried Apricots", iron: 2.7, category: "veg" },
    { name: "Oatmeal (cooked)", iron: 1.2, category: "veg" }
  ];

  useEffect(() => {
    const fetchLatestScreening = async () => {
      try {
        setLoading(true);
        const res = await api.get("/screening/latest");
        setScreening(res.data);
      } catch (err) {
        console.log("No latest screening found or error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestScreening();
  }, []);

  const addFoodToEstimator = (food) => {
    setSelectedFoods([...selectedFoods, { ...food, id: Date.now() }]);
  };

  const removeFoodFromEstimator = (id) => {
    setSelectedFoods(selectedFoods.filter(f => f.id !== id));
  };

  const calculateTotalIron = () => {
    return selectedFoods.reduce((sum, f) => sum + f.iron, 0).toFixed(1);
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "normal": return "text-success border-success/30 bg-success/5";
      case "mild": return "text-warning border-warning/30 bg-warning/5";
      case "moderate": return "text-orange-400 border-orange-400/30 bg-orange-400/5";
      case "severe": return "text-danger border-danger/30 bg-danger/5";
      default: return "text-text-secondary border-white/5 bg-white/5";
    }
  };

  // Safe fallback recommendations if no screening exists
  const getFallbackRecommendations = () => {
    const isVeg = customDietHabit === "veg" || customDietHabit === "vegan";
    return {
      risk_level: "General Health",
      summary: "Incorporate regular iron-rich elements to prevent iron-deficiency anemia.",
      frequency: "Ensure 2-3 iron-rich portions daily, paired with absorption enhancers.",
      iron_sources: isVeg 
        ? ["Pumpkin & Sesame Seeds", "Lentils, Chickpeas & Kidney Beans", "Spinach & Cooked Greens", "Tofu & Tempeh", "Dark Chocolate (70%+)", "Dried Apricots & Raisins"]
        : ["Chicken Liver & Beef", "Oysters & Clams", "Lentils & Beans", "Tuna & Salmon", "Eggs", "Pumpkin Seeds"],
      vitamin_c_sources: ["Oranges & Strawberries", "Bell Peppers (Red/Yellow)", "Broccoli & Tomatoes", "Lemon juice dressing"],
      inhibitors_to_avoid: ["Coffee & Black/Green Tea (avoid with meals)", "Milk, Yogurt & Cheese (consume 2 hours apart from iron)", "Antacids"]
    };
  };

  const currentPlan = screening?.diet_recommendations || getFallbackRecommendations();

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-accent-gradient bg-clip-text text-transparent flex items-center gap-3">
            <Apple className="w-8 h-8 text-accent-primary" />
            <span>Nutrition Recommendation Engine</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Personalized iron absorption diet plans based on your latest anemia risk factors.
          </p>
        </div>
        {!screening && (
          <div className="flex items-center gap-3 bg-bg-secondary p-1.5 rounded-xl border border-white/5">
            <span className="text-xs text-text-secondary pl-2 font-mono">Select Diet:</span>
            <select
              value={customDietHabit}
              onChange={(e) => setCustomDietHabit(e.target.value)}
              className="bg-bg-primary text-xs font-semibold text-text-primary px-3 py-1.5 rounded-lg border border-white/10 outline-none"
            >
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Customized Diet Plan Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Status Card */}
            <div className="glass-panel p-6 rounded-3xl border bg-gradient-to-br from-bg-secondary to-bg-primary relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">Plan Context</span>
                  <div className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getRiskColor(currentPlan.risk_level)}`}>
                    {currentPlan.risk_level}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-text-primary">
                  {currentPlan.summary}
                </h2>
                
                <div className="p-3 bg-accent-primary/5 rounded-xl border border-accent-primary/10 text-xs text-accent-secondary leading-relaxed">
                  <strong>Guideline Frequency:</strong> {currentPlan.frequency}
                </div>

                {screening && (
                  <p className="text-[10px] text-text-secondary">
                    Recommendation generated automatically on {new Date(screening.created_at).toLocaleDateString()}.
                  </p>
                )}
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Iron Sources Card */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Flame className="w-4 h-4 text-accent-primary" />
                  <span>Primary Iron-Rich Sources</span>
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Incorporate these items as focal points in your lunch and dinner:
                </p>
                
                <div className="space-y-2">
                  {currentPlan.iron_sources.map((src, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      <span>{src}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Absorption enhancers & blockers */}
              <div className="space-y-6">
                
                {/* Enhancers */}
                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Absorption Boosters (Vitamin C)</span>
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Combine plant iron with these to double the intestinal absorption rate:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPlan.vitamin_c_sources.map((item, idx) => (
                      <span key={idx} className="text-[10px] bg-success/10 border border-success/20 text-success px-2 py-1 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inhibitors */}
                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs text-danger flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Absorption Inhibitors (Avoid)</span>
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Avoid consuming these within 2 hours of your iron-heavy meals:
                  </p>
                  <div className="space-y-1.5 text-[10px] text-text-secondary">
                    {currentPlan.inhibitors_to_avoid.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger/80 mt-1.5 shrink-0"></span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Warning if screening is moderate/severe */}
            {screening && (screening.final_risk_level === "Moderate" || screening.final_risk_level === "Severe") && (
              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-xs text-red-300 leading-relaxed flex gap-3">
                <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
                <div>
                  <strong>Medical Disclaimer:</strong> Your results indicate moderate-to-severe pallor. Dietary updates should complement medical support. Please consult a physician to review a serum ferritin count and confirm if clinical iron infusions/tablets are required.
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Interactive Meal Iron Estimator */}
          <div className="glass-panel p-6 rounded-3xl space-y-6 self-start">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Apple className="w-4 h-4 text-accent-primary" />
                <span>Iron Intake Estimator</span>
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Add foods to simulate a meal's total iron density. Daily recommended intake (RDA) is ~8mg for men and ~18mg for women.
              </p>
            </div>

            {/* Selector list */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-text-primary">Food Database (per 100g)</div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-white/5 rounded-xl p-1.5 bg-white/5">
                {FOOD_DATABASE.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => addFoodToEstimator(food)}
                    className="w-full text-left text-[11px] p-2 rounded-lg bg-bg-secondary hover:bg-white/5 border border-white/5 flex justify-between items-center transition-all"
                  >
                    <span className="truncate text-text-primary capitalize">{food.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-accent-secondary">{food.iron} mg</span>
                      <Plus className="w-3.5 h-3.5 text-text-secondary" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected items list */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-text-primary flex justify-between items-center">
                <span>Selected Items</span>
                <span className="font-mono text-xs text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                  Total: {calculateTotalIron()} mg
                </span>
              </div>

              <div className="space-y-1.5 min-h-[80px] bg-bg-secondary p-2.5 rounded-xl border border-white/5 max-h-36 overflow-y-auto">
                {selectedFoods.map((food) => (
                  <div 
                    key={food.id}
                    className="flex justify-between items-center text-[10px] p-1.5 rounded bg-white/5 text-text-primary"
                  >
                    <span>{food.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{food.iron} mg</span>
                      <button 
                        onClick={() => removeFoodFromEstimator(food.id)}
                        className="text-danger hover:underline text-[9px]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {selectedFoods.length === 0 && (
                  <div className="h-full flex items-center justify-center text-text-secondary text-[10px] py-4">
                    No items selected. Click + above.
                  </div>
                )}
              </div>
            </div>

            {/* Quick compare stats */}
            {selectedFoods.length > 0 && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[10px] text-text-secondary leading-relaxed">
                Meal contains <strong>{calculateTotalIron()} mg</strong> of iron. 
                {parseFloat(calculateTotalIron()) >= 10 ? (
                  <span className="text-success block mt-1">Excellent! This is a high-density iron meal. Combine with oranges or lemon for optimal absorption.</span>
                ) : (
                  <span className="text-warning block mt-1">Good start. Try adding pumpkin seeds or spinach to increase density.</span>
                )}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
