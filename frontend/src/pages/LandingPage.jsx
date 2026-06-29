import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Activity, 
  Eye, 
  Fingerprint, 
  MessageSquare, 
  Brain, 
  TrendingUp, 
  ShieldAlert 
} from "lucide-react";

export default function LandingPage() {
  const steps = [
    {
      title: "1. Health Profile Setup",
      description: "Log your baseline age, weight, diet, and lifestyle metrics.",
      icon: Activity,
    },
    {
      title: "2. Sympotom Assessment",
      description: "Answer clinical questions to isolate your symptom risk profile.",
      icon: ShieldAlert,
    },
    {
      title: "3. Multi-Image Upload",
      description: "Provide images of eye conjunctiva, tongue, and nail beds.",
      icon: Eye,
    },
    {
      title: "4. Multi-Modal AI Fusion",
      description: "Our fusion models aggregate data sources for absolute accuracy.",
      icon: Brain,
    },
    {
      title: "5. Visual Explainability",
      description: "See where pallor is identified using Grad-CAM heatmaps.",
      icon: Fingerprint,
    },
    {
      title: "6. Agentic Health Chat",
      description: "Ask questions and monitor your health over time.",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex flex-col items-center bg-bg-primary overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-primary/10 blur-[150px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-primary/20 bg-accent-primary/5 text-accent-secondary text-xs font-mono mb-6 animate-pulse-slow">
          <Activity className="w-3.5 h-3.5" />
          <span>Non-Invasive Early Anemia Screening</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Intelligence for <br className="hidden sm:inline" />
          <span className="bg-accent-gradient bg-clip-text text-transparent">
            Your Cardiovascular Vitality
          </span>
        </h1>
        
        <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          HemaVision AI combines advanced computer vision, symptom assessment, explainable AI (Grad-CAM), and agentic chatbots to identify early signs of anemia without immediately requiring a needle prick.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-gradient text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>Start Free Screening</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 font-semibold rounded-xl text-text-primary transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 z-10 w-full">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-12">
          How HemaVision AI Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-4 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Extra Highlight section for Resume Worthy factor */}
      <section className="max-w-4xl mx-auto px-6 py-12 z-10 w-full mb-16">
        <div className="glass-panel border-accent-primary/20 bg-accent-primary/[0.02] p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center gap-8 md:gap-12 text-left">
          <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-text-primary">
              Multi-Modal Fusion Architecture
            </h3>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-4">
              HemaVision AI doesn't just check one photo. It fuses individual probability scores from your **Eye (Conjunctiva)**, **Nail Beds**, and **Tongue** with clinical **Symptom patterns** and **Health history**. This guarantees much higher sensitivity and specificity than any single-image check.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/70">Eye (EfficientNet)</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/70">Nails (EfficientNet)</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/70">Tongue (Transfer Learning)</span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/70">Symptom Classifier (XGBoost)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
