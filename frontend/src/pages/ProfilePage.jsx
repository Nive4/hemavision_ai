import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Activity, Edit2, Check } from "lucide-react";

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: "",
    gender: "female",
    height: "",
    weight: "",
    dietary_habit: "veg",
    medical_conditions: "",
    lifestyle: "moderate",
  });

  // Sync state with context profile
  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age.toString(),
        gender: profile.gender,
        height: profile.height.toString(),
        weight: profile.weight.toString(),
        dietary_habit: profile.dietary_habit,
        medical_conditions: profile.medical_conditions || "",
        lifestyle: profile.lifestyle,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateBMI = () => {
    const h = parseFloat(formData.height) / 100;
    const w = parseFloat(formData.weight);
    if (h > 0 && w > 0) {
      return (w / (h * h)).toFixed(2);
    }
    return "0.00";
  };

  const getBMICategory = (bmi) => {
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: "Underweight", color: "text-amber-400" };
    if (b < 25) return { label: "Normal weight", color: "text-green-400" };
    if (b < 30) return { label: "Overweight", color: "text-amber-400" };
    return { label: "Obese", color: "text-red-400" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        dietary_habit: formData.dietary_habit,
        medical_conditions: formData.medical_conditions,
        lifestyle: formData.lifestyle,
      };

      await updateProfile(payload);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-8 text-center text-text-secondary">
        Loading health profile...
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmiCat = getBMICategory(bmi);

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-accent-gradient bg-clip-text text-transparent">
            Health Profile
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure your baseline physiological parameters
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-sm transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-6 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-accent-secondary text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-6 rounded-xl border border-green-500/20 bg-green-500/10 text-sm text-success text-center">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: BMI & Quick Stats */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl text-center flex flex-col items-center justify-center">
            <span className="text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
              Body Mass Index (BMI)
            </span>
            <div className="text-5xl font-mono font-bold text-accent-primary my-2">
              {bmi}
            </div>
            <span className={`text-sm font-semibold ${bmiCat.color}`}>
              {bmiCat.label}
            </span>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-xs text-text-secondary">Height</span>
              <span className="text-sm font-semibold">{formData.height} cm</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-xs text-text-secondary">Weight</span>
              <span className="text-sm font-semibold">{formData.weight} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Gender</span>
              <span className="text-sm font-semibold capitalize">{formData.gender}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Fields */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                  Age (years)
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  disabled={!isEditing}
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder-white/30 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 disabled:opacity-50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                  Biological Gender
                </label>
                <select
                  name="gender"
                  disabled={!isEditing}
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 disabled:opacity-50 transition-all"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  required
                  disabled={!isEditing}
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder-white/30 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 disabled:opacity-50 transition-all"
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
                  disabled={!isEditing}
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder-white/30 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                  Dietary Habit
                </label>
                <select
                  name="dietary_habit"
                  disabled={!isEditing}
                  value={formData.dietary_habit}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 disabled:opacity-50 transition-all"
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
                  disabled={!isEditing}
                  value={formData.lifestyle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 disabled:opacity-50 transition-all"
                >
                  <option value="moderate">Moderate Activity</option>
                  <option value="active">High Activity (Active)</option>
                  <option value="sedentary">Low Activity (Sedentary)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                Existing Medical Conditions
              </label>
              <input
                type="text"
                name="medical_conditions"
                disabled={!isEditing}
                value={formData.medical_conditions}
                onChange={handleChange}
                placeholder="Separate with commas"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder-white/30 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 disabled:opacity-50 transition-all"
              />
            </div>

            {isEditing && (
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-accent-gradient text-white font-semibold rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-accent-primary/20 active:scale-95 transition-all"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
