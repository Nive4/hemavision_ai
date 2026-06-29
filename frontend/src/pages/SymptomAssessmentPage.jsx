import { useState } from "react";
import SymptomForm from "../components/screening/SymptomForm";
import api from "../services/api";
import { Activity, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";

export default function SymptomAssessmentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});

  const handleSubmit = async (answers) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/assessment", { symptoms: answers });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "normal":
        return "text-success border-success/30 bg-success/5";
      case "mild":
        return "text-warning border-warning/30 bg-warning/5";
      case "moderate":
        return "text-orange-400 border-orange-400/30 bg-orange-400/5";
      case "severe":
        return "text-danger border-danger/30 bg-danger/5";
      default:
        return "text-text-secondary border-white/5 bg-white/5";
    }
  };

  const getGaugeColor = (score) => {
    if (score < 25) return "#06d6a0"; // success
    if (score < 50) return "#ffd166"; // warning
    if (score < 75) return "#fb923c"; // orange-400
    return "#ef476f"; // danger
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-accent-gradient bg-clip-text text-transparent">
          Symptom Risk Assessment
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Answer clinical symptom questions to compute your preliminary anemia risk score
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-accent-secondary text-center">
          {error}
        </div>
      )}

      {!result ? (
        <div className="space-y-6">
          <SymptomForm symptoms={answers} onChange={(k, v) => setAnswers(prev => ({...prev, [k]: v}))} />
          <div className="flex justify-center pt-4">
            <button
              onClick={() => handleSubmit(answers)}
              disabled={loading}
              className="px-8 py-3 bg-accent-gradient text-white rounded-xl font-bold shadow-md shadow-accent-primary/20 hover:shadow-accent-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
              {loading ? "Analyzing..." : "Calculate Risk Score"}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col items-center text-center max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-6">
            <Activity className="w-6 h-6 animate-pulse-slow" />
          </div>

          <h3 className="text-xl font-bold mb-2">Assessment Results</h3>
          <p className="text-sm text-text-secondary mb-8">
            Your risk profile has been computed based on the 14-symptom XGBoost model.
          </p>

          {/* Risk Gauge Circle */}
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            {/* SVG Circle Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke={getGaugeColor(result.risk_score)}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={502}
                strokeDashoffset={502 - (502 * result.risk_score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-mono font-bold text-text-primary">
                {result.risk_score}%
              </span>
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mt-1">
                Risk Score
              </span>
            </div>
          </div>

          {/* Risk Level Badge */}
          <div className={`px-4 py-1.5 rounded-full border text-sm font-semibold mb-8 capitalize ${getRiskColor(result.risk_level)}`}>
            {result.risk_level} Anemia Risk
          </div>

          {/* Notice/Warning box if moderate/severe */}
          {result.risk_score >= 50 && (
            <div className="w-full p-4 mb-8 rounded-2xl border border-orange-400/20 bg-orange-400/5 text-left flex gap-3 text-xs text-orange-300 leading-relaxed">
              <AlertTriangle className="w-5 h-5 shrink-0 text-orange-400" />
              <div>
                <strong className="block text-sm font-bold text-orange-200 mb-0.5">High Risk Detected</strong>
                Your symptoms indicate a higher likelihood of anemia. We strongly recommend scheduling a multi-modal screening or visiting a medical center for a full blood count (FBC).
              </div>
            </div>
          )}

          <div className="flex gap-4 w-full">
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Test</span>
            </button>
            <button
              onClick={() => window.location.href = "/screening"}
              className="flex-1 py-3 bg-accent-gradient text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Do Eye/Nail Screening</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
