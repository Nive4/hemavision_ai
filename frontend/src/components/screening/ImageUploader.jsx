import React, { useRef } from 'react';

const ImageUploader = ({ label, image, onChange, modality }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(modality, e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-teal-500/50 bg-slate-950/40 rounded-xl p-4 transition-all duration-300 w-full min-h-[140px] text-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {image ? (
        <div className="relative w-full flex flex-col items-center">
          <img 
            src={URL.createObjectURL(image)} 
            alt={label} 
            className="w-24 h-24 object-cover rounded-lg border border-slate-700 shadow-md mb-2"
          />
          <span className="text-xs text-slate-300 font-semibold">{label} Loaded</span>
          <button 
            type="button" 
            onClick={() => onChange(modality, null)}
            className="text-[10px] text-red-400 hover:underline mt-1"
          >
            Remove Image
          </button>
        </div>
      ) : (
        <div onClick={triggerSelect} className="cursor-pointer flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 text-lg border border-slate-800">
            📷
          </div>
          <div>
            <span className="text-xs font-bold text-slate-300 block">{label}</span>
            <span className="text-[10px] text-slate-500">Tap to upload clinical photo</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
