import { useState } from "react";
import api, { BASE_URL } from "../services/api";
import { 
  ScanHeart, 
  Upload, 
  Camera, 
  CheckCircle2, 
  RefreshCw, 
  HelpCircle, 
  FileText,
  AlertCircle,
  TrendingUp,
  Apple
} from "lucide-react";
import { Link } from "react-router-dom";
import CameraCaptureModal from "../components/CameraCaptureModal";

export default function ScreeningPage() {
  const [eyeFile, setEyeFile] = useState(null);
  const [nailFile, setNailFile] = useState(null);
  const [tongueFile, setTongueFile] = useState(null);

  const [eyePreview, setEyePreview] = useState(null);
  const [nailPreview, setNailPreview] = useState(null);
  const [tonguePreview, setTonguePreview] = useState(null);

  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraModality, setCameraModality] = useState(null);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e, modality) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (modality === "eye") {
        setEyeFile(file);
        setEyePreview(reader.result);
      } else if (modality === "nail") {
        setNailFile(file);
        setNailPreview(reader.result);
      } else if (modality === "tongue") {
        setTongueFile(file);
        setTonguePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const handleCameraCapture = (file, previewUrl) => {
    if (cameraModality === "eye") {
      setEyeFile(file);
      setEyePreview(previewUrl);
    } else if (cameraModality === "nail") {
      setNailFile(file);
      setNailPreview(previewUrl);
    } else if (cameraModality === "tongue") {
      setTongueFile(file);
      setTonguePreview(previewUrl);
    }
    setError("");
  };

  const openCamera = (modality) => {
    setCameraModality(modality);
    setCameraModalOpen(true);
  };

  const handleClearFile = (modality) => {
    if (modality === "eye") {
      setEyeFile(null);
      setEyePreview(null);
    } else if (modality === "nail") {
      setNailFile(null);
      setNailPreview(null);
    } else if (modality === "tongue") {
      setTongueFile(null);
      setTonguePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!eyeFile && !nailFile && !tongueFile) {
      setError("Please select at least one image to perform screening.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    if (eyeFile) formData.append("eye_image", eyeFile);
    if (nailFile) formData.append("nail_image", nailFile);
    if (tongueFile) formData.append("tongue_image", tongueFile);

    // Simulated pipeline step messages for micro-animations
    const steps = [
      "Uploading physiological images...",
      "Analyzing conjunctiva redness patterns...",
      "Extracting fingernail bed microvascular features...",
      "Running EfficientNet convolutional weights...",
      "Fusing modalities with latest symptom scores...",
      "Generating Grad-CAM visualization heatmaps...",
      "Building tailored dietary guidelines..."
    ];

    let currentStep = 0;
    setStep(steps[0]);
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setStep(steps[currentStep]);
      }
    }, 1200);

    try {
      const res = await api.post("/screening", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      clearInterval(stepInterval);
      setResult(res.data);
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setError(err.response?.data?.detail || "Screening failed. Please check backend connection.");
    } finally {
      setLoading(false);
    }
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
    if (score < 75) return "#fb923c"; // orange
    return "#ef476f"; // danger
  };

  // Convert relative url from backend (e.g. /uploads/...) to absolute url
  const getImageUrl = (path) => {
    if (!path) return "";
    const baseUrl = BASE_URL;
    return `${baseUrl}${path}`;
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-accent-gradient bg-clip-text text-transparent flex items-center gap-3">
          <ScanHeart className="w-8 h-8 text-accent-primary" />
          <span>Multimodal Anemia Screening</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Upload clear close-up images of your lower eye conjunctiva, nails, or tongue to detect iron deficit indicators.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 text-sm text-accent-secondary text-center flex items-center justify-center gap-2 max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state screen */}
      {loading && (
        <div className="glass-panel p-8 md:p-12 rounded-3xl text-center flex flex-col items-center justify-center max-w-lg mx-auto py-16">
          <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-accent-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-accent-primary rounded-full animate-spin"></div>
            <ScanHeart className="w-8 h-8 text-accent-primary animate-pulse-slow" />
          </div>
          <h3 className="font-bold text-lg text-text-primary mb-2">Analyzing Biomarkers</h3>
          <p className="text-sm text-accent-secondary font-mono tracking-wide">{step}</p>
        </div>
      )}

      {/* Interactive image upload panel */}
      {!loading && !result && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Eye Modality */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-96 relative">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-text-primary">1. Eye Conjunctiva</h3>
                  <HelpCircle 
                    className="w-4 h-4 text-text-secondary cursor-help hover:text-text-primary transition-all" 
                    title="Gently pull down lower eyelid and capture the inner reddish tissue."
                  />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Pull down your lower eyelid. Ensure bright lighting without heavy glare.
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 hover:border-white/10 rounded-xl overflow-hidden bg-white/5 relative group transition-all">
                {eyePreview ? (
                  <img src={eyePreview} alt="Eye preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <Camera className="w-8 h-8 text-text-secondary mb-2 group-hover:scale-110 transition-all" />
                    <span className="text-xs text-text-secondary">Capture or upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, "eye")}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {eyePreview && (
                <button 
                  onClick={() => handleClearFile("eye")}
                  className="mt-3 text-xs text-accent-primary hover:underline self-center"
                >
                  Clear Selection
                </button>
              )}
              {!eyePreview && (
                <button 
                  onClick={() => openCamera("eye")}
                  className="mt-3 text-xs bg-white/5 border border-white/10 hover:bg-white/10 py-2 px-4 rounded-lg self-center text-text-primary transition-all flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Use Camera
                </button>
              )}
            </div>

            {/* Nails Modality */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-96 relative">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-text-primary">2. Fingernail Beds</h3>
                  <HelpCircle 
                    className="w-4 h-4 text-text-secondary cursor-help hover:text-text-primary transition-all" 
                    title="Take a flat view of fingernail beds in natural sunlight."
                  />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Flat angle of fingernails under natural light. Avoid wearing nail polish.
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 hover:border-white/10 rounded-xl overflow-hidden bg-white/5 relative group transition-all">
                {nailPreview ? (
                  <img src={nailPreview} alt="Nail preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <Camera className="w-8 h-8 text-text-secondary mb-2 group-hover:scale-110 transition-all" />
                    <span className="text-xs text-text-secondary">Capture or upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, "nail")}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {nailPreview && (
                <button 
                  onClick={() => handleClearFile("nail")}
                  className="mt-3 text-xs text-accent-primary hover:underline self-center"
                >
                  Clear Selection
                </button>
              )}
              {!nailPreview && (
                <button 
                  onClick={() => openCamera("nail")}
                  className="mt-3 text-xs bg-white/5 border border-white/10 hover:bg-white/10 py-2 px-4 rounded-lg self-center text-text-primary transition-all flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Use Camera
                </button>
              )}
            </div>

            {/* Tongue Modality */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-96 relative">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-text-primary">3. Tongue Pallor</h3>
                  <HelpCircle 
                    className="w-4 h-4 text-text-secondary cursor-help hover:text-text-primary transition-all" 
                    title="Stick tongue out flat in a bright room."
                  />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Stick tongue out flat. Capture in bright light, avoiding shadows.
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 hover:border-white/10 rounded-xl overflow-hidden bg-white/5 relative group transition-all">
                {tonguePreview ? (
                  <img src={tonguePreview} alt="Tongue preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <Camera className="w-8 h-8 text-text-secondary mb-2 group-hover:scale-110 transition-all" />
                    <span className="text-xs text-text-secondary">Capture or upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, "tongue")}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {tonguePreview && (
                <button 
                  onClick={() => handleClearFile("tongue")}
                  className="mt-3 text-xs text-accent-primary hover:underline self-center"
                >
                  Clear Selection
                </button>
              )}
              {!tonguePreview && (
                <button 
                  onClick={() => openCamera("tongue")}
                  className="mt-3 text-xs bg-white/5 border border-white/10 hover:bg-white/10 py-2 px-4 rounded-lg self-center text-text-primary transition-all flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Use Camera
                </button>
              )}
            </div>

          </div>

          <div className="flex flex-col items-center justify-center pt-4">
            <button
              onClick={handleSubmit}
              className="px-8 py-4 bg-accent-gradient text-white rounded-2xl font-bold shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
            >
              <ScanHeart className="w-5 h-5" />
              <span>Submit Multimodal Screening</span>
            </button>
            <p className="text-text-secondary text-xs mt-3 text-center leading-relaxed max-w-sm">
              Note: Results are fused with your latest symptom quiz. If you haven't taken it, only image indicators are used.
            </p>
          </div>
        </div>
      )}

      {/* Results screen */}
      {!loading && result && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Main Risk gauge dashboard banner */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-8 bg-gradient-to-br from-bg-secondary to-bg-primary">
            
            {/* Risk description */}
            <div className="text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-text-secondary font-mono">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Screening Complete</span>
              </div>
              <h2 className="text-3xl font-extrabold text-text-primary leading-tight">
                Your Risk is {result.final_risk_level}
              </h2>
              <p className="text-sm text-text-secondary max-w-md leading-relaxed">
                Our sensor fusion engine fused the modalities. Eye, nail, and tongue indicators were cross-referenced with your symptom assessments.
              </p>
              
              <div className="flex gap-3">
                <div className={`px-4 py-1.5 rounded-full border text-sm font-semibold capitalize ${getRiskColor(result.final_risk_level)}`}>
                  {result.final_risk_level} Risk Level
                </div>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke={getGaugeColor(result.fusion_score)}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={452}
                  strokeDashoffset={452 - (452 * result.fusion_score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-text-primary">
                  {result.fusion_score}%
                </span>
                <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest mt-0.5">
                  Fusion Score
                </span>
              </div>
            </div>

          </div>

          {/* Grad-CAM Heatmap Grid */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-primary" />
              <span>Grad-CAM Explainability Heatmaps</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Eye CAM */}
              {result.eye_image_path && (
                <div className="glass-panel p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">Eye Conjunctiva</span>
                    <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-text-secondary">
                      Score: {result.eye_score}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[9px] text-text-secondary font-mono">Original</div>
                      <div className="h-28 rounded-lg overflow-hidden border border-white/5 bg-white/5">
                        <img src={getImageUrl(result.eye_image_path)} alt="Eye orig" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-text-secondary font-mono">Grad-CAM Map</div>
                      <div className="h-28 rounded-lg overflow-hidden border border-white/5 bg-white/5">
                        <img src={getImageUrl(result.explanation.gradcam_eye)} alt="Eye cam" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Highlights the vascular bed region in red. Anemic profiles present high reflectivity/pallor.
                  </p>
                </div>
              )}

              {/* Nail CAM */}
              {result.nail_image_path && (
                <div className="glass-panel p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">Fingernail Beds</span>
                    <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-text-secondary">
                      Score: {result.nail_score}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[9px] text-text-secondary font-mono">Original</div>
                      <div className="h-28 rounded-lg overflow-hidden border border-white/5 bg-white/5">
                        <img src={getImageUrl(result.nail_image_path)} alt="Nail orig" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-text-secondary font-mono">Grad-CAM Map</div>
                      <div className="h-28 rounded-lg overflow-hidden border border-white/5 bg-white/5">
                        <img src={getImageUrl(result.explanation.gradcam_nail)} alt="Nail cam" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Highlights the center nail plate region. Pallor in the nail beds correlates with low hemoglobin concentration.
                  </p>
                </div>
              )}

              {/* Tongue CAM */}
              {result.tongue_image_path && (
                <div className="glass-panel p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">Tongue Surface</span>
                    <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-text-secondary">
                      Score: {result.tongue_score}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[9px] text-text-secondary font-mono">Original</div>
                      <div className="h-28 rounded-lg overflow-hidden border border-white/5 bg-white/5">
                        <img src={getImageUrl(result.tongue_image_path)} alt="Tongue orig" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-text-secondary font-mono">Grad-CAM Map</div>
                      <div className="h-28 rounded-lg overflow-hidden border border-white/5 bg-white/5">
                        <img src={getImageUrl(result.explanation.gradcam_tongue)} alt="Tongue cam" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Focuses on the dorsum of the tongue. Glossitis and color loss are key features extracted.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => {
                setResult(null);
                setEyeFile(null);
                setEyePreview(null);
                setNailFile(null);
                setNailPreview(null);
                setTongueFile(null);
                setTonguePreview(null);
              }}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl font-semibold border border-white/5 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Perform Another Test</span>
            </button>
            
            <Link
              to="/nutrition"
              className="px-6 py-3 bg-accent-gradient text-white rounded-xl font-semibold shadow-md shadow-accent-primary/20 hover:shadow-accent-primary/30 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Apple className="w-4 h-4" />
              <span>View Nutrition Plan</span>
            </Link>

            <Link
              to="/progress"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl font-semibold border border-white/5 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Track in Progress Log</span>
            </Link>
          </div>

        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal 
        isOpen={cameraModalOpen} 
        onClose={() => setCameraModalOpen(false)} 
        onCapture={handleCameraCapture}
        title={`Capture ${cameraModality === 'eye' ? 'Eye' : cameraModality === 'nail' ? 'Nails' : 'Tongue'} Image`}
      />

    </div>
  );
}
