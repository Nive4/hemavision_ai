import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, RefreshCw, Check } from "lucide-react";

export default function CameraCaptureModal({ isOpen, onClose, onCapture, title = "Capture Image" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    setError("");
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please ensure you have granted camera permissions.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    // Cleanup on unmount or when modal closes
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageDataUrl);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      // Convert base64 data URL to File object
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
          onCapture(file, capturedImage); // Return both File and preview URL
          onClose();
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-bg-secondary border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <Camera className="w-5 h-5 text-accent-primary" />
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera/Preview Area */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center p-6 text-red-400">
              <p className="mb-2 text-sm">{error}</p>
              <button 
                onClick={startCamera}
                className="px-4 py-2 mt-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover transform scale-x-[-1]" 
              // Note: scale-x-[-1] mirrors the video which is usually better for front-facing cameras, 
              // but for environment cameras it might be better without. We leave it as a mirror effect for now.
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-6 flex justify-center items-center gap-4 bg-bg-secondary">
          {!capturedImage && !error && (
            <button 
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-white/20 border-[4px] border-accent-primary flex items-center justify-center hover:bg-white/30 hover:scale-105 active:scale-95 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white"></div>
            </button>
          )}

          {capturedImage && (
            <>
              <button 
                onClick={retakePhoto}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary hover:bg-white/10 flex items-center gap-2 transition-all font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button 
                onClick={confirmPhoto}
                className="px-6 py-3 rounded-xl bg-accent-gradient text-white flex items-center gap-2 hover:shadow-lg hover:shadow-accent-primary/20 transition-all font-semibold"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
