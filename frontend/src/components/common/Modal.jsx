import React from 'react';
import Card from './Card';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-lg z-10 animate-fade-in-up">
        <Card className={`border border-slate-700/50 bg-slate-900/90 shadow-2xl ${className}`} hoverEffect={false}>
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors text-xl font-bold"
            >
              &times;
            </button>
          </div>
          <div className="mb-6">{children}</div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Modal;
