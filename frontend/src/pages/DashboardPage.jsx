import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { 
  ScanHeart, 
  Activity, 
  Apple, 
  TrendingUp, 
  UserCircle,
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [latestScreening, setLatestScreening] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all screenings to show recent history
        const screeningsRes = await api.get("/screening");
        setScreenings(screeningsRes.data);
        if (screeningsRes.data.length > 0) {
          setLatestScreening(screeningsRes.data[0]); // screenings are returned sorted by desc date
        }
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
        // Do not fail blockingly, user might not have screenings yet
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "normal":
        return "text-success border-success/20 bg-success/5";
      case "mild":
        return "text-warning border-warning/20 bg-warning/5";
      case "moderate":
        return "text-orange-400 border-orange-400/20 bg-orange-400/5";
      case "severe":
        return "text-danger border-danger/20 bg-danger/5";
      default:
        return "text-text-secondary border-white/5 bg-white/5";
    }
  };

  const getRiskBg = (level) => {
    switch (level?.toLowerCase()) {
      case "normal": return "from-success/20 to-success/5 border-success/30";
      case "mild": return "from-warning/20 to-warning/5 border-warning/30";
      case "moderate": return "from-orange-500/25 to-orange-500/5 border-orange-400/30";
      case "severe": return "from-danger/20 to-danger/5 border-danger/30";
      default: return "from-white/10 to-white/5 border-white/10";
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (!profile || !profile.height || !profile.weight) return "N/A";
    const heightM = profile.height / 100;
    return (profile.weight / (heightM * heightM)).toFixed(1);
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-accent-gradient bg-clip-text text-transparent">
            Welcome, {user?.email?.split("@")[0]}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Monitor your physiological biomarkers and track your anemia screening stats.
          </p>
        </div>
        <div className="text-xs font-mono text-text-secondary bg-bg-secondary px-3 py-1.5 rounded-lg border border-white/5">
          Last login: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Middle: Key Risk Panels & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Latest Result Banner */}
            {latestScreening ? (
              <div className={`p-6 rounded-3xl border bg-gradient-to-br ${getRiskBg(latestScreening.final_risk_level)} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
                <div className="space-y-2">
                  <div className="text-xs font-mono text-text-secondary uppercase tracking-wider">Latest Screening Result</div>
                  <h2 className="text-2xl font-bold text-text-primary">
                    {latestScreening.final_risk_level} Anemia Risk
                  </h2>
                  <p className="text-xs text-text-secondary leading-relaxed max-w-md">
                    Analyzed on {new Date(latestScreening.created_at).toLocaleDateString()} using {Object.keys(latestScreening.explanation?.weights_used || {}).length} biomarkers. Keep monitoring weekly.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-mono font-extrabold text-text-primary">{latestScreening.fusion_score}%</div>
                    <div className="text-[10px] text-text-secondary uppercase font-mono tracking-wider">Fusion Score</div>
                  </div>
                  <Link 
                    to="/progress" 
                    className="p-3 bg-white/10 hover:bg-white/20 text-text-primary rounded-2xl border border-white/10 transition-all flex items-center justify-center hover:scale-105"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl border border-dashed border-white/10 bg-bg-secondary flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-4">
                  <ScanHeart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">No Screening Yet</h3>
                <p className="text-xs text-text-secondary max-w-xs mb-4">
                  Take your first image-based eye, nail, or tongue screening to analyze anemia indicators.
                </p>
                <Link 
                  to="/screening" 
                  className="px-4 py-2 bg-accent-gradient hover:shadow-lg hover:shadow-accent-primary/20 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  Start Screening
                </Link>
              </div>
            )}

            {/* Quick Actions Grid */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-primary" />
                <span>Quick Actions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link 
                  to="/screening"
                  className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-start gap-4 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary group-hover:scale-110 transition-all">
                    <ScanHeart className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-text-primary group-hover:text-accent-secondary transition-all">Eye/Nail Screening</h4>
                    <p className="text-xs text-text-secondary mt-1">Upload physiological images for AI pallor analysis.</p>
                  </div>
                </Link>

                <Link 
                  to="/assessment"
                  className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-start gap-4 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-success group-hover:scale-110 transition-all">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-text-primary group-hover:text-success transition-all">Symptom Quiz</h4>
                    <p className="text-xs text-text-secondary mt-1">Answer 14 clinical questions to calculate your risk.</p>
                  </div>
                </Link>

                <Link 
                  to="/nutrition"
                  className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-start gap-4 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning group-hover:scale-110 transition-all">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-text-primary group-hover:text-warning transition-all">Nutrition Engine</h4>
                    <p className="text-xs text-text-secondary mt-1">Explore customized weekly meal planners & boosters.</p>
                  </div>
                </Link>

                <Link 
                  to="/chat"
                  className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-start gap-4 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary group-hover:scale-110 transition-all">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-text-primary group-hover:text-accent-secondary transition-all">AI Health Assistant</h4>
                    <p className="text-xs text-text-secondary mt-1">Chat about iron supplements, diets, and hemoglobin.</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Health Tips / Information Box */}
            <div className="p-5 rounded-2xl border border-white/5 bg-bg-secondary flex gap-4 text-xs text-text-secondary leading-relaxed">
              <ShieldCheck className="w-6 h-6 text-success shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-text-primary mb-1">Self-Monitoring and Support</strong>
                HemaVision AI provides physiological risk assessments designed to support clinical evaluation. It is not a direct diagnostic tool. Always cross-reference results with laboratory tests (such as Serum Ferritin or Hemoglobin) for absolute confirmation.
              </div>
            </div>

          </div>

          {/* Right Column: Health Profile & Recent History */}
          <div className="space-y-8">
            
            {/* Health Profile Overview */}
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-accent-primary" />
                  <span>Your Health Profile</span>
                </h3>
                <Link to="/profile" className="text-xs text-accent-secondary hover:underline flex items-center gap-0.5">
                  <span>Edit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {profile ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-text-secondary">Age / Gender</div>
                      <div className="font-semibold text-text-primary mt-0.5 capitalize">{profile.age} yrs / {profile.gender}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-text-secondary">BMI Ratio</div>
                      <div className="font-semibold text-text-primary mt-0.5">{calculateBMI()} ({profile.weight}kg)</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-text-secondary">Dietary Pattern</div>
                    <div className="font-semibold text-text-primary mt-0.5 capitalize">{profile.dietary_habit}</div>
                  </div>
                  {profile.medical_conditions && (
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-text-secondary">Conditions</div>
                      <div className="font-semibold text-text-primary mt-0.5">{profile.medical_conditions}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-text-secondary mb-3">No health profile setup yet.</p>
                  <Link 
                    to="/profile-setup" 
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/5 transition-all inline-block"
                  >
                    Setup Profile
                  </Link>
                </div>
              )}
            </div>

            {/* History Feed */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-primary" />
                <span>Recent History</span>
              </h3>
              
              <div className="space-y-3">
                {screenings.slice(0, 4).map((scr, idx) => (
                  <div 
                    key={scr.id || idx}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex justify-between items-center"
                  >
                    <div>
                      <div className="text-xs font-bold text-text-primary capitalize">{scr.final_risk_level} Risk</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">
                        {new Date(scr.created_at).toLocaleDateString()} • {scr.eye_score !== null ? 'Eye ' : ''}{scr.nail_score !== null ? 'Nail ' : ''}{scr.tongue_score !== null ? 'Tongue' : ''}
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-text-primary">{scr.fusion_score}%</div>
                  </div>
                ))}

                {screenings.length === 0 && (
                  <div className="text-center py-6 text-xs text-text-secondary">
                    No history records found.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
