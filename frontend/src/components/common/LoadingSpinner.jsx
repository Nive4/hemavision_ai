import React from 'react';

const LoadingSpinner = ({ message = "Analyzing clinical data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-teal-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 border-r-teal-500 animate-spin"></div>
      </div>
      <p className="text-teal-400 font-medium text-sm animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
