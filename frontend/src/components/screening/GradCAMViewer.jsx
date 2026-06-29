import React, { useState } from 'react';
import Card from '../common/Card';

const GradCAMViewer = ({ explanation = {} }) => {
  const [activeTab, setActiveTab] = useState('');

  // Find which modalities have Grad-CAM overlays
  const availableModalities = [];
  if (explanation.gradcam_eye) availableModalities.push({ id: 'eye', label: 'Eyelid', url: explanation.gradcam_eye });
  if (explanation.gradcam_nail) availableModalities.push({ id: 'nail', label: 'Nail Bed', url: explanation.gradcam_nail });
  if (explanation.gradcam_tongue) availableModalities.push({ id: 'tongue', label: 'Tongue', url: explanation.gradcam_tongue });

  // Auto-select first tab if not set
  if (activeTab === '' && availableModalities.length > 0) {
    setActiveTab(availableModalities[0].id);
  }

  if (availableModalities.length === 0) return null;

  const activeMod = availableModalities.find(m => m.id === activeTab);

  return (
    <Card className="bg-slate-900/50 border border-slate-800">
      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-slate-100">Grad-CAM Explainability maps</h3>
        
        {/* Modality Toggles */}
        <div className="flex gap-2">
          {availableModalities.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all duration-200 ${
                activeTab === m.id
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-slate-950/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {activeMod && (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-800 shadow-lg">
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${activeMod.url}`} 
              alt={`Grad-CAM ${activeMod.label}`} 
              className="w-full h-auto object-contain"
            />
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 p-3 backdrop-blur-md">
              <span className="text-[10px] text-teal-400 font-bold block mb-1">AI Attention Hotspots</span>
              <p className="text-[10px] text-slate-300 leading-normal">
                Red/orange regions represent high feature importance identified by the CNN to estimate pallor severity.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default GradCAMViewer;
