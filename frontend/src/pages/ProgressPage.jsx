import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  HelpCircle, 
  Download, 
  Eye,
  Info,
  RefreshCw,
  ScanHeart
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ProgressPage() {
  const [progressData, setProgressData] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Selected screening details for detail popup
  const [activeScreening, setActiveScreening] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const [progressRes, screeningsRes] = await Promise.all([
          api.get("/progress"),
          api.get("/screening")
        ]);
        setProgressData(progressRes.data);
        setScreenings(screeningsRes.data);
      } catch (err) {
        console.error("Progress data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, []);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "normal": return "text-success border-success/30 bg-success/5";
      case "mild": return "text-warning border-warning/30 bg-warning/5";
      case "moderate": return "text-orange-400 border-orange-400/30 bg-orange-400/5";
      case "severe": return "text-danger border-danger/30 bg-danger/5";
      default: return "text-text-secondary border-white/5 bg-white/5";
    }
  };

  // Generate SVG points for the progress line chart
  const renderSVGChart = () => {
    if (progressData.length === 0) return null;
    
    const width = 600;
    const height = 200;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxWeek = progressData.length;
    // Map data points
    const points = progressData.map((d, index) => {
      const x = padding + (index / Math.max(1, maxWeek - 1)) * chartWidth;
      // y is inverted (100% is top/0, 0% is bottom/chartHeight)
      const y = padding + chartHeight - (d.risk_score / 100) * chartHeight;
      return { x, y, ...d };
    });

    // Create Path String
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Create Area/Shading Path
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e63946" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e63946" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((level) => {
          const y = padding + chartHeight - (level / 100) * chartHeight;
          return (
            <g key={level}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fill="rgba(255, 255, 255, 0.3)"
                fontSize="8px"
                fontFamily="monospace"
                textAnchor="end"
              >
                {level}%
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* Connecting Line */}
        <path d={pathD} fill="transparent" stroke="#e63946" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Circular dots */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#e63946"
              stroke="#0a0a0f"
              strokeWidth="2"
            />
            {/* Tooltip on dot */}
            <title>Week {p.week_number}: {p.risk_score}%</title>
          </g>
        ))}

        {/* Weeks Labels */}
        {points.map((p, idx) => (
          <text
            key={idx}
            x={p.x}
            y={height - padding + 15}
            fill="rgba(255, 255, 255, 0.4)"
            fontSize="9px"
            fontFamily="monospace"
            textAnchor="middle"
          >
            W{p.week_number}
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold bg-accent-gradient bg-clip-text text-transparent flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-accent-primary" />
          <span>Progress & Analytics</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitor your weekly risk scores over time to visualize improvement and recovery trends.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Progress Line Chart */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-primary" />
                  <span>Anemia Risk Score Trend</span>
                </h3>
                <span className="text-[10px] text-text-secondary bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono">
                  Weekly Tracking
                </span>
              </div>

              {progressData.length > 0 ? (
                <div className="h-60 flex items-center justify-center relative bg-bg-secondary/40 p-4 rounded-2xl border border-white/5">
                  {renderSVGChart()}
                </div>
              ) : (
                <div className="h-60 flex flex-col items-center justify-center text-center p-8 bg-bg-secondary/40 rounded-2xl border border-dashed border-white/10">
                  <ScanHeart className="w-10 h-10 text-text-secondary mb-3" />
                  <h4 className="font-bold text-sm">No Tracking Data Available</h4>
                  <p className="text-xs text-text-secondary max-w-xs mt-1 mb-4">
                    Submit weekly screenings to map out your risk progression graph.
                  </p>
                  <Link to="/screening" className="px-4 py-2 bg-accent-gradient text-white text-xs font-semibold rounded-xl hover:shadow-md transition-all">
                    Start First Screening
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-text-secondary font-mono">First Score</div>
                  <div className="text-xl font-bold font-mono mt-0.5 text-text-primary">
                    {progressData.length > 0 ? `${progressData[0].risk_score}%` : "N/A"}
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-text-secondary font-mono">Current Score</div>
                  <div className="text-xl font-bold font-mono mt-0.5 text-text-primary">
                    {progressData.length > 0 ? `${progressData[progressData.length - 1].risk_score}%` : "N/A"}
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-text-secondary font-mono">Total Weeks</div>
                  <div className="text-xl font-bold font-mono mt-0.5 text-text-primary">
                    {progressData.length}
                  </div>
                </div>
              </div>

            </div>

            {/* Historical Details List */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-sm text-text-primary">All Screening Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-text-secondary">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Risk Level</th>
                      <th className="pb-3 font-semibold">Biomarkers</th>
                      <th className="pb-3 font-semibold text-right">Fusion Score</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {screenings.map((scr, idx) => (
                      <tr key={scr.id || idx} className="hover:bg-white/5 transition-all">
                        <td className="py-3 font-mono text-text-primary">
                          {new Date(scr.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize ${getRiskColor(scr.final_risk_level)}`}>
                            {scr.final_risk_level}
                          </span>
                        </td>
                        <td className="py-3 text-text-secondary">
                          {scr.eye_score !== null && "Eye "}
                          {scr.nail_score !== null && "Nail "}
                          {scr.tongue_score !== null && "Tongue"}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-text-primary">
                          {scr.fusion_score}%
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setActiveScreening(scr)}
                            className="text-accent-secondary hover:underline flex items-center gap-1 ml-auto text-[11px]"
                          >
                            <span>Explain</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {screenings.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-text-secondary">
                          No screening records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Active Screening Overlay details (if clicked) */}
          <div className="space-y-6">
            
            {activeScreening ? (
              <div className="glass-panel p-6 rounded-3xl space-y-5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent-primary" />
                    <span>Explainability Summary</span>
                  </h3>
                  <button 
                    onClick={() => setActiveScreening(null)} 
                    className="text-xs text-text-secondary hover:text-text-primary"
                  >
                    Close
                  </button>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Risk Classification:</span>
                    <span className="font-bold text-text-primary capitalize">{activeScreening.final_risk_level} Anemia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Fused Confidence:</span>
                    <span className="font-mono font-bold text-text-primary">{activeScreening.fusion_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Date Analyzed:</span>
                    <span className="text-text-primary">{new Date(activeScreening.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-text-secondary">Individual Biomarkers & Heatmaps</div>
                  
                  {activeScreening.explanation?.gradcam_eye && (
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${activeScreening.explanation.gradcam_eye}`} 
                          alt="Eye Gradcam" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[10px]">
                        <div className="font-bold text-text-primary">Eye Conjunctiva Eyelid</div>
                        <div className="text-text-secondary mt-0.5">Model score: {activeScreening.eye_score}%</div>
                      </div>
                    </div>
                  )}

                  {activeScreening.explanation?.gradcam_nail && (
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${activeScreening.explanation.gradcam_nail}`} 
                          alt="Nail Gradcam" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[10px]">
                        <div className="font-bold text-text-primary">Fingernail Beds</div>
                        <div className="text-text-secondary mt-0.5">Model score: {activeScreening.nail_score}%</div>
                      </div>
                    </div>
                  )}

                  {activeScreening.explanation?.gradcam_tongue && (
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${activeScreening.explanation.gradcam_tongue}`} 
                          alt="Tongue Gradcam" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[10px]">
                        <div className="font-bold text-text-primary">Tongue Surface</div>
                        <div className="text-text-secondary mt-0.5">Model score: {activeScreening.tongue_score}%</div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="glass-panel p-6 rounded-3xl text-center py-10 flex flex-col items-center justify-center border border-dashed border-white/10 text-xs text-text-secondary">
                <Info className="w-8 h-8 text-text-secondary mb-3" />
                <span>Click "Explain" on any screening record to inspect model details and heatmap activations.</span>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
