import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Activity, ArrowRight } from "lucide-react";

export default function ProfileSetupPage() {
  const { createProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    age: "",
    gender: "female",
    height: "",
    weight: "",
    dietary_habit: "veg",
    medical_conditions: "",
    lifestyle: "moderate",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Basic formatting conversions
      const payload = {
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        dietary_habit: formData.dietary_habit,
        medical_conditions: formData.medical_conditions,
        lifestyle: formData.lifestyle,
      };

      await createProfile(payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center bg-bg-primary px-6 py-12">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-lg glass-panel p-8 md:p-10 rounded-3xl z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-4">
            <Activity className="w-6 h-6 animate-pulse-slow" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Create Health Profile</h2>
          <p className="text-sm text-text-secondary mt-2">
            Let's configure your baseline metrics to personalize your screenings.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-accent-secondary text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Row 1: Age & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                Age (years)
              </label>
              <input
                type="number"
                name="age"
                required
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder-white/30 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                Biological Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 transition-all"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2: Height & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                required
                min="50"
                max="250"
                step="0.1"
                value={formData.height}
                onChange={handleChange}
                placeholder="165"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder-white/30 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                required
                min="10"
                max="300"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                placeholder="60"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder-white/30 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Row 3: Diet & Lifestyle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                Dietary Habit
              </label>
              <select
                name="dietary_habit"
                value={formData.dietary_habit}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 transition-all"
              >
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="flexitarian">Flexitarian</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                Activity Level
              </label>
              <select
                name="lifestyle"
                value={formData.lifestyle}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 transition-all"
              >
                <option value="moderate">Moderate Activity</option>
                <option value="active">High Activity (Active)</option>
                <option value="sedentary">Low Activity (Sedentary)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Medical Conditions */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
              Existing Medical Conditions
            </label>
            <input
              type="text"
              name="medical_conditions"
              value={formData.medical_conditions}
              onChange={handleChange}
              placeholder="e.g., none, anemia history, hypertension"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder-white/30 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 transition-all"
            />
            <p className="text-left text-[11px] text-text-secondary mt-1.5">
              Separate multiple conditions with commas.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent-gradient text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-primary/20 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Save and Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
